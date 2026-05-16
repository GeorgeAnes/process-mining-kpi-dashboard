import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SlaBreakdownRow } from "../types";

interface SlaChartProps {
  rows: SlaBreakdownRow[];
  title: string;
}

function SlaChart({ rows, title }: SlaChartProps) {
  const data = rows.slice(0, 7).map((row) => ({
    group: row.group,
    rate: row.violation_rate,
    cases: row.total_cases
  }));

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>{title}</h2>
        <span>Violation rate</span>
      </div>
      <div className="chart-area">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 8, right: 24, bottom: 24, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="group" tick={{ fontSize: 11 }} interval={0} angle={-14} textAnchor="end" height={54} />
            <YAxis unit="%" />
            <Tooltip formatter={(value) => [`${value}%`, "SLA violation"]} />
            <Bar dataKey="rate" fill="#b45309" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default SlaChart;
