from __future__ import annotations

from io import StringIO
from pathlib import Path

import pandas as pd


REQUIRED_COLUMNS = [
    "case_id",
    "activity",
    "timestamp",
    "resource",
    "department",
    "cost",
    "priority",
    "sla_hours",
    "customer_segment",
]


class EventLogError(ValueError):
    """Raised when an event log cannot be parsed or validated."""


def load_csv_text(csv_text: str, source_name: str = "Uploaded CSV") -> pd.DataFrame:
    if not csv_text or not csv_text.strip():
        raise EventLogError("CSV input is empty.")

    try:
        frame = pd.read_csv(StringIO(csv_text.strip()))
    except Exception as exc:  # pragma: no cover - pandas gives version-specific details
        raise EventLogError(f"Could not parse CSV input: {exc}") from exc

    frame.attrs["source_name"] = source_name
    return frame


def load_csv_file(path: Path) -> pd.DataFrame:
    if not path.exists():
        raise EventLogError(f"Event log file does not exist: {path}")
    return load_csv_text(path.read_text(encoding="utf-8"), source_name=path.name)


def validate_required_columns(frame: pd.DataFrame) -> None:
    missing = [column for column in REQUIRED_COLUMNS if column not in frame.columns]
    if missing:
        raise EventLogError(f"Event log is missing required columns: {', '.join(missing)}")

