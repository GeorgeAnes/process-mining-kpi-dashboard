from __future__ import annotations

from backend.app.schemas import (
    BottleneckTransition,
    KpiSummary,
    RecommendationCard,
    ReworkSummary,
    SlaBreakdownRow,
    VariantRow,
)


def generate_recommendations(
    kpis: KpiSummary,
    bottlenecks: list[BottleneckTransition],
    sla_by_priority: list[SlaBreakdownRow],
    sla_by_department: list[SlaBreakdownRow],
    rework: ReworkSummary,
    variants: list[VariantRow],
) -> list[RecommendationCard]:
    cards: list[RecommendationCard] = []

    if bottlenecks:
        top = bottlenecks[0]
        cards.append(
            RecommendationCard(
                title=f"Reduce wait time on {top.transition}",
                priority="High",
                rationale=f"This transition has the highest average wait at {top.average_wait_hours} hours across {top.count} cases.",
                suggested_action="Review handoff ownership, queue policies, and escalation triggers for this transition.",
                metric=f"{top.average_wait_hours}h avg wait",
            )
        )

    top_sla_driver = _highest_violation_group(sla_by_priority + sla_by_department)
    if top_sla_driver and top_sla_driver.violation_rate > 0:
        cards.append(
            RecommendationCard(
                title=f"Target SLA leakage in {top_sla_driver.group}",
                priority="High" if top_sla_driver.violation_rate >= 40 else "Medium",
                rationale=f"{top_sla_driver.violation_rate}% of cases in this group violate SLA.",
                suggested_action="Create a focused review of capacity, routing, and escalation rules for this segment.",
                metric=f"{top_sla_driver.violation_rate}% violation rate",
            )
        )

    if rework.rework_rate > 0:
        activity = rework.top_repeated_activities[0].activity if rework.top_repeated_activities else "repeat activities"
        cards.append(
            RecommendationCard(
                title="Lower rework in repeat-heavy cases",
                priority="Medium",
                rationale=f"{rework.rework_rate}% of cases contain repeated activities; the top repeated step is {activity}.",
                suggested_action="Audit re-open reasons, missing information patterns, and first-time-right quality controls.",
                metric=f"{rework.rework_rate}% rework rate",
            )
        )

    if variants:
        top_variant = variants[0]
        if top_variant.percent < 50:
            cards.append(
                RecommendationCard(
                    title="Standardize high-volume process paths",
                    priority="Medium",
                    rationale=f"The most common variant covers only {top_variant.percent}% of cases, indicating process fragmentation.",
                    suggested_action="Define standard routing patterns for common ticket types and monitor exceptions.",
                    metric=f"{top_variant.percent}% top variant coverage",
                )
            )

    cards.append(
        RecommendationCard(
            title="Use the dashboard as a weekly service review",
            priority="Low",
            rationale=f"The current log has {kpis.cases} cases and {kpis.activities} activities, enough for recurring operational tracking.",
            suggested_action="Track SLA rate, top bottlenecks, and rework rate after each process improvement sprint.",
            metric=f"{kpis.sla_violation_rate}% SLA violation rate",
        )
    )

    return cards[:5]


def _highest_violation_group(rows: list[SlaBreakdownRow]) -> SlaBreakdownRow | None:
    if not rows:
        return None
    return sorted(rows, key=lambda row: (row.violation_rate, row.total_cases), reverse=True)[0]

