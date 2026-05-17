import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { analyzeDataset, checkHealth, getSampleDataset, listDatasets } from "../api";
import type { AnalysisResponse, DatasetInfo } from "../types";

type BackendStatus = "checking" | "online" | "offline";

interface ProcessMiningContextValue {
  datasets: DatasetInfo[];
  csvText: string;
  analysis: AnalysisResponse | null;
  backendStatus: BackendStatus;
  loading: boolean;
  error: string | null;
  statusLabel: string;
  setCsvText: (value: string) => void;
  handleFile: (file: File) => Promise<void>;
  runAnalysis: () => Promise<void>;
  resetSample: () => Promise<void>;
  refreshBackend: () => Promise<void>;
}

const ProcessMiningContext = createContext<ProcessMiningContextValue | null>(null);

const backendCommand = "python -m uvicorn backend.app.main:app --reload --port 8020";

export function ProcessMiningProvider({ children }: { children: ReactNode }) {
  const [datasets, setDatasets] = useState<DatasetInfo[]>([]);
  const [csvText, setCsvText] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>("checking");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void initialize();
  }, []);

  async function initialize() {
    setLoading(true);
    setError(null);
    try {
      await checkHealth();
    } catch (err) {
      setBackendStatus("offline");
      setAnalysis(null);
      setError(
        `Backend unavailable. Start FastAPI with: ${backendCommand}`
      );
      if (err instanceof Error && err.message && !err.message.toLowerCase().includes("failed to fetch")) {
        setError(`${err.message} Start FastAPI with: ${backendCommand}`);
      }
      setLoading(false);
      return;
    }

    setBackendStatus("online");
    try {
      const [datasetList, sample] = await Promise.all([listDatasets(), getSampleDataset()]);
      setDatasets(datasetList);
      setCsvText(sample.content);
      setAnalysis(await analyzeDataset());
    } catch (err) {
      setAnalysis(null);
      setError(err instanceof Error ? err.message : "Could not load sample analysis.");
    } finally {
      setLoading(false);
    }
  }

  async function refreshBackend() {
    await initialize();
  }

  async function runAnalysis() {
    if (backendStatus !== "online") {
      setError(`Backend unavailable. Start FastAPI with: ${backendCommand}`);
      return;
    }
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
    if (backendStatus !== "online") {
      setError(`Backend unavailable. Start FastAPI with: ${backendCommand}`);
      return;
    }
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
    if (backendStatus === "checking") return "Checking backend";
    if (backendStatus === "offline") return "Backend offline";
    if (loading) return "Analyzing";
    if (analysis) return `${analysis.kpis.cases} cases analyzed`;
    return "Ready";
  }, [analysis, backendStatus, loading]);

  const value = useMemo(
    () => ({
      datasets,
      csvText,
      analysis,
      backendStatus,
      loading,
      error,
      statusLabel,
      setCsvText,
      handleFile,
      runAnalysis,
      resetSample,
      refreshBackend
    }),
    [analysis, backendStatus, csvText, datasets, error, loading, statusLabel]
  );

  return <ProcessMiningContext.Provider value={value}>{children}</ProcessMiningContext.Provider>;
}

export function useProcessMining() {
  const value = useContext(ProcessMiningContext);
  if (!value) {
    throw new Error("useProcessMining must be used inside ProcessMiningProvider.");
  }
  return value;
}

export { backendCommand };
