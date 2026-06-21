import { AlertTriangle, Gauge, MapPinned, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDecimal, formatNumber } from "@/lib/utils";
import type { Summary } from "@/types";

const items = [
  { key: "total_violations", label: "Total Violations", icon: ShieldCheck },
  { key: "hotspots_count", label: "Hotspots Detected", icon: MapPinned },
  { key: "emerging_count", label: "Emerging Hotspots", icon: AlertTriangle },
  { key: "avg_city_tii", label: "Average City TII", icon: Gauge },
] as const;

export function KPIGrid({ summary, isLoading }: { summary?: Summary; isLoading: boolean }) {
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        const value = summary?.[item.key] ?? 0;
        return (
          <Card key={item.key} className="p-4 transition hover:border-cyan-300/25 hover:bg-white/[0.04]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                {item.label}
              </p>
              <Icon className="text-cyan-200" size={18} />
            </div>
            {isLoading ? (
              <Skeleton className="mt-4 h-8 w-28" />
            ) : (
              <p className="mt-3 font-mono text-3xl font-semibold text-slate-50">
                {item.key === "avg_city_tii" ? formatDecimal(value, 1) : formatNumber(value)}
              </p>
            )}
          </Card>
        );
      })}
    </section>
  );
}
