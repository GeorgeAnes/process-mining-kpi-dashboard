from __future__ import annotations

from backend.app.schemas import AnalysisResponse, ExecutiveSummary


def build_executive_summary(analysis: AnalysisResponse) -> ExecutiveSummary:
    top_bottleneck = analysis.bottleneck_transitions[0] if analysis.bottleneck_transitions else None
    top_variant = analysis.variants[0] if analysis.variants else None
    headline = f"{analysis.kpis.sla_violation_rate}% SLA violation rate across {analysis.kpis.cases} service cases"

    findings = [
        f"Median case duration is {analysis.kpis.median_case_duration_hours} hours.",
        f"Mean case duration is {analysis.kpis.mean_case_duration_hours} hours.",
        f"Rework appears in {analysis.rework.rework_rate}% of cases.",
    ]
    if top_bottleneck:
        findings.append(f"Top bottleneck is {top_bottleneck.transition} at {top_bottleneck.average_wait_hours} average hours.")
    if top_variant:
        findings.append(f"The most common process variant covers {top_variant.percent}% of cases.")

    narrative = (
        "The event log shows where service work waits, repeats, and misses SLA expectations. "
        "The results are deterministic and intended to guide human review, not replace operational judgement."
    )
    return ExecutiveSummary(headline=headline, narrative=narrative, key_findings=findings)


def to_markdown_report(analysis: AnalysisResponse) -> str:
    lines = [
        f"# Process Mining KPI Report: {analysis.dataset_name}",
        "",
        f"Generated: {analysis.generated_at}",
        "",
        "## Executive Summary",
        "",
        analysis.executive_summary.headline,
        "",
        analysis.executive_summary.narrative,
        "",
        "## KPI Snapshot",
        "",
        f"- Cases: {analysis.kpis.cases}",
        f"- Events: {analysis.kpis.events}",
        f"- Activities: {analysis.kpis.activities}",
        f"- Median case duration: {analysis.kpis.median_case_duration_hours} hours",
        f"- Mean case duration: {analysis.kpis.mean_case_duration_hours} hours",
        f"- SLA violation rate: {analysis.kpis.sla_violation_rate}%",
        "",
        "## Top Bottlenecks",
        "",
    ]

    for item in analysis.bottleneck_transitions[:5]:
        lines.append(f"- {item.transition}: {item.average_wait_hours}h average wait across {item.count} transitions")

    lines.extend(["", "## Recommendations", ""])
    for card in analysis.recommendations:
        lines.append(f"- **{card.priority}: {card.title}** - {card.suggested_action}")

    lines.extend(["", "## Data Notes", ""])
    if analysis.warnings:
        lines.extend(f"- {warning}" for warning in analysis.warnings)
    else:
        lines.append("- No parsing warnings.")

    return "\n".join(lines) + "\n"

