import { Clock, Crosshair, MapPin, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDecimal, formatNumber } from "@/lib/utils";
import { confidenceTone, tiiLevel, tiiTone } from "@/lib/risk";
import type { Hotspot } from "@/types";

const breakdown = [
  { key: "D", label: "Density" },
  { key: "S", label: "Severity" },
  { key: "J", label: "Junction" },
  { key: "P", label: "Peak" },
] as const;

export function HotspotIntelligence({ hotspot }: { hotspot?: Hotspot | null }) {
  if (!hotspot) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Hotspot Intelligence</CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-[300px] items-center justify-center text-center text-sm text-slate-400">
          Select a hotspot on the map or table to inspect TII drivers, confidence, and enforcement timing.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Hotspot Intelligence</CardTitle>
            <p className="mt-2 text-lg font-semibold text-slate-50">{hotspot.location}</p>
          </div>
          <Badge tone={confidenceTone(hotspot.confidence_level)}>
            {hotspot.confidence_level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md border border-white/10 bg-slate-950/40 p-3">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-slate-500">
              <ShieldAlert size={14} />
              TII
            </p>
            <p className="mt-1 font-mono text-3xl text-rose-100">{formatDecimal(hotspot.TII, 1)}</p>
            <Badge tone={tiiTone(hotspot.TII)} className="mt-2">
              {tiiLevel(hotspot.TII)}
            </Badge>
          </div>
          <div className="rounded-md border border-white/10 bg-slate-950/40 p-3">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-slate-500">
              <Clock size={14} />
              Peak Hour
            </p>
            <p className="mt-1 font-mono text-3xl text-cyan-100">
              {String(hotspot.peak_hour).padStart(2, "0")}:00
            </p>
          </div>
          <div className="rounded-md border border-white/10 bg-slate-950/40 p-3">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-slate-500">
              <Crosshair size={14} />
              Violations
            </p>
            <p className="mt-1 font-mono text-2xl text-slate-50">
              {formatNumber(hotspot.violation_count)}
            </p>
          </div>
          <div className="rounded-md border border-white/10 bg-slate-950/40 p-3">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-slate-500">
              <MapPin size={14} />
              Grid Cell
            </p>
            <p className="mt-1 truncate font-mono text-sm text-slate-300">{hotspot.hotspot_id}</p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
            TII Breakdown
          </p>
          {breakdown.map((item) => {
            const value = hotspot[item.key];
            return (
              <div key={item.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{item.label} ({item.key})</span>
                  <span className="font-mono text-slate-100">{formatDecimal(value, 2)}</span>
                </div>
                <Progress value={value} indicatorClassName="bg-gradient-to-r from-cyan-300 to-rose-300" />
              </div>
            );
          })}
        </div>

        <div className="rounded-md border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm text-cyan-50">
          <p className="font-semibold">Operational readout</p>
          <p className="mt-1 text-cyan-100/80">
            Prioritize visible enforcement near the peak period and monitor follow-up density changes in the simulator.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
