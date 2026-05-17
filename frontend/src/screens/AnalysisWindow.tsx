import { Link, useParams } from "react-router-dom";
import BottleneckChart from "../components/BottleneckChart";
import ProcessMap from "../components/ProcessMap";
import ReworkPanel from "../components/ReworkPanel";
import SlaChart from "../components/SlaChart";
import VariantTable from "../components/VariantTable";
import WinWindow from "../components/retro/WinWindow";
import { useProcessMining } from "../state/ProcessMiningContext";
import type { AnalysisResponse } from "../types";
import { formatHours, formatMoney, formatPercent } from "../utils/format";

const titles: Record<string, string> = {
  throughput: "Throughput.exe",
  bottlenecks: "Bottlenecks.exe",
  sla: "SLA Monitor.exe",
  variants: "Variants.exe",
  rework: "Rework.exe"
};

function AnalysisWindow() {
  const { module = "throughput" } = useParams();
  const { analysis, backendStatus } = useProcessMining();
  const title = titles[module] || "Analysis.exe";

  if (!analysis) {
    return (
      <WinWindow title={title} status={backendStatus === "offline" ? "Backend offline" : "No analysis loaded"}>
        <div className="empty-state retro-empty">
          <h2>This analysis window is locked.</h2>
          <p>Run the sample dataset from the desktop before opening detailed analysis modules.</p>
          <Link className="win-button" to="/desktop">
            Open Desktop
          </Link>
        </div>
      </WinWindow>
    );
  }

  return (
    <WinWindow title={title} eyebrow={analysis.dataset_name} status={statusFor(module, analysis.kpis.sla_violation_rate)}>
      {module === "throughput" && <ThroughputView analysis={analysis} />}
      {module === "bottlenecks" && <BottleneckView analysis={analysis} />}
      {module === "sla" && <SlaView analysis={analysis} />}
      {module === "variants" && <VariantsView analysis={analysis} />}
      {module === "rework" && <ReworkView analysis={analysis} />}
      {!titles[module] && <p>Unknown analysis module.</p>}
    </WinWindow>
  );
}

function ThroughputView({ analysis }: { analysis: AnalysisResponse }) {
  return (
    <div className="analysis-stack">
      <section className="metric-strip">
        <MetricBox label="Cases" value={analysis.kpis.cases} />
        <MetricBox label="Events" value={analysis.kpis.events} />
        <MetricBox label="Median Duration" value={formatHours(analysis.kpis.median_case_duration_hours)} />
        <MetricBox label="Mean Duration" value={formatHours(analysis.kpis.mean_case_duration_hours)} />
        <MetricBox label="Total Cost" value={formatMoney(analysis.kpis.total_cost)} />
      </section>
      <section className="panel">
        <div className="panel-header">
          <h2>Activity waiting-time proxy</h2>
          <span>Average wait hours before activity</span>
        </div>
        <DataTable
          headers={["Activity", "Events", "Average wait", "Median wait"]}
          rows={analysis.activity_waiting_times.slice(0, 8).map((row) => [
            row.activity,
            row.count,
            formatHours(row.average_wait_hours),
            formatHours(row.median_wait_hours)
          ])}
        />
      </section>
    </div>
  );
}

function BottleneckView({ analysis }: { analysis: AnalysisResponse }) {
  return (
    <div className="analysis-stack">
      <BottleneckChart bottlenecks={analysis.bottleneck_transitions} />
      <section className="panel">
        <div className="panel-header">
          <h2>Transition detail</h2>
          <span>Top slow handoffs</span>
        </div>
        <DataTable
          headers={["Transition", "Count", "Avg wait", "P90 wait"]}
          rows={analysis.bottleneck_transitions.slice(0, 10).map((row) => [
            row.transition,
            row.count,
            formatHours(row.average_wait_hours),
            formatHours(row.p90_wait_hours)
          ])}
        />
      </section>
    </div>
  );
}

function SlaView({ analysis }: { analysis: AnalysisResponse }) {
  return (
    <div className="grid two">
      <SlaChart rows={analysis.sla_by_priority} title="SLA violations by priority" />
      <SlaChart rows={analysis.sla_by_department} title="SLA violations by department" />
      <SlaChart rows={analysis.sla_by_resource} title="SLA violations by resource" />
      <SlaChart rows={analysis.sla_by_customer_segment} title="SLA violations by customer segment" />
    </div>
  );
}

function VariantsView({ analysis }: { analysis: AnalysisResponse }) {
  return (
    <div className="grid two">
      <VariantTable variants={analysis.variants} />
      <ProcessMap edges={analysis.process_edges} />
    </div>
  );
}

function ReworkView({ analysis }: { analysis: AnalysisResponse }) {
  return (
    <div className="analysis-stack">
      <ReworkPanel rework={analysis.rework} />
      <section className="panel">
        <div className="panel-header">
          <h2>Repeated activity detail</h2>
          <span>{formatPercent(analysis.rework.rework_rate)} of cases</span>
        </div>
        <DataTable
          headers={["Activity", "Cases", "Total repeats"]}
          rows={analysis.rework.top_repeated_activities.map((row) => [row.activity, row.repeat_cases, row.total_repeats])}
        />
      </section>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="metric-box">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: Array<Array<string | number>> }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row[0]}-${index}`}>
              {row.map((cell, cellIndex) => (
                <td key={`${cell}-${cellIndex}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function statusFor(module: string, slaRate: number): string {
  if (module === "sla") return `SLA violation rate: ${formatPercent(slaRate)}`;
  return "Focused analysis module";
}

export default AnalysisWindow;
