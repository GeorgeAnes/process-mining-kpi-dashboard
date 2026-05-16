from __future__ import annotations

import pandas as pd

from backend.app.schemas import SlaBreakdownRow


def calculate_sla_breakdown(cases: pd.DataFrame, group_field: str, top_n: int = 8) -> list[SlaBreakdownRow]:
    if group_field not in cases.columns or cases.empty:
        return []

    grouped = (
        cases.groupby(group_field, as_index=False)
        .agg(
            total_cases=("case_id", "size"),
            violations=("sla_violated", "sum"),
            average_duration_hours=("duration_hours", "mean"),
        )
        .sort_values(["violations", "total_cases"], ascending=[False, False])
        .head(top_n)
    )
    rows: list[SlaBreakdownRow] = []
    for row in grouped.itertuples(index=False):
        total = int(row.total_cases)
        violations = int(row.violations)
        rows.append(
            SlaBreakdownRow(
                group=str(getattr(row, group_field)),
                total_cases=total,
                violations=violations,
                violation_rate=round((violations / total * 100) if total else 0.0, 2),
                average_duration_hours=round(float(row.average_duration_hours), 2),
            )
        )
    return rows

