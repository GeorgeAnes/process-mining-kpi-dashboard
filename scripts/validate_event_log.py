from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.app.core.load_event_log import load_csv_file
from backend.app.core.preprocess import prepare_event_log


def validate(path: Path) -> None:
    events, cases, warnings = prepare_event_log(load_csv_file(path))
    print(f"Valid event log: {path}")
    print(f"Events: {len(events)}")
    print(f"Cases: {len(cases)}")
    print(f"Activities: {events['activity'].nunique()}")
    if warnings:
        print("Warnings:")
        for warning in warnings:
            print(f"- {warning}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Validate a CSV event log for the dashboard schema.")
    parser.add_argument("csv_path", type=Path, help="Path to event-log CSV")
    args = parser.parse_args()
    validate(args.csv_path)


if __name__ == "__main__":
    main()
