import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDecimal } from "@/lib/utils";
import { confidenceTone, sortByTii, tiiLevel, tiiTone } from "@/lib/risk";
import type { Hotspot } from "@/types";

export function TopHotspots({
  hotspots,
  selectedHotspot,
  onSelectHotspot,
  isLoading = false,
}: {
  hotspots: Hotspot[];
  selectedHotspot?: Hotspot | null;
  onSelectHotspot: (hotspot: Hotspot) => void;
  isLoading?: boolean;
}) {
  const top = sortByTii(hotspots).slice(0, 12);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Priority Hotspots</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-11" />
            ))}
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.14em] text-slate-500">
              <tr className="border-b border-white/10">
                <th className="py-3 pr-3">Rank</th>
                <th className="py-3 pr-3">Location</th>
                <th className="py-3 pr-3">TII</th>
                <th className="py-3 pr-3">Confidence</th>
                <th className="py-3 pr-3">Peak</th>
              </tr>
            </thead>
            <tbody>
              {top.map((hotspot, index) => {
                const selected = selectedHotspot?.hotspot_id === hotspot.hotspot_id;
                return (
                  <tr
                    key={hotspot.hotspot_id}
                    onClick={() => onSelectHotspot(hotspot)}
                    className={`cursor-pointer border-b border-white/5 transition hover:bg-cyan-300/10 ${
                      selected ? "bg-cyan-300/15 ring-1 ring-cyan-300/40" : ""
                    }`}
                  >
                    <td className="py-3 pr-3 font-mono text-slate-400">#{index + 1}</td>
                    <td className="max-w-[420px] py-3 pr-3">
                      <div className="flex items-center gap-2">
                        <ChevronRight size={16} className="text-cyan-200" />
                        <span className="truncate text-slate-100">{hotspot.location}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-3 font-mono text-rose-100">
                      <Badge tone={tiiTone(hotspot.TII)}>
                        {tiiLevel(hotspot.TII)} · {formatDecimal(hotspot.TII, 1)}
                      </Badge>
                    </td>
                    <td className="py-3 pr-3">
                      <Badge tone={confidenceTone(hotspot.confidence_level)}>
                        {hotspot.confidence_level}
                      </Badge>
                    </td>
                    <td className="py-3 pr-3 font-mono text-slate-300">
                      {String(hotspot.peak_hour).padStart(2, "0")}:00
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )}
      </CardContent>
    </Card>
  );
}
