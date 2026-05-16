import { Activity, DownloadCloud } from "lucide-react";

interface HeaderProps {
  statusLabel: string;
}

function Header({ statusLabel }: HeaderProps) {
  return (
    <header className="topbar">
      <div className="brand">
        <Activity size={22} />
        <div>
          <h1>Process Mining KPI Dashboard</h1>
          <p>Event-log analytics for service operations and business transformation</p>
        </div>
      </div>
      <div className="topbar-actions">
        <span className="status-pill">{statusLabel}</span>
        <span className="icon-note" title="Reports export as Markdown or JSON">
          <DownloadCloud size={18} />
        </span>
      </div>
    </header>
  );
}

export default Header;
