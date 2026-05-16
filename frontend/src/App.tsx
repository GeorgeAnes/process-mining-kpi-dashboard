import { useEffect, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { analyzeDataset, getSampleDataset, listDatasets } from "./api";
import type { AnalysisResponse, DatasetInfo } from "./types";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import KpiCards from "./components/KpiCards";
import BottleneckChart from "./components/BottleneckChart";
import SlaChart from "./components/SlaChart";
import VariantTable from "./components/VariantTable";
import ReworkPanel from "./components/ReworkPanel";
import ProcessMap from "./components/ProcessMap";
import ExecutiveSummary from "./components/ExecutiveSummary";
import RecommendationCards from "./components/RecommendationCards";
import ReportExport from "./components/ReportExport";
import AssistantPanel from "./components/AssistantPanel";

function App() {
  const [datasets, setDatasets] = useState<DatasetInfo[]>([]);
  const [csvText, setCsvText] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void initialize();
  }, []);

  async function initialize() {
    setLoading(true);
    setError(null);
    try {
      const [datasetList, sample] = await Promise.all([listDatasets(), getSampleDataset()]);
      setDatasets(datasetList);
      setCsvText(sample.content);
      setAnalysis(await analyzeDataset());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  async function runAnalysis() {
    setLoading(true);
    setError(null);
    try {
      setAnalysis(await analyzeDataset(csvText));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  async function resetSample() {
    setLoading(true);
    setError(null);
    try {
      const sample = await getSampleDataset();
      setCsvText(sample.content);
      setAnalysis(await analyzeDataset());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset sample data.");
    } finally {
      setLoading(false);
    }
  }

  async function handleFile(file: File) {
    setCsvText(await file.text());
  }

  const statusLabel = useMemo(() => {
    if (loading) return "Analyzing";
    if (analysis) return `${analysis.kpis.cases} cases analyzed`;
    return "Ready";
  }, [analysis, loading]);

  return (
    <div className="app-shell">
      <Header statusLabel={statusLabel} />
      <div className="workspace">
        <Sidebar
          datasets={datasets}
          csvText={csvText}
          loading={loading}
          onCsvTextChange={setCsvText}
          onFile={handleFile}
          onRun={runAnalysis}
          onReset={resetSample}
        />
        <main className="dashboard">
          {error && (
            <section className="alert" role="alert">
              <AlertTriangle size={18} />
              <span>{error}</span>
            </section>
          )}

          {!analysis && !loading && (
            <section className="empty-state">
              <h2>No analysis yet</h2>
              <p>Load the sample event log or paste a CSV file, then run the dashboard.</p>
            </section>
          )}

          {analysis && (
            <>
              <ExecutiveSummary summary={analysis.executive_summary} datasetName={analysis.dataset_name} />
              <KpiCards kpis={analysis.kpis} />
              <div className="grid two">
                <BottleneckChart bottlenecks={analysis.bottleneck_transitions} />
                <SlaChart rows={analysis.sla_by_priority} title="SLA violations by priority" />
              </div>
              <div className="grid two">
                <SlaChart rows={analysis.sla_by_department} title="SLA violations by department" />
                <ReworkPanel rework={analysis.rework} />
              </div>
              <div className="grid two">
                <VariantTable variants={analysis.variants} />
                <ProcessMap edges={analysis.process_edges} />
              </div>
              <RecommendationCards cards={analysis.recommendations} />
              <div className="grid two">
                <AssistantPanel analysis={analysis} />
                <ReportExport analysis={analysis} />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
