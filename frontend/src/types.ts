export interface DatasetInfo {
  id: string;
  title: string;
  description: string;
  filename: string;
  row_count?: number;
}

export interface DatasetSample extends DatasetInfo {
  content: string;
}

export interface KpiSummary {
  cases: number;
  events: number;
  activities: number;
  median_case_duration_hours: number;
  mean_case_duration_hours: number;
  sla_violation_rate: number;
  total_cost: number;
  average_cost_per_case: number;
}

export interface BottleneckTransition {
  transition: string;
  from_activity: string;
  to_activity: string;
  count: number;
  average_wait_hours: number;
  median_wait_hours: number;
  p90_wait_hours: number;
}

export interface ActivityWaitingTime {
  activity: string;
  count: number;
  average_wait_hours: number;
  median_wait_hours: number;
}

export interface VariantRow {
  variant: string;
  activities: string[];
  count: number;
  percent: number;
  cumulative_percent: number;
}

export interface SlaBreakdownRow {
  group: string;
  total_cases: number;
  violations: number;
  violation_rate: number;
  average_duration_hours: number;
}

export interface ReworkActivity {
  activity: string;
  repeat_cases: number;
  total_repeats: number;
}

export interface ReworkSummary {
  rework_cases: number;
  rework_rate: number;
  repeated_activity_count: number;
  top_repeated_activities: ReworkActivity[];
}

export interface ProcessEdge {
  from_activity: string;
  to_activity: string;
  count: number;
  average_hours: number;
}

export interface RecommendationCard {
  title: string;
  priority: "High" | "Medium" | "Low";
  rationale: string;
  suggested_action: string;
  metric: string;
}

export interface ExecutiveSummary {
  headline: string;
  narrative: string;
  key_findings: string[];
}

export interface AnalysisResponse {
  dataset_name: string;
  generated_at: string;
  kpis: KpiSummary;
  bottleneck_transitions: BottleneckTransition[];
  activity_waiting_times: ActivityWaitingTime[];
  variants: VariantRow[];
  sla_by_priority: SlaBreakdownRow[];
  sla_by_department: SlaBreakdownRow[];
  sla_by_resource: SlaBreakdownRow[];
  sla_by_customer_segment: SlaBreakdownRow[];
  rework: ReworkSummary;
  process_edges: ProcessEdge[];
  recommendations: RecommendationCard[];
  executive_summary: ExecutiveSummary;
  warnings: string[];
}

export interface AssistantResponse {
  mode: "deterministic" | "openai_compatible";
  status: "completed" | "disabled" | "not_configured" | "error";
  answer: string;
  provider?: string;
  model?: string;
  error?: string;
}
