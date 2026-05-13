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
  caption: string;
  delta?: string;
  positive?: boolean;
  icon: string;
};

function KpiCard({ label, value, caption, delta, positive, icon }: CardProps) {
  return (
    <div className="dash-card group relative overflow-hidden p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-premiumLg">
      <div className="flex items-start justify-between gap-2">
        <span className="text-base text-slate-400 transition group-hover:text-slate-600">
          {icon}
        </span>
        {delta ? (
          <span
            className={clsx(
              "rounded-full px-2.5 py-0.5 text-[11px] font-semibold tabular-nums",
              positive
                ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100"
                : "bg-rose-50 text-rose-800 ring-1 ring-rose-100"
            )}
          >
            {delta}
          </span>
        ) : null}
      </div>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-1.5 font-mono text-3xl font-semibold tracking-tight text-primary">
        {value}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">{caption}</p>
    </div>
  );
}

export function KpiGrid() {
  const { filters } = useDashboardFilters();
  const kpis = useMemo(() => getKpis(filters), [filters]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        icon="◎"
        label="Active user base"
        value={formatInt(kpis.mau)}
        caption="Monthly actives across selected product and filters."
        delta="+11.6%"
        positive
      />
      <KpiCard
        icon="◆"
        label="Weekly engagement"
        value={formatInt(kpis.wau)}
        caption="Rolling seven-day reach; complements DAU for rhythm checks."
        delta="+4.2%"
        positive
      />
      <KpiCard
        icon="▣"
        label="Session depth"
        value={`${(kpis.wau / Math.max(kpis.mau, 1)).toFixed(2)}×`}
        caption="WAU / MAU blend — proxy for return cadence on this mock dataset."
        delta="+0.8%"
        positive
      />
      <KpiCard
        icon="⟲"
        label="Stickiness"
        value={`${kpis.stickiness}%`}
        caption="DAU / MAU ratio; higher values imply habitual daily usage."
        delta="+0.6pp"
        positive
      />
    </div>
  );
}
