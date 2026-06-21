import { Route } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDecimal } from "@/lib/utils";
import { confidenceTone, tiiLevel, tiiTone } from "@/lib/risk";
import type { Hotspot, PlannerRecommendation } from "@/types";

export function PlannerPanel({
  recommendations,
  hotspots,
  isLoading,
}: {
  recommendations: PlannerRecommendation[];
  hotspots: Hotspot[];
  isLoading: boolean;
}) {
  const confidenceByHotspot = new Map(
    hotspots.map((hotspot) => [hotspot.hotspot_id, hotspot.confidence_level]),
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Deployment Planner</CardTitle>
          <Route className="text-cyan-200" size={20} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-28" />)
        ) : recommendations.length === 0 ? (
          <div className="rounded-md border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-400">
            Move the warden slider above zero to generate deployment orders.
          </div>
        ) : (
          recommendations.map((item) => {
            const confidence = confidenceByHotspot.get(item.hotspot_id) ?? "Confidence pending";
            return (
              <div key={`${item.team}-${item.hotspot_id}`} className="rounded-md border border-white/10 bg-slate-950/40 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-cyan-100">{item.team}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-100">{item.location}</p>
                  </div>
                  {item.is_emerging ? <Badge tone="danger">Emerging</Badge> : null}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge tone={tiiTone(item.TII)}>
                    {tiiLevel(item.TII)} · {formatDecimal(item.TII, 1)}
                  </Badge>
                  <Badge tone={confidenceTone(confidence)}>
                    {confidence}
                  </Badge>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
