import { ShieldCheck } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/utils";
import type { ConfidenceDistribution } from "@/types";

const rows = [
  { key: "High Confidence", color: "bg-emerald-300", hex: "#6ee7b7" },
  { key: "Medium Confidence", color: "bg-amber-300", hex: "#fcd34d" },
  { key: "Low Confidence", color: "bg-rose-300", hex: "#fda4af" },
] as const;

export function ReliabilityPanel({
  distribution,
  isLoading = false,
}: {
  distribution?: ConfidenceDistribution;
  isLoading?: boolean;
}) {
  const total = rows.reduce((sum, row) => sum + (distribution?.[row.key] ?? 0), 0);
  const chartData = rows.map((row) => ({
    name: row.key,
    value: distribution?.[row.key] ?? 0,
    fill: row.hex,
  }));

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Data Quality Engine</CardTitle>
          <ShieldCheck className="text-emerald-200" size={20} />
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {isLoading ? (
          <>
            <Skeleton className="mx-auto h-36 w-36 rounded-full" />
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-9" />
            ))}
          </>
        ) : (
          <>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={44}
                outerRadius={68}
                paddingAngle={3}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "rgba(15, 23, 42, 0.96)",
                  border: "1px solid rgba(148, 163, 184, 0.24)",
                  borderRadius: 8,
                  color: "#e2e8f0",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {rows.map((row) => {
          const value = distribution?.[row.key] ?? 0;
          const share = total > 0 ? value / total : 0;
          return (
            <div key={row.key} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">{row.key}</span>
                <span className="font-mono text-slate-100">{formatNumber(value)}</span>
              </div>
              <Progress value={share} indicatorClassName={row.color} />
            </div>
          );
        })}
        <div className="rounded-md border border-white/10 bg-slate-950/40 p-3 text-xs text-slate-400">
          Confidence is derived from device rejection behavior and hotspot reliability adjustment.
        </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
