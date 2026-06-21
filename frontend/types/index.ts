export type Summary = {
  total_violations: number;
  hotspots_count: number;
  emerging_count: number;
  avg_city_tii: number;
};

export type Hotspot = {
  hotspot_id: string;
  location: string;
  latitude: number;
  longitude: number;
  confidence_level: "High Confidence" | "Medium Confidence" | "Low Confidence" | string;
  violation_count: number;
  peak_hour: number;
  D: number;
  S: number;
  J: number;
  P: number;
  TII: number;
};

export type EmergingHotspot = {
  hotspot_id: string;
  location: string;
  historical_avg: number;
  recent_avg: number;
  escalation_pct: number;
  is_emerging: boolean;
};

export type SimulatorResult = {
  current_city_tii: number;
  future_city_tii: number;
  improvement_pct: number;
};

export type PlannerRecommendation = {
  team: string;
  hotspot_id: string;
  location: string;
  latitude: number;
  longitude: number;
  TII: number;
  is_emerging: boolean;
  recommendation: string;
};

export type TiiWeights = {
  density_weight: number;
  severity_weight: number;
  junction_weight: number;
  peak_weight: number;
};

export type ConfidenceDistribution = {
  "High Confidence": number;
  "Medium Confidence": number;
  "Low Confidence": number;
};

export type EmergingStats = {
  total_hotspots: number;
  emerging_hotspots: number;
  emerging_percentage: number;
  threshold: number;
  median_escalation: number;
  p90_escalation: number;
  max_escalation: number;
};

export type DashboardPayload = {
  summary: Summary;
  weights: TiiWeights;
  confidence_distribution: ConfidenceDistribution;
  hotspots: Hotspot[];
  emerging: EmergingHotspot[];
};

export type Health = {
  status: string;
  dataset_path: string | null;
  total_violations: number;
  message: string;
};
