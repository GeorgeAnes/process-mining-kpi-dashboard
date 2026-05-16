from __future__ import annotations

import pandas as pd

from backend.app.core.load_event_log import EventLogError, validate_required_columns


def prepare_event_log(frame: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame, list[str]]:
    validate_required_columns(frame)
    warnings: list[str] = []

    data = frame.copy()
    data.columns = [str(column).strip() for column in data.columns]

    for column in ["case_id", "activity", "resource", "department", "priority", "customer_segment"]:
        data[column] = data[column].astype(str).str.strip()

    data["timestamp"] = pd.to_datetime(data["timestamp"], errors="coerce", utc=False)
    if data["timestamp"].isna().any():
        bad_count = int(data["timestamp"].isna().sum())
        raise EventLogError(f"{bad_count} events have invalid timestamps.")

    data["cost"] = pd.to_numeric(data["cost"], errors="coerce").fillna(0.0)
    data["sla_hours"] = pd.to_numeric(data["sla_hours"], errors="coerce")
    if data["sla_hours"].isna().any():
        warnings.append("Some events have missing SLA values; affected cases use the first available SLA value or 0.")

    data = data.sort_values(["case_id", "timestamp", "activity"]).reset_index(drop=True)
    data["event_index"] = data.groupby("case_id").cumcount() + 1

    case_table = build_case_table(data)
    return data, case_table, warnings


def build_case_table(data: pd.DataFrame) -> pd.DataFrame:
    rows: list[dict[str, object]] = []
    for case_id, case_events in data.groupby("case_id", sort=False):
        ordered = case_events.sort_values("timestamp")
        start = ordered["timestamp"].iloc[0]
        end = ordered["timestamp"].iloc[-1]
        duration_hours = max((end - start).total_seconds() / 3600, 0.0)
        sla_values = ordered["sla_hours"].dropna()
        sla_hours = float(sla_values.iloc[0]) if not sla_values.empty else 0.0
        activities = ordered["activity"].tolist()
        fulfillment_events = ordered[ordered["department"].astype(str) != "Service Desk"]
        rows.append(
            {
                "case_id": case_id,
                "start_time": start,
                "end_time": end,
                "duration_hours": duration_hours,
                "sla_hours": sla_hours,
                "sla_violated": bool(sla_hours and duration_hours > sla_hours),
                "priority": str(ordered["priority"].iloc[0]),
                "department": _most_common(fulfillment_events["department"] if not fulfillment_events.empty else ordered["department"]),
                "resource": _most_common(fulfillment_events["resource"] if not fulfillment_events.empty else ordered["resource"]),
                "customer_segment": str(ordered["customer_segment"].iloc[0]),
                "total_cost": float(ordered["cost"].sum()),
                "event_count": int(len(ordered)),
                "activities": activities,
                "has_rework": len(set(activities)) < len(activities),
            }
        )
    return pd.DataFrame(rows)


def _most_common(series: pd.Series) -> str:
    counts = series.astype(str).value_counts()
    return str(counts.index[0]) if not counts.empty else "Unknown"
