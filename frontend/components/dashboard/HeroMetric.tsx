import { Activity, RadioTower } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDecimal } from "@/lib/utils";
import type { SimulatorResult } from "@/types";

export function HeroMetric({
  result,
  isLoading,
}: {
  result?: SimulatorResult;
  isLoading: boolean;
}) {
  return (
    <Card className="relative overflow-hidden border-cyan-300/20 bg-gradient-to-br from-cyan-400/15 via-card to-rose-500/10 p-6">
      <div className="absolute right-6 top-6 hidden text-cyan-200/25 md:block">
        <RadioTower size={92} strokeWidth={1.2} />
      </div>
      <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-cyan-100">
            <Activity size={14} />
            Live enforcement simulation
          </div>
          <h1 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
            Potential Traffic Impact Reduction
          </h1>
          {isLoading ? (
            <Skeleton className="mt-4 h-16 w-56" />
          ) : (
            <p className="mt-2 font-mono text-6xl font-semibold tracking-tight text-cyan-100 md:text-7xl">
              +{formatDecimal(result?.improvement_pct ?? 0, 1)}%
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm text-slate-300 md:w-80">
          <div className="rounded-md border border-white/10 bg-black/20 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Current TII</p>
            <p className="mt-1 font-mono text-2xl text-slate-100">
              {formatDecimal(result?.current_city_tii ?? 0, 1)}
            </p>
          </div>
          <div className="rounded-md border border-white/10 bg-black/20 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Projected TII</p>
            <p className="mt-1 font-mono text-2xl text-emerald-200">
              {formatDecimal(result?.future_city_tii ?? 0, 1)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
