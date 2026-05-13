"use client";

import { clsx } from "clsx";
import type { PlatformKey } from "@/lib/types";
import { DASHBOARD_DEFAULT_MIN_ACTIVE_USERS } from "@/lib/types";
import { useDashboardFilters } from "@/context/dashboard-filters";
import { DateRangeControl } from "./date-range-control";

const ALL: PlatformKey[] = ["web", "ios", "android"];

function isAllPlatforms(p: PlatformKey[]) {
  return new Set(p).size === ALL.length;
}

export function GlobalControls() {
  const { filters, setPlatforms, setMinActiveUsers, resetAnalyticsFilters } =
    useDashboardFilters();

  const analyticsDirty =
    (filters.datePreset === "custom" &&
      Boolean(filters.customFrom || filters.customTo)) ||
    filters.datePreset !== "30d" ||
    !isAllPlatforms(filters.platforms) ||
    filters.segment !== "all" ||
    Boolean(filters.geographyLabel && filters.geographyId);

  const hasActiveFilters =
    analyticsDirty ||
    filters.minActiveUsers !== DASHBOARD_DEFAULT_MIN_ACTIVE_USERS;

  function handlePlatformChange(id: PlatformKey, checked: boolean) {
    const cur = new Set(filters.platforms);
    if (checked) cur.add(id);
    else cur.delete(id);
    let next = [...cur] as PlatformKey[];
    if (next.length === 0) next = [...ALL];
    setPlatforms(next);
  }

  function clearAnalyticsFilters() {
    resetAnalyticsFilters();
  }

  return (
    <div className="dash-card-lg p-6 sm:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
          Filters & controls
        </p>
        <button
          type="button"
          onClick={clearAnalyticsFilters}
          disabled={!hasActiveFilters}
          className={clsx(
            "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition",
            hasActiveFilters
              ? "border-slate-300 bg-white text-slate-900 shadow-sm hover:border-slate-400 hover:bg-slate-50"
              : "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
          )}
        >
          Clear analytics filters
        </button>
      </div>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-12 lg:items-start">
        <section className="min-w-0 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Date range</h3>
          <DateRangeControl layout="stacked" />
        </section>

        <section className="min-w-0 space-y-8">
          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <h3 className="text-sm font-bold leading-snug text-slate-900">
                Minimum active users{" "}
                <span className="font-semibold text-slate-600">
                  (map + KPI gating)
                </span>
              </h3>
              <span className="shrink-0 font-mono text-sm font-bold tabular-nums text-slate-900 sm:pt-0.5">
                ≥ {filters.minActiveUsers.toLocaleString()}
              </span>
            </div>
            <input
              id="min-users"
              type="range"
              min={0}
              max={5000}
              step={50}
              value={filters.minActiveUsers}
              onChange={(e) => setMinActiveUsers(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-slate-900 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-900 [&::-webkit-slider-thumb]:shadow-md"
            />
            <div className="flex justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              <span>0</span>
              <span>5k</span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Platforms</h3>
            <div className="flex flex-wrap gap-3">
              {(
                [
                  { id: "web" as const, label: "Web" },
                  { id: "ios" as const, label: "iOS" },
                  { id: "android" as const, label: "Android" },
                ] as const
              ).map(({ id, label }) => (
                <div
                  key={id}
                  className="rounded-lg border border-slate-200 bg-slate-50/90 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
                >
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/30"
                      checked={filters.platforms.includes(id)}
                      onChange={(e) => handlePlatformChange(id, e.target.checked)}
                    />
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
