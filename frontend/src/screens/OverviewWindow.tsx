import { Link } from "react-router-dom";
import ExecutiveSummary from "../components/ExecutiveSummary";
import KpiCards from "../components/KpiCards";
import RecommendationCards from "../components/RecommendationCards";
import WinWindow from "../components/retro/WinWindow";
import { useProcessMining } from "../state/ProcessMiningContext";
import { formatHours, formatMoney, formatPercent } from "../utils/format";

function OverviewWindow() {
  const { analysis, backendStatus } = useProcessMining();

  if (!analysis) {
    return (
      <WinWindow title="Operations Monitor" status={backendStatus === "offline" ? "Backend offline" : "No analysis loaded"}>
        <div className="empty-state retro-empty">
          <h2>No event-log analysis is loaded.</h2>
          <p>Return to the desktop and run the sample analysis to unlock the process cockpit.</p>
          <Link className="win-button" to="/desktop">
            Open Desktop
          </Link>
        </div>
      </WinWindow>
    );
  }

  return (
    <WinWindow
      title="Operations Monitor"
      eyebrow="High-level event-log health"
      status={`${analysis.kpis.cases} cases / ${formatPercent(analysis.kpis.sla_violation_rate)} SLA violations`}
    >
      <ExecutiveSummary summary={analysis.executive_summary} datasetName={analysis.dataset_name} />
      <KpiCards kpis={analysis.kpis} />
      <section className="overview-grid">
        <article className="inset-panel">
          <h2>Cycle-Time Overview</h2>
          <dl className="metric-pairs">
            <div>
              <dt>Median case duration</dt>
              <dd>{formatHours(analysis.kpis.median_case_duration_hours)}</dd>
            </div>
            <div>
              <dt>Mean case duration</dt>
              <dd>{formatHours(analysis.kpis.mean_case_duration_hours)}</dd>
            </div>
            <div>
              <dt>Average cost per case</dt>
              <dd>{formatMoney(analysis.kpis.average_cost_per_case)}</dd>
            </div>
          </dl>
        </article>
        <article className="inset-panel">
          <h2>Fast Access</h2>
          <div className="module-link-grid">
            <Link to="/analysis/bottlenecks">Bottlenecks</Link>
            <Link to="/analysis/sla">SLA</Link>
            <Link to="/analysis/variants">Variants</Link>
            <Link to="/analysis/rework">Rework</Link>
          </div>
        </article>
      </section>
      <RecommendationCards cards={analysis.recommendations.slice(0, 3)} />
    </WinWindow>
  );
}

export default OverviewWindow;
