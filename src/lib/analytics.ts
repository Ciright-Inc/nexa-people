import type { DashboardFiltersState } from "./types";

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
    filters.platform,
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
