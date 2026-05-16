from __future__ import annotations

import pandas as pd

from backend.app.schemas import ActivityWaitingTime, BottleneckTransition, ProcessEdge


def transition_table(events: pd.DataFrame) -> pd.DataFrame:
    rows: list[dict[str, object]] = []
    for case_id, case_events in events.groupby("case_id", sort=False):
        ordered = case_events.sort_values("timestamp")
        previous = None
        for _, event in ordered.iterrows():
            if previous is not None:
                elapsed_hours = max((event["timestamp"] - previous["timestamp"]).total_seconds() / 3600, 0.0)
                rows.append(
                    {
                        "case_id": case_id,
                        "from_activity": previous["activity"],
                        "to_activity": event["activity"],
                        "elapsed_hours": elapsed_hours,
                    }
                )
            previous = event
    return pd.DataFrame(rows)


def calculate_bottlenecks(events: pd.DataFrame, top_n: int = 8) -> list[BottleneckTransition]:
    transitions = transition_table(events)
    if transitions.empty:
        return []

    grouped = (
        transitions.groupby(["from_activity", "to_activity"], as_index=False)
        .agg(
            count=("elapsed_hours", "size"),
            average_wait_hours=("elapsed_hours", "mean"),
            median_wait_hours=("elapsed_hours", "median"),
            p90_wait_hours=("elapsed_hours", lambda values: values.quantile(0.9)),
        )
        .sort_values(["average_wait_hours", "count"], ascending=[False, False])
        .head(top_n)
    )

    return [
        BottleneckTransition(
            transition=f"{row.from_activity} -> {row.to_activity}",
            from_activity=str(row.from_activity),
            to_activity=str(row.to_activity),
            count=int(row.count),
            average_wait_hours=round(float(row.average_wait_hours), 2),
            median_wait_hours=round(float(row.median_wait_hours), 2),
            p90_wait_hours=round(float(row.p90_wait_hours), 2),
        )
        for row in grouped.itertuples(index=False)
    ]


def calculate_activity_waiting_times(events: pd.DataFrame, top_n: int = 8) -> list[ActivityWaitingTime]:
    transitions = transition_table(events)
    if transitions.empty:
        return []

    grouped = (
        transitions.groupby("to_activity", as_index=False)
        .agg(
            count=("elapsed_hours", "size"),
            average_wait_hours=("elapsed_hours", "mean"),
            median_wait_hours=("elapsed_hours", "median"),
        )
        .sort_values(["average_wait_hours", "count"], ascending=[False, False])
        .head(top_n)
    )
    return [
        ActivityWaitingTime(
            activity=str(row.to_activity),
            count=int(row.count),
            average_wait_hours=round(float(row.average_wait_hours), 2),
            median_wait_hours=round(float(row.median_wait_hours), 2),
        )
        for row in grouped.itertuples(index=False)
    ]


def calculate_process_edges(events: pd.DataFrame, top_n: int = 14) -> list[ProcessEdge]:
    transitions = transition_table(events)
    if transitions.empty:
        return []
    grouped = (
        transitions.groupby(["from_activity", "to_activity"], as_index=False)
        .agg(count=("elapsed_hours", "size"), average_hours=("elapsed_hours", "mean"))
        .sort_values(["count", "average_hours"], ascending=[False, False])
        .head(top_n)
    )
    return [
        ProcessEdge(
            from_activity=str(row.from_activity),
            to_activity=str(row.to_activity),
            count=int(row.count),
            average_hours=round(float(row.average_hours), 2),
        )
        for row in grouped.itertuples(index=False)
    ]

