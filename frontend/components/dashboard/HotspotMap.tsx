"use client";

import { useEffect, useMemo } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDecimal, formatNumber } from "@/lib/utils";
import { confidenceTone, tiiLevel, tiiMarkerColor, tiiTone } from "@/lib/risk";
import type { Hotspot } from "@/types";

const bengaluru: [number, number] = [12.9716, 77.5946];

function MapFlyTo({ hotspot }: { hotspot?: Hotspot | null }) {
  const map = useMap();

  useEffect(() => {
    if (hotspot) {
      map.flyTo([hotspot.latitude, hotspot.longitude], 15, { duration: 0.8 });
    }
  }, [hotspot, map]);

  return null;
}

export function HotspotMap({
  hotspots,
  selectedHotspot,
  onSelectHotspot,
  isLoading,
}: {
  hotspots: Hotspot[];
  selectedHotspot?: Hotspot | null;
  onSelectHotspot: (hotspot: Hotspot) => void;
  isLoading: boolean;
}) {
  const visibleHotspots = useMemo(() => hotspots.slice(0, 900), [hotspots]);

  if (isLoading) {
    return <Skeleton className="h-[420px] rounded-lg lg:h-[560px]" />;
  }

  return (
    <Card className="relative h-[420px] overflow-hidden p-0 lg:h-[560px]">
      <div className="absolute z-[500] m-4 rounded-md border border-white/10 bg-slate-950/85 px-3 py-2 text-xs text-slate-300 shadow-glow backdrop-blur">
        <span className="font-semibold text-cyan-100">{visibleHotspots.length}</span> mapped priority cells
        <div className="mt-2 flex gap-2">
          <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-emerald-300" />Low</span>
          <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-amber-300" />Medium</span>
          <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-rose-300" />High</span>
        </div>
      </div>
      <MapContainer center={bengaluru} zoom={12} scrollWheelZoom className="z-0">
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapFlyTo hotspot={selectedHotspot} />
        {visibleHotspots.map((hotspot) => {
          const color = tiiMarkerColor(hotspot.TII);
          const selected = selectedHotspot?.hotspot_id === hotspot.hotspot_id;
          return (
            <CircleMarker
              key={hotspot.hotspot_id}
              center={[hotspot.latitude, hotspot.longitude]}
              radius={selected ? 11 : Math.max(5, Math.min(12, hotspot.TII / 9))}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: selected ? 0.9 : 0.62,
                weight: selected ? 3 : 1,
              }}
              eventHandlers={{
                click: () => onSelectHotspot(hotspot),
              }}
            >
              <Popup>
                <div className="min-w-52 space-y-2">
                  <p className="font-semibold text-slate-100">{hotspot.location}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span className="text-slate-400">TII</span>
                    <Badge tone={tiiTone(hotspot.TII)}>
                      {tiiLevel(hotspot.TII)} · {formatDecimal(hotspot.TII, 1)}
                    </Badge>
                    <span className="text-slate-400">Confidence</span>
                    <Badge tone={confidenceTone(hotspot.confidence_level)}>
                      {hotspot.confidence_level}
                    </Badge>
                    <span className="text-slate-400">Violations</span>
                    <span>{formatNumber(hotspot.violation_count)}</span>
                    <span className="text-slate-400">Peak hour</span>
                    <span>{String(hotspot.peak_hour).padStart(2, "0")}:00</span>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </Card>
  );
}
