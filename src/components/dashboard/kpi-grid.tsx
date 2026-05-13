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

const icons = [
  function IconUsers() {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  },
  function IconSignal() {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M5 12.55a11 11 0 0 1 14.08 0" />
        <path d="M1.42 9a16 16 0 0 1 21.16 0" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <path d="M12 20h.01" />
      </svg>
    );
  },
  function IconPulse() {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    );
  },
  function IconBars() {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    );
  },
];

export function KpiGrid() {
  const { filters } = useDashboardFilters();
  const rows = useMemo(() => getHeroKpiMetrics(filters), [filters]);
  const windowName = useMemo(() => kpiWindowLabel(filters), [filters]);
  const footer = `Modelled KPI for the filtered window (${windowName}).`;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
      {rows.map((row, i) => {
        const Icon = icons[i] ?? icons[0];
        return (
          <article
            key={row.label}
            className="flex flex-col rounded-[10px] border border-[#E0E0E0] bg-white px-4 pb-4 pt-3.5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F0F0F0] text-[#666666]">
                <Icon />
              </div>
              <span className="shrink-0 rounded-full bg-[#EEEEEE] px-2.5 py-1 text-[11px] font-semibold tabular-nums text-[#444444]">
                {row.delta}
              </span>
            </div>
            <h3 className="mt-4 text-[10px] font-bold uppercase leading-tight tracking-[0.12em] text-[#888888]">
              {row.label}
            </h3>
            <p className="mt-1.5 text-[26px] font-bold leading-none tracking-tight text-black">
              {row.value}
            </p>
            <p className="mt-auto pt-3 text-[10px] leading-snug text-[#888888]">{footer}</p>
          </article>
        );
      })}
    </div>
  );
}
