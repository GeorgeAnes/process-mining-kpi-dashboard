import { useProcessMining, backendCommand } from "../../state/ProcessMiningContext";

export function BackendStatusWidget() {
  const { backendStatus, error, refreshBackend } = useProcessMining();
  const online = backendStatus === "online";

  return (
    <section className="desktop-widget">
      <div className="widget-title">Backend Connection</div>
      <div className={`system-light ${backendStatus}`}>{backendStatus.toUpperCase()}</div>
      <p>{online ? "FastAPI is connected on port 8020." : "Backend unavailable. Start FastAPI with:"}</p>
      {!online && <code>{backendCommand}</code>}
      {error && <p className="widget-error">{error}</p>}
      <button className="win-button" type="button" onClick={() => void refreshBackend()}>
        Retry
      </button>
    </section>
  );
}

export function DatasetStatusWidget() {
  const { datasets, csvText, analysis, backendStatus, loading, setCsvText, handleFile, runAnalysis, resetSample } =
    useProcessMining();
  const canRun = backendStatus === "online" && csvText.trim().length > 0 && !loading;

  return (
    <section className="desktop-widget dataset-widget">
      <div className="widget-title">Dataset Status</div>
      <div className="status-grid">
        <span>Dataset</span>
        <strong>{analysis?.dataset_name || datasets[0]?.title || "No dataset loaded"}</strong>
        <span>Rows</span>
        <strong>{datasets[0]?.row_count ?? "n/a"}</strong>
        <span>CSV Buffer</span>
        <strong>{csvText ? `${csvText.split(/\r?\n/).length} lines` : "empty"}</strong>
      </div>
      <label className="win-upload">
        Choose CSV
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
      </label>
      <textarea
        className="csv-terminal"
        value={csvText}
        onChange={(event) => setCsvText(event.target.value)}
        spellCheck={false}
        aria-label="Event log CSV"
      />
      <div className="win-button-row">
        <button className="win-button primary" type="button" onClick={() => void runAnalysis()} disabled={!canRun}>
          Run Analysis
        </button>
        <button className="win-button" type="button" onClick={() => void resetSample()} disabled={loading || backendStatus !== "online"}>
          Reset Sample
        </button>
      </div>
      {!canRun && <p className="readiness-note">Ready when backend is online and CSV text is loaded.</p>}
    </section>
  );
}
