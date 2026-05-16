import { FileUp, Play, RotateCcw } from "lucide-react";
import type { DatasetInfo } from "../types";

interface SidebarProps {
  datasets: DatasetInfo[];
  csvText: string;
  loading: boolean;
  onCsvTextChange: (value: string) => void;
  onFile: (file: File) => void;
  onRun: () => void;
  onReset: () => void;
}

function Sidebar({ datasets, csvText, loading, onCsvTextChange, onFile, onRun, onReset }: SidebarProps) {
  return (
    <aside className="sidebar">
      <section className="panel compact">
        <h2>Dataset</h2>
        <label className="field-label" htmlFor="dataset-select">
          Included sample
        </label>
        <select id="dataset-select" value="sample" disabled>
          {datasets.map((dataset) => (
            <option value={dataset.id} key={dataset.id}>
              {dataset.title}
            </option>
          ))}
        </select>
        <p className="muted">Synthetic IT incident-management event log with SLA, resource, cost, and segment fields.</p>
      </section>

      <section className="panel compact">
        <h2>Upload or paste CSV</h2>
        <label className="upload-target">
          <FileUp size={18} />
          <span>Choose CSV</span>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void onFile(file);
            }}
          />
        </label>
        <textarea
          value={csvText}
          onChange={(event) => onCsvTextChange(event.target.value)}
          spellCheck={false}
          aria-label="Event log CSV"
        />
        <div className="button-row">
          <button className="primary" onClick={onRun} disabled={loading}>
            <Play size={16} />
            Run analysis
          </button>
          <button className="secondary" onClick={onReset} disabled={loading}>
            <RotateCcw size={16} />
            Reset sample
          </button>
        </div>
      </section>
    </aside>
  );
}

export default Sidebar;
