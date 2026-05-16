from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class DatasetInfo(BaseModel):
    id: str
    title: str
    description: str
    filename: str
    row_count: int | None = None


class DatasetSample(DatasetInfo):
    content: str


class AnalyzeRequest(BaseModel):
    dataset_id: str | None = "sample"
    csv_text: str | None = None
    filename: str | None = None


class KpiSummary(BaseModel):
    cases: int
    events: int
    activities: int
    median_case_duration_hours: float
    mean_case_duration_hours: float
    sla_violation_rate: float
    total_cost: float
    average_cost_per_case: float


class BottleneckTransition(BaseModel):
    transition: str
    from_activity: str
    to_activity: str
    count: int
    average_wait_hours: float
    median_wait_hours: float
    p90_wait_hours: float


class ActivityWaitingTime(BaseModel):
    activity: str
    count: int
    average_wait_hours: float
    median_wait_hours: float


class VariantRow(BaseModel):
    variant: str
    activities: list[str]
    count: int
    percent: float
    cumulative_percent: float


class SlaBreakdownRow(BaseModel):
    group: str
    total_cases: int
    violations: int
    violation_rate: float
    average_duration_hours: float


class ReworkActivity(BaseModel):
    activity: str
    repeat_cases: int
    total_repeats: int


class ReworkSummary(BaseModel):
    rework_cases: int
    rework_rate: float
    repeated_activity_count: int
    top_repeated_activities: list[ReworkActivity]


class ProcessEdge(BaseModel):
    from_activity: str
    to_activity: str
    count: int
    average_hours: float


class RecommendationCard(BaseModel):
    title: str
    priority: Literal["High", "Medium", "Low"]
    rationale: str
    suggested_action: str
    metric: str


class ExecutiveSummary(BaseModel):
    headline: str
    narrative: str
    key_findings: list[str]


class AnalysisResponse(BaseModel):
    dataset_name: str
    generated_at: str
    kpis: KpiSummary
    bottleneck_transitions: list[BottleneckTransition]
    activity_waiting_times: list[ActivityWaitingTime]
    variants: list[VariantRow]
    sla_by_priority: list[SlaBreakdownRow]
    sla_by_department: list[SlaBreakdownRow]
    sla_by_resource: list[SlaBreakdownRow]
    sla_by_segment: list[SlaBreakdownRow] = Field(alias="sla_by_customer_segment")
    rework: ReworkSummary
    process_edges: list[ProcessEdge]
    recommendations: list[RecommendationCard]
    executive_summary: ExecutiveSummary
    warnings: list[str] = []

    model_config = {"populate_by_name": True}


class ExportRequest(BaseModel):
    analysis: AnalysisResponse
    format: Literal["markdown", "json"] = "markdown"


class AssistantRequest(BaseModel):
    analysis: AnalysisResponse
    question: str
    use_llm: bool = False


class AssistantResponse(BaseModel):
    mode: Literal["deterministic", "openai_compatible"]
    status: Literal["completed", "disabled", "not_configured", "error"]
    answer: str
    provider: str | None = None
    model: str | None = None
    error: str | None = None
