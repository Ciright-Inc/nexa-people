import type { DashboardFiltersState } from "./types";
import { MAP_POINTS } from "./mock-data";

function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type KpiPack = {
  activeUsers7: number;
  activeUsers30: number;
  activeUsers90: number;
  newUsers7: number;
  newUsers30: number;
  dau: number;
  wau: number;
  mau: number;
  stickiness: number;
  retentionD1: number;
  retentionD7: number;
  retentionD30: number;
  churn: number;
};

export function getKpis(filters: DashboardFiltersState): KpiPack {
  const key = [
    filters.productId,
    filters.geographyId ?? "global",
    [...filters.platforms].sort().join(","),
    filters.segment,
    filters.datePreset,
  ].join("|");
  const rnd = mulberry32(hashSeed(key));
  const scale = 0.85 + rnd() * 0.35;

  const base = 12000 + (hashSeed(filters.productId) % 8000);
  const geoFactor = filters.geographyId ? 0.35 + rnd() * 0.25 : 1;

  const mau = Math.round(base * scale * geoFactor);
  const dau = Math.round(mau * (0.08 + rnd() * 0.06));
  const wau = Math.round(mau * (0.28 + rnd() * 0.08));

  return {
    activeUsers7: Math.round(dau * 5.2 * geoFactor),
    activeUsers30: Math.round(wau * 3.4 * geoFactor),
    activeUsers90: mau,
    newUsers7: Math.round(mau * (0.04 + rnd() * 0.02)),
    newUsers30: Math.round(mau * (0.11 + rnd() * 0.04)),
    dau,
    wau,
    mau,
    stickiness: Number(((dau / mau) * 100).toFixed(1)),
    retentionD1: Number((42 + rnd() * 18).toFixed(1)),
    retentionD7: Number((28 + rnd() * 12).toFixed(1)),
    retentionD30: Number((14 + rnd() * 8).toFixed(1)),
    churn: Number((2.1 + rnd() * 1.8).toFixed(1)),
  };
}

/** Hero KPI strip — deterministic from filters (layout matches product mock). */
export type HeroKpiMetric = {
  label: string;
  value: string;
  delta: string;
};

export function getHeroKpiMetrics(filters: DashboardFiltersState): HeroKpiMetric[] {
  const rnd = mulberry32(
    hashSeed(
      `hero|${filters.productId}|${filters.datePreset}|${filters.geographyId ?? "g"}|${filters.segment}|${filters.minActiveUsers}`
    )
  );
  const { mau } = getKpis(filters);
  const displayMau = Math.round(mau * (88 + rnd() * 52));
  const activeVal =
    displayMau >= 1_000_000
      ? `${(displayMau / 1_000_000).toFixed(1)}M`
      : displayMau >= 1000
        ? `${(displayMau / 1000).toFixed(1)}k`
        : `${displayMau}`;

  const latency = Math.round(32 + rnd() * 35);
  const reqB = 1.1 + rnd() * 1.2;
  const ingress = 2.0 + rnd() * 2.8;

  const d1 = 8 + rnd() * 12;
  const d2 = 2 + rnd() * 4;
  const d3 = 5 + rnd() * 8;
  const d4 = 18 + rnd() * 12;

  return [
    { label: "ACTIVE USER BASE", value: activeVal, delta: `+${d1.toFixed(1)}%` },
    { label: "MEDIAN LATENCY PROXY", value: `${latency}ms`, delta: `${d2.toFixed(1)}%` },
    { label: "REQUEST VOLUME ESTIMATE", value: `${reqB.toFixed(1)}B`, delta: `+${d3.toFixed(1)}%` },
    { label: "INGRESS ESTIMATE", value: `${ingress.toFixed(1)} PB`, delta: `+${d4.toFixed(1)}%` },
  ];
}

export type SeriesPoint = { t: string; users: number; sessions: number };

export function getActiveSeries(filters: DashboardFiltersState): SeriesPoint[] {
  const rnd = mulberry32(hashSeed(`series|${filters.productId}|${filters.geographyId ?? "g"}`));
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const base = 400 + (hashSeed(filters.productId) % 200);
  return hours.map((h) => {
    const wave = Math.sin((h / 24) * Math.PI * 2) * 0.12;
    const jitter = (rnd() - 0.5) * 0.08;
    const users = Math.round(base * (1 + wave + jitter));
    return {
      t: `${String(h).padStart(2, "0")}:00`,
      users,
      sessions: Math.round(users * (1.35 + rnd() * 0.2)),
    };
  });
}

export type FunnelStep = { step: string; value: number };

export function getFunnel(filters: DashboardFiltersState): FunnelStep[] {
  const rnd = mulberry32(hashSeed(`funnel|${filters.productId}`));
  let v = 100000 + rnd() * 20000;
  const steps = ["Signup", "Verify email", "Activation", "Key action"];
  return steps.map((step) => {
    const drop = 0.55 + rnd() * 0.15;
    v = Math.round(v * drop);
    return { step, value: v };
  });
}

export type CohortCell = { week: string; values: number[] };

export function getCohortHeatmap(filters: DashboardFiltersState): CohortCell[] {
  const rnd = mulberry32(hashSeed(`cohort|${filters.productId}`));
  const weeks = ["W1", "W2", "W3", "W4", "W5"];
  return weeks.map((week) => ({
    week,
    values: Array.from({ length: 6 }, () =>
      Math.round(35 + rnd() * 55)
    ),
  }));
}

export type SegmentRow = {
  label: string;
  share: number;
  sessions: number;
};

export function getSegments(filters: DashboardFiltersState): SegmentRow[] {
  const rnd = mulberry32(hashSeed(`seg|${filters.productId}|${filters.segment}`));
  const rows = [
    { label: "Enterprise", base: 0.28 },
    { label: "Pro", base: 0.41 },
    { label: "Free", base: 0.31 },
  ];
  return rows.map((r) => ({
    label: r.label,
    share: Number((r.base + (rnd() - 0.5) * 0.06).toFixed(2)),
    sessions: Math.round(80000 * (0.7 + rnd() * 0.5)),
  }));
}

export type DemandPoint = { t: string; v: number };

export function getDemandNormalizedSeries(
  filters: DashboardFiltersState
): DemandPoint[] {
  const raw = getActiveSeries(filters);
  const maxU = Math.max(...raw.map((r) => r.users), 1);
  return raw.map((r) => ({
    t: r.t,
    v: Number((r.users / maxU).toFixed(4)),
  }));
}

export type RegionalNetworkRow = {
  market: string;
  status: "optimal" | "high load" | "maintenance";
  ping: number;
};

export function getRegionalNetworkRows(
  filters: DashboardFiltersState
): RegionalNetworkRow[] {
  const rnd = mulberry32(
    hashSeed(`regional|${filters.productId}|${filters.geographyId ?? "g"}`)
  );
  return MAP_POINTS.map((pt) => {
    const roll = rnd();
    const status: RegionalNetworkRow["status"] =
      roll > 0.88 ? "maintenance" : roll > 0.58 ? "high load" : "optimal";
    const ping = Math.round(14 + rnd() * 165);
    return { market: pt.name, status, ping };
  });
}
