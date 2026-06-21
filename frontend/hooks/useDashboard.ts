"use client";

import { useQuery } from "@tanstack/react-query";
import { parkWiseApi } from "@/lib/api";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: parkWiseApi.dashboard,
  });
}

export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: parkWiseApi.health,
  });
}

export function useSummary() {
  return useQuery({
    queryKey: ["summary"],
    queryFn: parkWiseApi.summary,
  });
}

export function useHotspots() {
  return useQuery({
    queryKey: ["hotspots"],
    queryFn: parkWiseApi.hotspots,
  });
}

export function useEmerging() {
  return useQuery({
    queryKey: ["emerging"],
    queryFn: parkWiseApi.emerging,
  });
}

export function useConfidenceDistribution() {
  return useQuery({
    queryKey: ["confidence-distribution"],
    queryFn: parkWiseApi.confidenceDistribution,
  });
}

export function useEmergingStats() {
  return useQuery({
    queryKey: ["emerging-stats"],
    queryFn: parkWiseApi.emergingStats,
  });
}

export function useWeights() {
  return useQuery({
    queryKey: ["tii-weights"],
    queryFn: parkWiseApi.weights,
  });
}
