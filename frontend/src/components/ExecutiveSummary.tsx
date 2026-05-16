import { BriefcaseBusiness } from "lucide-react";
import type { ExecutiveSummary as ExecutiveSummaryType } from "../types";

interface ExecutiveSummaryProps {
  summary: ExecutiveSummaryType;
  datasetName: string;
}

function ExecutiveSummary({ summary, datasetName }: ExecutiveSummaryProps) {
  return (
    <section className="summary-band">
      <div className="summary-icon">
        <BriefcaseBusiness size={24} />
      </div>
      <div>
        <span className="eyebrow">{datasetName}</span>
        <h2>{summary.headline}</h2>
        <p>{summary.narrative}</p>
        <div className="finding-row">
          {summary.key_findings.slice(0, 3).map((finding) => (
            <span key={finding}>{finding}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ExecutiveSummary;
