import type { ProcessEdge } from "../types";

interface ProcessMapProps {
  edges: ProcessEdge[];
}

function ProcessMap({ edges }: ProcessMapProps) {
  const nodes = Array.from(new Set(edges.flatMap((edge) => [edge.from_activity, edge.to_activity]))).slice(0, 8);
  const positions = nodes.map((node, index) => ({
    node,
    x: 60 + index * 118,
    y: index % 2 === 0 ? 84 : 166
  }));

  function point(name: string) {
    return positions.find((position) => position.node === name) || positions[0];
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Directly-follows map</h2>
        <span>Top observed paths</span>
      </div>
      <svg className="process-map" viewBox="0 0 930 250" role="img" aria-label="Directly follows process map">
        {edges.slice(0, 12).map((edge) => {
          const start = point(edge.from_activity);
          const end = point(edge.to_activity);
          const width = Math.min(5, 1.2 + edge.count / 2);
          return (
            <line
              key={`${edge.from_activity}-${edge.to_activity}`}
              x1={start.x + 44}
              y1={start.y}
              x2={end.x - 44}
              y2={end.y}
              stroke="#475569"
              strokeWidth={width}
              opacity="0.42"
            />
          );
        })}
        {positions.map((position) => (
          <g key={position.node}>
            <rect x={position.x - 48} y={position.y - 24} width="96" height="48" rx="8" fill="#ffffff" stroke="#0f766e" />
            <text x={position.x} y={position.y + 4} textAnchor="middle" fontSize="10" fill="#111827">
              {shortLabel(position.node)}
            </text>
          </g>
        ))}
      </svg>
    </section>
  );
}

function shortLabel(value: string): string {
  return value.length > 16 ? `${value.slice(0, 14)}...` : value;
}

export default ProcessMap;
