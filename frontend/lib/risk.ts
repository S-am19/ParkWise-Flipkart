import type { Hotspot } from "@/types";

export function confidenceTone(confidence?: string) {
  if (confidence === "High Confidence") return "success";
  if (confidence === "Medium Confidence") return "warning";
  return "danger";
}

export function tiiLevel(tii: number) {
  if (tii >= 70) return "High TII";
  if (tii >= 40) return "Medium TII";
  return "Low TII";
}

export function tiiTone(tii: number) {
  if (tii >= 70) return "danger";
  if (tii >= 40) return "warning";
  return "success";
}

export function tiiMarkerColor(tii: number) {
  if (tii >= 70) return "#fb7185";
  if (tii >= 40) return "#facc15";
  return "#34d399";
}

export function sortByTii(hotspots: Hotspot[]) {
  return [...hotspots].sort((a, b) => b.TII - a.TII);
}
