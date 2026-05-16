from __future__ import annotations

from datetime import datetime, timezone

from backend.app.core.bottlenecks import (
    calculate_activity_waiting_times,
    calculate_bottlenecks,
    calculate_process_edges,
)
from backend.app.core.kpis import calculate_kpis
from backend.app.core.load_event_log import load_csv_text
from backend.app.core.preprocess import prepare_event_log
from backend.app.core.recommendations import generate_recommendations
from backend.app.core.report_generation import build_executive_summary
from backend.app.core.sla import calculate_sla_breakdown
from backend.app.core.variants import calculate_rework, calculate_variants
from backend.app.schemas import AnalysisResponse


def analyze_event_log_csv(csv_text: str, dataset_name: str = "Uploaded event log") -> AnalysisResponse:
    raw = load_csv_text(csv_text, source_name=dataset_name)
    events, cases, warnings = prepare_event_log(raw)

    kpis = calculate_kpis(events, cases)
    bottlenecks = calculate_bottlenecks(events)
    activity_waiting_times = calculate_activity_waiting_times(events)
    variants = calculate_variants(events)
    rework = calculate_rework(events)
    sla_by_priority = calculate_sla_breakdown(cases, "priority")
    sla_by_department = calculate_sla_breakdown(cases, "department")
    sla_by_resource = calculate_sla_breakdown(cases, "resource")
    sla_by_segment = calculate_sla_breakdown(cases, "customer_segment")
    process_edges = calculate_process_edges(events)

    partial = AnalysisResponse(
        dataset_name=dataset_name,
        generated_at=datetime.now(timezone.utc).isoformat(),
        kpis=kpis,
        bottleneck_transitions=bottlenecks,
        activity_waiting_times=activity_waiting_times,
        variants=variants,
        sla_by_priority=sla_by_priority,
        sla_by_department=sla_by_department,
        sla_by_resource=sla_by_resource,
        sla_by_customer_segment=sla_by_segment,
        rework=rework,
        process_edges=process_edges,
        recommendations=[],
        executive_summary={"headline": "", "narrative": "", "key_findings": []},
        warnings=warnings,
    )
    recommendations = generate_recommendations(kpis, bottlenecks, sla_by_priority, sla_by_department, rework, variants)
    analysis = partial.model_copy(update={"recommendations": recommendations})
    return analysis.model_copy(update={"executive_summary": build_executive_summary(analysis)})

