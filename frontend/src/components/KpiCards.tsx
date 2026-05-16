import { BarChart3, Clock, DollarSign, Gauge, ListChecks, Workflow } from "lucide-react";
import type { KpiSummary } from "../types";

interface KpiCardsProps {
  kpis: KpiSummary;
}

const items = [
  { key: "cases", label: "Cases", icon: ListChecks },
  { key: "events", label: "Events", icon: Workflow },
  { key: "activities", label: "Activities", icon: BarChart3 },
  { key: "median_case_duration_hours", label: "Median hours", icon: Clock },
  { key: "sla_violation_rate", label: "SLA violation", icon: Gauge, suffix: "%" },
  { key: "average_cost_per_case", label: "Avg. cost/case", icon: DollarSign, prefix: "€" }
] as const;

function KpiCards({ kpis }: KpiCardsProps) {
  return (
    <section className="kpi-grid" aria-label="KPI cards">
      {items.map((item) => {
        const Icon = item.icon;
        const value = kpis[item.key];
        return (
          <article className="kpi-card" key={item.key}>
            <Icon size={18} />
            <span>{item.label}</span>
            <strong>
              {"prefix" in item ? item.prefix : ""}
              {value}
              {"suffix" in item ? item.suffix : ""}
            </strong>
          </article>
        );
      })}
    </section>
  );
}

export default KpiCards;
