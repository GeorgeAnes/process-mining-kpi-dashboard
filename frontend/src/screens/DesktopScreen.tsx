import DesktopIcon from "../components/retro/DesktopIcon";
import WinWindow from "../components/retro/WinWindow";
import { BackendStatusWidget, DatasetStatusWidget } from "../components/retro/StatusWidgets";
import { useProcessMining } from "../state/ProcessMiningContext";

const modules = [
  { to: "/overview", label: "Operations Monitor", code: "OM" },
  { to: "/analysis/throughput", label: "Throughput.exe", code: "TH" },
  { to: "/analysis/bottlenecks", label: "Bottlenecks.exe", code: "BN" },
  { to: "/analysis/sla", label: "SLA Monitor.exe", code: "SLA" },
  { to: "/analysis/variants", label: "Variants.exe", code: "VR" },
  { to: "/analysis/rework", label: "Rework.exe", code: "RW" },
  { to: "/report", label: "Executive Report.txt", code: "TXT" }
];

function DesktopScreen() {
  const { analysis, loading, backendStatus } = useProcessMining();
  const locked = !analysis || backendStatus !== "online";

  return (
    <div className="desktop-layout">
      <section className="desktop-icons" aria-label="Analysis modules">
        {modules.map((module) => (
          <DesktopIcon
            key={module.to}
            to={module.to}
            label={module.label}
            code={module.code}
            disabled={locked && module.to !== "/overview"}
          />
        ))}
      </section>

      <div className="desktop-windows">
        <WinWindow
          title="Process Mining Workbench"
          eyebrow="Synthetic IT service event log / local analytics mode"
          status={analysis ? `${analysis.kpis.cases} cases / ${analysis.kpis.events} events` : "Waiting for backend"}
        >
          <div className="boot-copy">
            <h1>Enterprise Operations Monitor</h1>
            <p>
              Legacy-style cockpit for event-log analytics, SLA monitoring, bottleneck review, and executive process
              improvement reporting.
            </p>
            <div className="boot-ledger">
              <span>Backend</span>
              <strong>{backendStatus}</strong>
              <span>Analysis</span>
              <strong>{loading ? "loading" : analysis ? "ready" : "locked"}</strong>
            </div>
          </div>
        </WinWindow>

        <div className="desktop-widget-grid">
          <BackendStatusWidget />
          <DatasetStatusWidget />
        </div>
      </div>
    </div>
  );
}

export default DesktopScreen;
