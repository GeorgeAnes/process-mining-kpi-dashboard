from pathlib import Path

from backend.app.core.load_event_log import load_csv_file
from backend.app.core.preprocess import prepare_event_log


ROOT = Path(__file__).resolve().parents[2]


def test_sample_csv_loads_correctly():
    frame = load_csv_file(ROOT / "data" / "sample_event_log.csv")
    events, cases, warnings = prepare_event_log(frame)

    assert warnings == []
    assert len(events) > 100
    assert cases["case_id"].nunique() == 18
    assert {"Ticket Created", "Resolve", "Close Ticket"}.issubset(set(events["activity"]))

