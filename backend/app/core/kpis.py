from __future__ import annotations

import pandas as pd

from backend.app.schemas import KpiSummary


def calculate_kpis(events: pd.DataFrame, cases: pd.DataFrame) -> KpiSummary:
    case_count = int(len(cases))
    total_cost = float(events["cost"].sum())
    violation_rate = float(cases["sla_violated"].mean() * 100) if case_count else 0.0
    return KpiSummary(
        cases=case_count,
        events=int(len(events)),
        activities=int(events["activity"].nunique()),
        median_case_duration_hours=_round(cases["duration_hours"].median()),
        mean_case_duration_hours=_round(cases["duration_hours"].mean()),
        sla_violation_rate=_round(violation_rate),
        total_cost=_round(total_cost),
        average_cost_per_case=_round(total_cost / case_count if case_count else 0.0),
    )


def _round(value: float | int) -> float:
    if pd.isna(value):
        return 0.0
    return round(float(value), 2)

