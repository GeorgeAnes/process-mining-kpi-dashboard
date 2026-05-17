import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import KpiCards from "./KpiCards";
import ExecutiveSummary from "./ExecutiveSummary";
import type { AnalysisResponse } from "../types";

const mockAnalysis: AnalysisResponse = {
  dataset_name: "Synthetic IT Service Ticket Log",
  generated_at: "2026-05-17T10:00:00Z",
  kpis: {
    cases: 20,
    events: 120,
    activities: 9,
    median_case_duration_hours: 12,
    mean_case_duration_hours: 18,
    sla_violation_rate: 25,
    total_cost: 2500,
    average_cost_per_case: 125
  },
  bottleneck_transitions: [
    {
      transition: "Triage -> Approval",
      from_activity: "Triage",
      to_activity: "Approval",
      count: 8,
      average_wait_hours: 9,
      median_wait_hours: 8,
      p90_wait_hours: 14
    }
  ],
  activity_waiting_times: [{ activity: "Approval", count: 8, average_wait_hours: 9, median_wait_hours: 8 }],
  variants: [{ variant: "Open > Triage > Resolve", activities: ["Open", "Triage", "Resolve"], count: 5, percent: 25, cumulative_percent: 25 }],
  sla_by_priority: [{ group: "High", total_cases: 8, violations: 3, violation_rate: 37.5, average_duration_hours: 20 }],
  sla_by_department: [{ group: "Platform", total_cases: 10, violations: 2, violation_rate: 20, average_duration_hours: 16 }],
  sla_by_resource: [{ group: "Team A", total_cases: 7, violations: 1, violation_rate: 14.3, average_duration_hours: 12 }],
  sla_by_customer_segment: [{ group: "Enterprise", total_cases: 9, violations: 2, violation_rate: 22.2, average_duration_hours: 18 }],
  rework: {
    rework_cases: 3,
    rework_rate: 15,
    repeated_activity_count: 1,
    top_repeated_activities: [{ activity: "Approval", repeat_cases: 3, total_repeats: 4 }]
  },
  process_edges: [{ from_activity: "Open", to_activity: "Triage", count: 12, average_hours: 2 }],
  recommendations: [
    {
      title: "Reduce approval waits",
      priority: "High",
      rationale: "Approval is the slowest handoff.",
      suggested_action: "Review staffing and escalation rules.",
      metric: "9h average wait"
    }
  ],
  executive_summary: {
    headline: "25% SLA violation rate across 20 cases",
    narrative: "Deterministic event-log analytics for service operations.",
    key_findings: ["Median case duration is 12 hours."]
  },
  warnings: []
};

vi.mock("../api", () => ({
  checkHealth: vi.fn(() => Promise.resolve({ status: "ok" })),
  listDatasets: vi.fn(() =>
    Promise.resolve([
      {
        id: "sample",
        title: "Synthetic IT Service Ticket Log",
        description: "Synthetic incident-management event log.",
        filename: "sample_event_log.csv",
        row_count: 120
      }
    ])
  ),
  getSampleDataset: vi.fn(() =>
    Promise.resolve({
      id: "sample",
      title: "Synthetic IT Service Ticket Log",
      description: "Synthetic incident-management event log.",
      filename: "sample_event_log.csv",
      row_count: 120,
      content: "case_id,activity,timestamp"
    })
  ),
  analyzeDataset: vi.fn(() => Promise.resolve(mockAnalysis)),
  exportAnalysis: vi.fn(() => Promise.resolve("# Report")),
  askAssistant: vi.fn(() => Promise.resolve({ mode: "deterministic", status: "completed", answer: "Approval is slow." }))
}));

describe("dashboard smoke components", () => {
  it("renders KPI and executive summary content", () => {
    render(
      <>
        <ExecutiveSummary
          datasetName="Synthetic IT Service Ticket Log"
          summary={{
            headline: "25% SLA violation rate across 20 cases",
            narrative: "Deterministic event-log analytics for service operations.",
            key_findings: ["Median case duration is 12 hours."]
          }}
        />
        <KpiCards
          kpis={{
            cases: 20,
            events: 120,
            activities: 9,
            median_case_duration_hours: 12,
            mean_case_duration_hours: 18,
            sla_violation_rate: 25,
            total_cost: 2500,
            average_cost_per_case: 125
          }}
        />
      </>
    );

    expect(screen.getByText("25% SLA violation rate across 20 cases")).toBeTruthy();
    expect(screen.getByText("Cases")).toBeTruthy();
  });

  it("renders the retro desktop and routed overview with mocked API data", async () => {
    const { unmount } = render(
      <MemoryRouter initialEntries={["/desktop"]}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText("Throughput.exe")).toBeTruthy();
    expect(await screen.findByText("Backend Connection")).toBeTruthy();

    unmount();
    render(
      <MemoryRouter initialEntries={["/overview"]}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText("Cycle-Time Overview")).toBeTruthy();
    expect(await screen.findByText("Reduce approval waits")).toBeTruthy();
  });
});
