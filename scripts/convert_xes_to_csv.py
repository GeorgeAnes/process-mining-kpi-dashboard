from __future__ import annotations

import argparse
from pathlib import Path

import pandas as pd


def convert_xes_to_csv(input_path: Path, output_path: Path) -> None:
    try:
        import pm4py  # type: ignore
    except ImportError as exc:
        raise SystemExit(
            "PM4Py is not installed. Install it only when needed with: pip install pm4py"
        ) from exc

    log = pm4py.read_xes(str(input_path))
    frame = pm4py.convert_to_dataframe(log)

    output = pd.DataFrame(
        {
            "case_id": frame.get("case:concept:name", frame.get("case_id", "unknown")),
            "activity": frame.get("concept:name", frame.get("activity", "Unknown Activity")),
            "timestamp": frame.get("time:timestamp", frame.get("timestamp")),
            "resource": frame.get("org:resource", "Unknown Resource"),
            "department": frame.get("org:group", "Unknown Department"),
            "cost": frame.get("cost", 0),
            "priority": frame.get("priority", "P3"),
            "sla_hours": frame.get("sla_hours", 72),
            "customer_segment": frame.get("customer_segment", "Unknown Segment"),
        }
    )
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output.to_csv(output_path, index=False)
    print(f"Wrote {len(output)} events to {output_path}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert a manually downloaded XES event log to dashboard CSV.")
    parser.add_argument("input", type=Path, help="Path to .xes or .xes.gz file")
    parser.add_argument("output", type=Path, help="Output CSV path")
    args = parser.parse_args()
    convert_xes_to_csv(args.input, args.output)


if __name__ == "__main__":
    main()
