"use client";

import { useMemo } from "react";
import type { DashboardFiltersState } from "@/lib/types";
import { useDashboardFilters } from "@/context/dashboard-filters";
import { getHeroKpiMetrics } from "@/lib/analytics";
import { DATE_RANGE_PRESETS } from "./date-range-control";

function kpiWindowLabel(filters: DashboardFiltersState) {
  if (filters.datePreset === "custom") return "Custom";
  return DATE_RANGE_PRESETS.find((p) => p.id === filters.datePreset)?.label ?? "Selected window";
}

const iconSvgProps = {
  xmlns: "http://www.w3.org/2000/svg" as const,
  width: 16,
  height: 16,
  viewBox: "0 0 24 24" as const,
  fill: "none" as const,
  stroke: "currentColor" as const,
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "shrink-0",
  "aria-hidden": true as const,
};

/** Lucide `users-round` (paths match lucide-react source). */
function IconUsersRound() {
  return (
    <svg {...iconSvgProps}>
      <path d="M18 21a8 8 0 0 0-16 0" />
      <circle cx="10" cy="8" r="5" />
      <path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3" />
    </svg>
  );
}

/** Lucide `radio`. */
function IconRadio() {
  return (
    <svg {...iconSvgProps}>
      <path d="M16.247 7.761a6 6 0 0 1 0 8.478" />
      <path d="M19.075 4.933a10 10 0 0 1 0 14.134" />
      <path d="M4.925 19.067a10 10 0 0 1 0-14.134" />
      <path d="M7.753 16.239a6 6 0 0 1 0-8.478" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

/** Lucide `activity`. */
function IconActivity() {
  return (
    <svg {...iconSvgProps}>
      <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
    </svg>
  );
}

/** Lucide `chart-column`. */
function IconChartColumn() {
  return (
    <svg {...iconSvgProps}>
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  );
}

const icons = [IconUsersRound, IconRadio, IconActivity, IconChartColumn];

export function KpiGrid() {
  const { filters } = useDashboardFilters();
  const rows = useMemo(() => getHeroKpiMetrics(filters), [filters]);
  const windowName = useMemo(() => kpiWindowLabel(filters), [filters]);
  const footer = `Modelled KPI for the filtered window (${windowName}).`;

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5 xl:grid-cols-4">
      {rows.map((row, i) => {
        const Icon = icons[i] ?? icons[0];
        return (
          <article
            key={row.label}
            className="flex flex-col rounded-xl border border-slate-200/80 bg-white/85 px-3 pb-2.5 pt-2.5 shadow-premium ring-1 ring-slate-900/[0.03] backdrop-blur-sm transition-all duration-nexa-slow ease-nexa-out hover:-translate-y-px hover:border-slate-200 hover:shadow-nexaFloat"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-gradient-to-b from-white to-slate-50 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                <Icon />
              </div>
              <span className="shrink-0 rounded-full border border-slate-200/80 bg-slate-50/90 px-2 py-0.5 text-[10px] font-semibold tabular-nums tracking-tight text-slate-700">
                {row.delta}
              </span>
            </div>
            <h3 className="mt-2.5 text-[9px] font-bold uppercase leading-tight tracking-[0.14em] text-slate-500">
              {row.label}
            </h3>
            <p className="mt-1 text-[1.375rem] font-bold leading-none tracking-[-0.02em] text-slate-900">
              {row.value}
            </p>
            <p className="mt-auto pt-2 text-[9px] leading-relaxed text-slate-400">{footer}</p>
          </article>
        );
      })}
    </div>
  );
}
