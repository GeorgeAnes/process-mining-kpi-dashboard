import { Download } from "lucide-react";
import { exportAnalysis } from "../api";
import type { AnalysisResponse } from "../types";

interface ReportExportProps {
  analysis: AnalysisResponse;
}

function ReportExport({ analysis }: ReportExportProps) {
  async function download(format: "markdown" | "json") {
    const content = await exportAnalysis(analysis, format);
    const blob = new Blob([content], { type: format === "json" ? "application/json" : "text/markdown" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = format === "json" ? "process-mining-report.json" : "process-mining-report.md";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="panel compact">
      <div className="panel-header">
        <h2>Executive report</h2>
        <span>Export</span>
      </div>
      <p className="muted">Download a concise report for stakeholder review or a JSON payload for downstream analysis.</p>
      <div className="button-row">
        <button className="primary" onClick={() => void download("markdown")}>
          <Download size={16} />
          Markdown
        </button>
        <button className="secondary" onClick={() => void download("json")}>
          <Download size={16} />
          JSON
        </button>
      </div>
    </section>
  );
}

export default ReportExport;
