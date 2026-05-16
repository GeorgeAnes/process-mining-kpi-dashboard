import { Repeat2 } from "lucide-react";
import type { ReworkSummary } from "../types";

interface ReworkPanelProps {
  rework: ReworkSummary;
}

function ReworkPanel({ rework }: ReworkPanelProps) {
  return (
    <section className="panel rework-panel">
      <div className="panel-header">
        <h2>Rework loops</h2>
        <span>{rework.rework_rate}% of cases</span>
      </div>
      <div className="rework-hero">
        <Repeat2 size={28} />
        <div>
          <strong>{rework.rework_cases}</strong>
          <span>cases with repeated activities</span>
        </div>
      </div>
      <ul className="metric-list">
        {rework.top_repeated_activities.map((activity) => (
          <li key={activity.activity}>
            <span>{activity.activity}</span>
            <strong>{activity.total_repeats} repeats</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ReworkPanel;
