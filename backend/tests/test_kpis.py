from pathlib import Path

from backend.app.core.pipeline import analyze_event_log_csv


ROOT = Path(__file__).resolve().parents[2]


def test_kpi_calculation_returns_expected_fields():
    csv_text = (ROOT / "data" / "sample_event_log.csv").read_text(encoding="utf-8")
    analysis = analyze_event_log_csv(csv_text, dataset_name="Test sample")

    assert analysis.kpis.cases == 18
    assert analysis.kpis.events > 100
    assert analysis.kpis.activities >= 8
    assert analysis.kpis.median_case_duration_hours > 0
    assert analysis.kpis.sla_violation_rate > 0
    assert analysis.bottleneck_transitions
    assert analysis.variants
    assert analysis.recommendations

