from __future__ import annotations

from collections import Counter, defaultdict

import pandas as pd

from backend.app.schemas import ReworkActivity, ReworkSummary, VariantRow


def calculate_variants(events: pd.DataFrame, top_n: int = 8) -> list[VariantRow]:
    sequences = []
    for _, case_events in events.groupby("case_id", sort=False):
        activities = tuple(case_events.sort_values("timestamp")["activity"].tolist())
        sequences.append(activities)

    total_cases = len(sequences)
    counts = Counter(sequences)
    cumulative = 0.0
    variants: list[VariantRow] = []
    for activities, count in counts.most_common(top_n):
        percent = (count / total_cases * 100) if total_cases else 0.0
        cumulative += percent
        variants.append(
            VariantRow(
                variant=" -> ".join(activities),
                activities=list(activities),
                count=count,
                percent=round(percent, 2),
                cumulative_percent=round(cumulative, 2),
            )
        )
    return variants


def calculate_rework(events: pd.DataFrame) -> ReworkSummary:
    rework_cases = 0
    repeated_activity_count = 0
    activity_case_counts: dict[str, int] = defaultdict(int)
    activity_repeat_totals: dict[str, int] = defaultdict(int)

    for _, case_events in events.groupby("case_id", sort=False):
        activities = case_events.sort_values("timestamp")["activity"].tolist()
        counts = Counter(activities)
        repeated = {activity: count for activity, count in counts.items() if count > 1}
        if repeated:
            rework_cases += 1
        for activity, count in repeated.items():
            activity_case_counts[activity] += 1
            repeats = count - 1
            repeated_activity_count += repeats
            activity_repeat_totals[activity] += repeats

    total_cases = int(events["case_id"].nunique())
    top_repeated = sorted(activity_repeat_totals.items(), key=lambda item: item[1], reverse=True)[:5]
    return ReworkSummary(
        rework_cases=rework_cases,
        rework_rate=round((rework_cases / total_cases * 100) if total_cases else 0.0, 2),
        repeated_activity_count=repeated_activity_count,
        top_repeated_activities=[
            ReworkActivity(
                activity=activity,
                repeat_cases=int(activity_case_counts[activity]),
                total_repeats=int(repeats),
            )
            for activity, repeats in top_repeated
        ],
    )

