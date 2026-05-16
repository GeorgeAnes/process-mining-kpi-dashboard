from backend.app.core.pipeline import analyze_event_log_csv


def test_sla_violation_logic_on_controlled_data():
    csv_text = """case_id,activity,timestamp,resource,department,cost,priority,sla_hours,customer_segment
C1,Ticket Created,2026-04-01 08:00,A,Service Desk,1,P1,8,Enterprise
C1,Close Ticket,2026-04-01 10:00,A,Service Desk,1,P1,8,Enterprise
C2,Ticket Created,2026-04-01 08:00,B,Service Desk,1,P1,8,Enterprise
C2,Close Ticket,2026-04-01 20:30,B,Service Desk,1,P1,8,Enterprise
"""
    analysis = analyze_event_log_csv(csv_text, dataset_name="Controlled")

    assert analysis.kpis.cases == 2
    assert analysis.kpis.sla_violation_rate == 50.0
    assert analysis.sla_by_priority[0].group == "P1"
    assert analysis.sla_by_priority[0].violations == 1

