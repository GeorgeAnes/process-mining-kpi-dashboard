import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { BottleneckTransition } from "../types";

interface BottleneckChartProps {
  bottlenecks: BottleneckTransition[];
}

function BottleneckChart({ bottlenecks }: BottleneckChartProps) {
  const data = bottlenecks.slice(0, 6).map((item) => ({
    transition: item.transition.replace(" -> ", " → "),
    hours: item.average_wait_hours,
    count: item.count
  }));

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Top bottleneck transitions</h2>
        <span>Avg. wait hours</span>
      </div>
      <div className="chart-area">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, bottom: 8, left: 92 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" />
            <YAxis dataKey="transition" type="category" width={140} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value) => [`${value}h`, "Average wait"]} />
            <Bar dataKey="hours" fill="#0f766e" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default BottleneckChart;
