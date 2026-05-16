import { render, screen } from "@testing-library/react";
import KpiCards from "./KpiCards";
import ExecutiveSummary from "./ExecutiveSummary";

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
});
