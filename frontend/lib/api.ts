import type {
  ConfidenceDistribution,
  DashboardPayload,
  EmergingHotspot,
  EmergingStats,
  Health,
  Hotspot,
  PlannerRecommendation,
  SimulatorResult,
  Summary,
  TiiWeights,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const parkWiseApi = {
  health: () => request<Health>("/health"),
  summary: () => request<Summary>("/api/summary"),
  hotspots: () => request<Hotspot[]>("/api/hotspots"),
  emerging: () => request<EmergingHotspot[]>("/api/emerging"),
  planner: (wardens: number) => request<PlannerRecommendation[]>(`/api/planner?wardens=${wardens}`),
  simulator: (wardens: number) => request<SimulatorResult>(`/api/simulator?wardens=${wardens}`),
  weights: () => request<TiiWeights>("/api/debug/weights"),
  confidenceDistribution: () =>
    request<ConfidenceDistribution>("/api/debug/confidence-distribution"),
  emergingStats: () => request<EmergingStats>("/api/debug/emerging-stats"),
  dashboard: () => request<DashboardPayload>("/api/dashboard"),
};
