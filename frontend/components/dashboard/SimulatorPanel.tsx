import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDecimal } from "@/lib/utils";
import type { SimulatorResult } from "@/types";

export function SimulatorPanel({
  wardens,
  onWardensChange,
  result,
  isLoading,
  onRefetch,
}: {
  wardens: number;
  onWardensChange: (value: number) => void;
  result?: SimulatorResult;
  isLoading: boolean;
  onRefetch: () => void;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Enforcement Simulator</CardTitle>
          <Button onClick={onRefetch} className="h-8 px-2">
            <RotateCcw size={14} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-300">Wardens deployed</span>
            <span className="font-mono text-cyan-100">{wardens}</span>
          </div>
          <input
            type="range"
            min={0}
            max={20}
            value={wardens}
            onChange={(event) => onWardensChange(Number(event.target.value))}
            className="mt-3 h-2 w-full accent-cyan-300"
          />
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Metric label="Current City TII" value={result?.current_city_tii ?? 0} />
            <Metric label="Future City TII" value={result?.future_city_tii ?? 0} />
            <Metric label="Improvement" value={result?.improvement_pct ?? 0} suffix="%" positive />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Metric({
  label,
  value,
  suffix = "",
  positive = false,
}: {
  label: string;
  value: number;
  suffix?: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-md border border-white/10 bg-slate-950/40 p-3">
      <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className={`mt-2 font-mono text-2xl ${positive ? "text-emerald-200" : "text-slate-100"}`}>
        {positive ? "+" : ""}
        {formatDecimal(value, 1)}
        {suffix}
      </p>
    </div>
  );
}
