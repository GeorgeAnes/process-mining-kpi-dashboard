from __future__ import annotations

import json
import os
import urllib.error
import urllib.request

from dotenv import load_dotenv

from backend.app.schemas import AnalysisResponse, AssistantResponse


def answer_question(analysis: AnalysisResponse, question: str, use_llm: bool = False) -> AssistantResponse:
    if use_llm:
        response = _try_openai_compatible(analysis, question)
        if response.status == "completed":
            return response
    return AssistantResponse(mode="deterministic", status="completed", answer=_deterministic_answer(analysis, question))


def _deterministic_answer(analysis: AnalysisResponse, question: str) -> str:
    lower = question.lower()
    if "bottleneck" in lower or "slow" in lower or "wait" in lower:
        if not analysis.bottleneck_transitions:
            return "No bottleneck transitions were detected because the log does not contain multi-step cases."
        top = analysis.bottleneck_transitions[0]
        return (
            f"The largest bottleneck is {top.transition}, with {top.average_wait_hours} average hours "
            f"between activities across {top.count} observed transitions."
        )

    if "sla" in lower or "violation" in lower or "drive" in lower:
        candidates = analysis.sla_by_priority + analysis.sla_by_department + analysis.sla_by_segment
        if not candidates:
            return f"The overall SLA violation rate is {analysis.kpis.sla_violation_rate}%."
        top = sorted(candidates, key=lambda row: (row.violation_rate, row.total_cases), reverse=True)[0]
        return (
            f"The highest SLA pressure appears in {top.group}, with {top.violation_rate}% violations "
            f"across {top.total_cases} cases. Overall SLA violation rate is {analysis.kpis.sla_violation_rate}%."
        )

    if "improve" in lower or "recommend" in lower or "management" in lower or "first" in lower:
        if not analysis.recommendations:
            return "No recommendation cards were generated for this log."
        card = analysis.recommendations[0]
        return f"Management should start with: {card.title}. {card.rationale} Suggested action: {card.suggested_action}"

    if "variant" in lower:
        if not analysis.variants:
            return "No process variants were detected."
        top = analysis.variants[0]
        return f"The top variant covers {top.percent}% of cases: {top.variant}."

    return (
        f"This log contains {analysis.kpis.cases} cases, {analysis.kpis.events} events, "
        f"{analysis.kpis.activities} activities, and a {analysis.kpis.sla_violation_rate}% SLA violation rate. "
        "Ask about bottlenecks, SLA drivers, variants, or management recommendations for a more focused answer."
    )


def _try_openai_compatible(analysis: AnalysisResponse, question: str) -> AssistantResponse:
    load_dotenv()
    mode = os.getenv("LLM_MODE", "off").strip().lower()
    if mode != "openai_compatible":
        return AssistantResponse(
            mode="openai_compatible",
            status="disabled",
            answer="LLM mode is disabled. Deterministic assistant is available.",
        )

    base_url = os.getenv("OPENAI_BASE_URL", "").rstrip("/")
    api_key = os.getenv("OPENAI_API_KEY", "")
    model = os.getenv("OPENAI_MODEL", "")
    if not base_url or not api_key or not model:
        return AssistantResponse(
            mode="openai_compatible",
            status="not_configured",
            answer="OpenAI-compatible mode requires OPENAI_BASE_URL, OPENAI_API_KEY, and OPENAI_MODEL.",
            provider="openai_compatible",
            model=model or None,
        )

    prompt = _build_prompt(analysis, question)
    try:
        text = _call_openai_compatible(base_url, api_key, model, prompt)
        return AssistantResponse(
            mode="openai_compatible",
            status="completed",
            answer=text,
            provider="openai_compatible",
            model=model,
        )
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, ValueError) as exc:
        return AssistantResponse(
            mode="openai_compatible",
            status="error",
            answer="The LLM assistant failed. Deterministic analytics remain available.",
            provider="openai_compatible",
            model=model,
            error=str(exc),
        )


def _build_prompt(analysis: AnalysisResponse, question: str) -> str:
    top_bottleneck = analysis.bottleneck_transitions[0].model_dump() if analysis.bottleneck_transitions else {}
    top_recommendations = [card.model_dump() for card in analysis.recommendations[:3]]
    summary = {
        "dataset": analysis.dataset_name,
        "kpis": analysis.kpis.model_dump(),
        "top_bottleneck": top_bottleneck,
        "sla_by_priority": [row.model_dump() for row in analysis.sla_by_priority],
        "rework": analysis.rework.model_dump(),
        "recommendations": top_recommendations,
    }
    return (
        "You are an executive process-mining insight assistant. Answer briefly and only use the provided metrics.\n"
        f"Metrics JSON:\n{json.dumps(summary, indent=2)}\n\n"
        f"Question: {question}"
    )


def _call_openai_compatible(base_url: str, api_key: str, model: str, prompt: str) -> str:
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "You explain process-mining KPIs for business stakeholders."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.3,
        "max_tokens": 500,
    }
    request = urllib.request.Request(
        f"{base_url}/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=20) as response:
        data = json.loads(response.read().decode("utf-8"))

    choices = data.get("choices", [])
    if not choices:
        raise ValueError("OpenAI-compatible endpoint returned no choices.")
    text = str(choices[0].get("message", {}).get("content", "")).strip()
    if not text:
        raise ValueError("OpenAI-compatible endpoint returned no text.")
    return text

