import type { AnalysisResponse, AssistantResponse, DatasetInfo, DatasetSample } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
    ...options
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function listDatasets(): Promise<DatasetInfo[]> {
  return request<DatasetInfo[]>("/datasets");
}

export function getSampleDataset(): Promise<DatasetSample> {
  return request<DatasetSample>("/datasets/sample");
}

export function analyzeDataset(csvText?: string): Promise<AnalysisResponse> {
  return request<AnalysisResponse>("/analyze", {
    method: "POST",
    body: JSON.stringify(csvText ? { csv_text: csvText, filename: "Pasted event log" } : { dataset_id: "sample" })
  });
}

export async function exportAnalysis(analysis: AnalysisResponse, format: "markdown" | "json"): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ analysis, format })
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.text();
}

export function askAssistant(
  analysis: AnalysisResponse,
  question: string,
  useLlm: boolean
): Promise<AssistantResponse> {
  return request<AssistantResponse>("/assistant", {
    method: "POST",
    body: JSON.stringify({ analysis, question, use_llm: useLlm })
  });
}
