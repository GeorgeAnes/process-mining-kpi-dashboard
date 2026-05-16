import type { VariantRow } from "../types";

interface VariantTableProps {
  variants: VariantRow[];
}

function VariantTable({ variants }: VariantTableProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Top process variants</h2>
        <span>Coverage</span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Variant</th>
              <th>Cases</th>
              <th>Share</th>
            </tr>
          </thead>
          <tbody>
            {variants.slice(0, 6).map((variant) => (
              <tr key={variant.variant}>
                <td>{variant.variant}</td>
                <td>{variant.count}</td>
                <td>{variant.percent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default VariantTable;
