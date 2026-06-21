import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDecimal } from "@/lib/utils";
import type { EmergingHotspot, EmergingStats } from "@/types";

export function EmergingPanel({
  emerging,
  stats,
  isLoading = false,
}: {
  emerging: EmergingHotspot[];
  stats?: EmergingStats;
  isLoading?: boolean;
}) {
  const top = [...emerging]
    .sort((a, b) => b.escalation_pct - a.escalation_pct)
    .slice(0, 8);

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Emerging Hotspots</CardTitle>
          <Badge tone="danger">
            <AlertTriangle size={13} className="mr-1" />
            {stats ? `${formatDecimal(stats.emerging_percentage, 1)}% rising` : "Scanning"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-24" />)
        ) : top.length === 0 ? (
          <div className="rounded-md border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-400">
            No emerging hotspot alerts are currently above threshold.
          </div>
        ) : (
        top.map((item) => (
          <div key={item.hotspot_id} className="rounded-md border border-rose-300/15 bg-rose-400/5 p-3">
            <div className="flex items-start justify-between gap-3">
              <p className="line-clamp-2 text-sm font-medium text-slate-100">{item.location}</p>
              <span className="font-mono text-sm text-rose-100">
                +{formatDecimal(item.escalation_pct, 1)}%
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400">
              <span>Historical Avg</span>
              <span className="text-right font-mono text-slate-200">
                {formatDecimal(item.historical_avg, 2)}
              </span>
              <span>Recent Avg</span>
              <span className="text-right font-mono text-slate-200">
                {formatDecimal(item.recent_avg, 2)}
              </span>
            </div>
          </div>
        ))
        )}
      </CardContent>
    </Card>
  );
}
