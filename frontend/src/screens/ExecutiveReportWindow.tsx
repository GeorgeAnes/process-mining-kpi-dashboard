import { Link } from "react-router-dom";
import AssistantPanel from "../components/AssistantPanel";
import ExecutiveSummary from "../components/ExecutiveSummary";
import RecommendationCards from "../components/RecommendationCards";
import ReportExport from "../components/ReportExport";
import WinWindow from "../components/retro/WinWindow";
import { useProcessMining } from "../state/ProcessMiningContext";

function ExecutiveReportWindow() {
  const { analysis, backendStatus } = useProcessMining();

  if (!analysis) {
    return (
      <WinWindow title="Executive Report.txt" status={backendStatus === "offline" ? "Backend offline" : "No report available"}>
        <div className="empty-state retro-empty">
          <h2>No report can be generated yet.</h2>
          <p>Run the sample event-log analysis from the desktop first.</p>
          <Link className="win-button" to="/desktop">
            Open Desktop
          </Link>
        </div>
      </WinWindow>
    );
  }

  return (
    <WinWindow title="Executive Report.txt" eyebrow="Management summary and export" status="Markdown and JSON export available">
      <ExecutiveSummary summary={analysis.executive_summary} datasetName={analysis.dataset_name} />
      <RecommendationCards cards={analysis.recommendations} />
      <div className="grid two">
        <AssistantPanel analysis={analysis} />
        <ReportExport analysis={analysis} />
      </div>
    </WinWindow>
  );
}

export default ExecutiveReportWindow;
