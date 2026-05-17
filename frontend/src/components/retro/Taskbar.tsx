import { Link, useLocation } from "react-router-dom";
import { useProcessMining } from "../../state/ProcessMiningContext";

function Taskbar() {
  const { analysis, backendStatus, statusLabel } = useProcessMining();
  const location = useLocation();

  return (
    <footer className="taskbar">
      <Link className="start-button" to="/desktop">
        Start
      </Link>
      <div className="taskbar-tabs">
        <span className="taskbar-tab active">{windowLabel(location.pathname)}</span>
        {analysis && <span className="taskbar-tab">{analysis.dataset_name}</span>}
      </div>
      <div className={`taskbar-status ${backendStatus}`}>{statusLabel}</div>
    </footer>
  );
}

function windowLabel(pathname: string): string {
  if (pathname.startsWith("/analysis/bottlenecks")) return "Bottlenecks.exe";
  if (pathname.startsWith("/analysis/sla")) return "SLA Monitor.exe";
  if (pathname.startsWith("/analysis/variants")) return "Variants.exe";
  if (pathname.startsWith("/analysis/rework")) return "Rework.exe";
  if (pathname.startsWith("/analysis/throughput")) return "Throughput.exe";
  if (pathname.startsWith("/overview")) return "Operations Monitor";
  if (pathname.startsWith("/report")) return "Executive Report.txt";
  return "Process Desktop";
}

export default Taskbar;
