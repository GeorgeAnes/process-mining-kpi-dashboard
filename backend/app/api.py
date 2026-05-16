from __future__ import annotations

import json
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse, Response
from starlette.datastructures import UploadFile

from backend.app.core.assistant import answer_question
from backend.app.core.load_event_log import EventLogError
from backend.app.core.pipeline import analyze_event_log_csv
from backend.app.core.report_generation import to_markdown_report
from backend.app.schemas import (
    AnalysisResponse,
    AnalyzeRequest,
    AssistantRequest,
    AssistantResponse,
    DatasetInfo,
    DatasetSample,
    ExportRequest,
)


REPO_ROOT = Path(__file__).resolve().parents[2]
SAMPLE_PATH = REPO_ROOT / "data" / "sample_event_log.csv"

SAMPLE_DATASET = DatasetInfo(
    id="sample",
    title="Synthetic IT Service Ticket Log",
    description="Synthetic incident-management event log for local process-mining demos.",
    filename="sample_event_log.csv",
)

app = FastAPI(
    title="Process Mining KPI Dashboard",
    version="0.1.0",
    description="Local process-mining and KPI analytics API for event-log data.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/datasets", response_model=list[DatasetInfo])
def datasets() -> list[DatasetInfo]:
    sample = SAMPLE_DATASET.model_copy(update={"row_count": _sample_row_count()})
    return [sample]


@app.get("/datasets/sample", response_model=DatasetSample)
def sample_dataset() -> DatasetSample:
    return DatasetSample(**SAMPLE_DATASET.model_dump(exclude={"row_count"}), row_count=_sample_row_count(), content=_read_sample())


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze(request: Request) -> AnalysisResponse:
    try:
        payload = await _parse_analyze_request(request)
        csv_text, dataset_name = _resolve_csv(payload)
        return analyze_event_log_csv(csv_text, dataset_name=dataset_name)
    except EventLogError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/export", response_model=None)
def export_report(payload: ExportRequest) -> Response:
    if payload.format == "json":
        return JSONResponse(content=json.loads(payload.analysis.model_dump_json(by_alias=True)))
    return PlainTextResponse(content=to_markdown_report(payload.analysis), media_type="text/markdown")


@app.post("/assistant", response_model=AssistantResponse)
def assistant(payload: AssistantRequest) -> AssistantResponse:
    return answer_question(payload.analysis, payload.question, use_llm=payload.use_llm)


async def _parse_analyze_request(request: Request) -> AnalyzeRequest:
    content_type = request.headers.get("content-type", "")
    if "multipart/form-data" in content_type:
        form = await request.form()
        csv_text = _form_value(form.get("csv_text"))
        dataset_id = _form_value(form.get("dataset_id"))
        filename = _form_value(form.get("filename"))
        uploaded = form.get("file")
        if isinstance(uploaded, UploadFile) and uploaded.filename:
            csv_text = (await uploaded.read()).decode("utf-8-sig")
            filename = uploaded.filename
        return AnalyzeRequest(csv_text=csv_text, dataset_id=dataset_id, filename=filename)

    data = await request.json()
    return AnalyzeRequest.model_validate(data)


def _resolve_csv(payload: AnalyzeRequest) -> tuple[str, str]:
    if payload.csv_text and payload.csv_text.strip():
        return payload.csv_text, payload.filename or "Uploaded event log"

    if payload.dataset_id in (None, "", "sample"):
        return _read_sample(), SAMPLE_DATASET.title

    raise EventLogError(f"Unknown dataset_id '{payload.dataset_id}'.")


def _read_sample() -> str:
    if not SAMPLE_PATH.exists():
        raise HTTPException(status_code=500, detail="Sample event log is missing.")
    return SAMPLE_PATH.read_text(encoding="utf-8")


def _sample_row_count() -> int:
    if not SAMPLE_PATH.exists():
        return 0
    return max(len(_read_sample().splitlines()) - 1, 0)


def _form_value(value: object) -> str | None:
    if value is None or isinstance(value, UploadFile):
        return None
    text = str(value).strip()
    return text or None
