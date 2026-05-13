"use client";

import { useMemo } from "react";
import { clsx } from "clsx";
import { useDashboardFilters } from "@/context/dashboard-filters";
import { getKpis } from "@/lib/analytics";

function formatInt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

type CardProps = {
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
  icon: string;
};

function KpiCard({ label, value, delta, positive, icon }: CardProps) {
  return (
    <div className="glass-panel hover-lift group relative overflow-hidden p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="text-lg text-primary opacity-80 transition group-hover:scale-105">
          {icon}
        </span>
        {delta ? (
          <span
            className={clsx(
              "rounded-full px-2 py-0.5 text-[11px] font-semibold",
              positive
                ? "bg-emerald-500/10 text-emerald-700"
                : "bg-rose-500/10 text-rose-700"
            )}
          >
            {delta}
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-slate-600">
        {label}
      </p>
      <p className="mt-1 font-mono text-2xl font-semibold tracking-tight text-slate-900">
        {value}
      </p>
    </div>
  );
}

export function KpiGrid() {
  const { filters } = useDashboardFilters();
  const kpis = useMemo(() => getKpis(filters), [filters]);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">People metrics</h2>
        <p className="text-xs text-slate-600">
          Values react to product, geography, platform, and segment filters.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon="◎"
          label="Active users (7d)"
          value={formatInt(kpis.activeUsers7)}
          delta="+4.2%"
          positive
        />
        <KpiCard
          icon="◆"
          label="New users (30d)"
          value={formatInt(kpis.newUsers30)}
          delta="+2.1%"
          positive
        />
        <KpiCard
          icon="▣"
          label="DAU / WAU / MAU"
          value={`${formatInt(kpis.dau)} · ${formatInt(kpis.wau)} · ${formatInt(kpis.mau)}`}
        />
        <KpiCard
          icon="⟲"
          label="Stickiness (DAU/MAU)"
          value={`${kpis.stickiness}%`}
          delta="+0.6pp"
          positive
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon="↗"
          label="Retention D1 / D7 / D30"
          value={`${kpis.retentionD1}% · ${kpis.retentionD7}% · ${kpis.retentionD30}%`}
        />
        <KpiCard
          icon="⚑"
          label="Churn rate"
          value={`${kpis.churn}%`}
          delta="-0.3pp"
          positive
        />
        <KpiCard
          icon="✦"
          label="Active users (30d)"
          value={formatInt(kpis.activeUsers30)}
        />
        <KpiCard
          icon="◇"
          label="Active users (90d)"
          value={formatInt(kpis.activeUsers90)}
        />
      </div>
    </section>
  );
}
