"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { RefreshCw, Satellite, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeroMetric } from "@/components/dashboard/HeroMetric";
import { KPIGrid } from "@/components/dashboard/KPIGrid";
import { HotspotIntelligence } from "@/components/dashboard/HotspotIntelligence";
import { EmergingPanel } from "@/components/dashboard/EmergingPanel";
import { ReliabilityPanel } from "@/components/dashboard/ReliabilityPanel";
import { SimulatorPanel } from "@/components/dashboard/SimulatorPanel";
import { PlannerPanel } from "@/components/dashboard/PlannerPanel";
import { TopHotspots } from "@/components/dashboard/TopHotspots";
import { RecommendationsPanel } from "@/components/dashboard/RecommendationsPanel";
import {
  useConfidenceDistribution,
  useDashboard,
  useEmerging,
  useEmergingStats,
  useHealth,
  useHotspots,
  useSummary,
  useWeights,
} from "@/hooks/useDashboard";
import { usePlanner } from "@/hooks/usePlanner";
import { useSimulator } from "@/hooks/useSimulator";
import type { Hotspot } from "@/types";

const HotspotMap = dynamic(
  () => import("@/components/dashboard/HotspotMap").then((mod) => mod.HotspotMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[420px] animate-pulse rounded-lg border border-white/10 bg-white/10 lg:h-[560px]" />
    ),
  },
);

export default function Home() {
  const [wardens, setWardens] = useState(10);
  const dashboardQuery = useDashboard();
  const healthQuery = useHealth();
  const summaryQuery = useSummary();
  const hotspotsQuery = useHotspots();
  const emergingQuery = useEmerging();
  const confidenceQuery = useConfidenceDistribution();
  const emergingStatsQuery = useEmergingStats();
  const weightsQuery = useWeights();
  const heroSimulatorQuery = useSimulator(20);
  const simulatorQuery = useSimulator(wardens);
  const plannerQuery = usePlanner(wardens);

  const summary = summaryQuery.data ?? dashboardQuery.data?.summary;
  const hotspots = useMemo(
    () => hotspotsQuery.data ?? dashboardQuery.data?.hotspots ?? [],
    [dashboardQuery.data?.hotspots, hotspotsQuery.data],
  );
  const emerging = emergingQuery.data ?? dashboardQuery.data?.emerging ?? [];
  const confidenceDistribution =
    confidenceQuery.data ?? dashboardQuery.data?.confidence_distribution;
  const emergingStats = emergingStatsQuery.data;
  const weights = weightsQuery.data ?? dashboardQuery.data?.weights;
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
  const selectedHotspot =
    hotspots.find((hotspot) => hotspot.hotspot_id === selectedHotspotId) ?? hotspots[0] ?? null;

  function selectHotspot(hotspot: Hotspot) {
    setSelectedHotspotId(hotspot.hotspot_id);
  }

  const isInitialLoading =
    dashboardQuery.isLoading || summaryQuery.isLoading || hotspotsQuery.isLoading;
  const hasError =
    dashboardQuery.isError ||
    summaryQuery.isError ||
    hotspotsQuery.isError ||
    heroSimulatorQuery.isError ||
    confidenceQuery.isError ||
    emergingQuery.isError ||
    emergingStatsQuery.isError ||
    weightsQuery.isError ||
    simulatorQuery.isError ||
    plannerQuery.isError;

  function refetchAll() {
    void dashboardQuery.refetch();
    void healthQuery.refetch();
    void summaryQuery.refetch();
    void hotspotsQuery.refetch();
    void emergingQuery.refetch();
    void confidenceQuery.refetch();
    void emergingStatsQuery.refetch();
    void weightsQuery.refetch();
    void heroSimulatorQuery.refetch();
    void simulatorQuery.refetch();
    void plannerQuery.refetch();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1800px] flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
      <header className="rounded-lg border border-white/10 bg-slate-950/70 p-5 shadow-glow backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge tone={healthQuery.data?.status === "ready" ? "success" : "warning"}>
                <Server size={13} className="mr-1" />
                Backend {healthQuery.data?.status ?? "checking"}
              </Badge>
              <Badge tone="info">
                <Satellite size={13} className="mr-1" />
                Bengaluru Traffic Command Dashboard
              </Badge>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
              PARKWISE
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-50 md:text-5xl">
              AI-Powered Parking Intelligence System
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-slate-400 md:text-base">
              Traffic enforcement decision support for hotspot risk, data confidence,
              emerging escalation, and officer deployment planning.
            </p>
          </div>
          <Button onClick={refetchAll} className="w-full gap-2 lg:w-auto">
            <RefreshCw size={16} />
            Refetch command data
          </Button>
        </div>
      </header>

      {hasError ? (
        <section className="rounded-lg border border-rose-300/30 bg-rose-400/10 p-4 text-sm text-rose-100">
          Unable to reach the ParkWise backend. Start FastAPI on the configured
          `NEXT_PUBLIC_API_BASE_URL`, then refetch command data.
        </section>
      ) : null}

      <HeroMetric result={heroSimulatorQuery.data} isLoading={heroSimulatorQuery.isLoading} />
      <KPIGrid summary={summary} isLoading={isInitialLoading} />

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(380px,0.75fr)]">
        <HotspotMap
          hotspots={hotspots}
          selectedHotspot={selectedHotspot}
          onSelectHotspot={selectHotspot}
          isLoading={hotspotsQuery.isLoading}
        />
        <div className="space-y-5">
          <HotspotIntelligence hotspot={selectedHotspot} />
          <RecommendationsPanel hotspot={selectedHotspot} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <EmergingPanel
          emerging={emerging}
          stats={emergingStats}
          isLoading={emergingQuery.isLoading || emergingStatsQuery.isLoading}
        />
        <ReliabilityPanel
          distribution={confidenceDistribution}
          isLoading={confidenceQuery.isLoading}
        />
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SimulatorPanel
          wardens={wardens}
          onWardensChange={setWardens}
          result={simulatorQuery.data}
          isLoading={simulatorQuery.isLoading}
          onRefetch={() => void simulatorQuery.refetch()}
        />
        <PlannerPanel
          recommendations={plannerQuery.data ?? []}
          hotspots={hotspots}
          isLoading={plannerQuery.isLoading}
        />
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_340px]">
        <TopHotspots
          hotspots={hotspots}
          selectedHotspot={selectedHotspot}
          onSelectHotspot={selectHotspot}
          isLoading={hotspotsQuery.isLoading}
        />
        <aside className="rounded-lg border border-white/10 bg-slate-950/70 p-5 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            TII weighting
          </p>
          <div className="mt-4 space-y-3 text-sm">
            <Weight label="Density" value={weights?.density_weight ?? 0} />
            <Weight label="Severity" value={weights?.severity_weight ?? 0} />
            <Weight label="Junction" value={weights?.junction_weight ?? 0} />
            <Weight label="Peak" value={weights?.peak_weight ?? 0} />
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">
            Weights are variance-derived, capped at 40%, and normalized by the backend TII engine.
          </p>
        </aside>
      </section>
    </main>
  );
}

function Weight({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2">
      <span className="text-slate-300">{label}</span>
      <span className="font-mono text-cyan-100">{Math.round(value * 100)}%</span>
    </div>
  );
}
