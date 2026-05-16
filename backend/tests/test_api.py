from fastapi.testclient import TestClient

from backend.app.api import app


client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_sample_analyze_endpoint():
    response = client.post("/analyze", json={"dataset_id": "sample"})

    assert response.status_code == 200
    body = response.json()
    assert body["dataset_name"] == "Synthetic IT Service Ticket Log"
    assert body["kpis"]["cases"] == 18
    assert body["recommendations"]


def test_sample_dataset_endpoint_returns_csv_content():
    response = client.get("/datasets/sample")

    assert response.status_code == 200
    body = response.json()
    assert body["row_count"] > 100
    assert "case_id,activity,timestamp" in body["content"]


def test_export_markdown_endpoint():
    analysis = client.post("/analyze", json={"dataset_id": "sample"}).json()
    response = client.post("/export", json={"analysis": analysis, "format": "markdown"})

    assert response.status_code == 200
    assert "Process Mining KPI Report" in response.text
