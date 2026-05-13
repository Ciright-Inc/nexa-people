"use client";

import { useMemo, useRef } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { clsx } from "clsx";
import { useDashboardFilters } from "@/context/dashboard-filters";
import {
  getActiveSeries,
  getCohortHeatmap,
  getFunnel,
  getSegments,
} from "@/lib/analytics";
import { downloadCsv, downloadElementPng } from "@/lib/export";

export function ChartsSection() {
  const { filters } = useDashboardFilters();
  const series = useMemo(() => getActiveSeries(filters), [filters]);
  const funnel = useMemo(() => getFunnel(filters), [filters]);
  const cohort = useMemo(() => getCohortHeatmap(filters), [filters]);
  const segments = useMemo(() => getSegments(filters), [filters]);
  const chartCardRef = useRef<HTMLDivElement>(null);

  function exportSeriesCsv() {
    downloadCsv(
      "nexapeople-active-series.csv",
      series.map((r) => ({ hour: r.t, users: r.users, sessions: r.sessions }))
    );
  }

  function exportFunnelCsv() {
    downloadCsv(
      "nexapeople-funnel.csv",
      funnel.map((r) => ({ step: r.step, users: r.value }))
    );
  }

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Active users & sessions (24h)
              </h3>
              <p className="text-xs text-slate-600">
                Synthetic intraday curve — wires to Spring Boot aggregates later.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={exportSeriesCsv}
                className="rounded-lg border border-slate-900/10 bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-slate-800 shadow-sm hover:border-primary/25"
              >
                CSV
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadElementPng(
                    chartCardRef.current,
                    "nexapeople-active-users.png"
                  )
                }
                className="rounded-lg border border-slate-900/10 bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-slate-800 shadow-sm hover:border-primary/25"
              >
                PNG
              </button>
            </div>
          </div>
          <div ref={chartCardRef} className="glass-panel p-3">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series}>
                  <defs>
                    <linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(15,23,42,0.08)" vertical={false} />
                  <XAxis
                    dataKey="t"
                    tick={{ fill: "rgba(15,23,42,0.55)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: "rgba(15,23,42,0.12)" }}
                  />
                  <YAxis
                    tick={{ fill: "rgba(15,23,42,0.55)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(255,255,255,0.96)",
                      border: "1px solid rgba(15,23,42,0.12)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "rgba(15,23,42,0.65)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#34d399"
                    strokeWidth={2}
                    fill="url(#fillUsers)"
                  />
                  <Area
                    type="monotone"
                    dataKey="sessions"
                    stroke="#60a5fa"
                    strokeWidth={1.5}
                    fill="transparent"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-slate-900">Activation funnel</h3>
            <p className="text-xs text-slate-600">Signup → activation → key action.</p>
          </div>
          <div className="glass-panel p-3">
            <div className="mb-2 flex justify-end">
              <button
                type="button"
                onClick={exportFunnelCsv}
                className="rounded-lg border border-slate-900/10 bg-white/80 px-2 py-1 text-[11px] font-semibold text-slate-800 shadow-sm hover:border-primary/25"
              >
                CSV
              </button>
            </div>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnel}>
                  <CartesianGrid stroke="rgba(15,23,42,0.08)" vertical={false} />
                  <XAxis
                    dataKey="step"
                    tick={{ fill: "rgba(15,23,42,0.55)", fontSize: 10 }}
                    tickLine={false}
                    axisLine={{ stroke: "rgba(15,23,42,0.12)" }}
                  />
                  <YAxis
                    tick={{ fill: "rgba(15,23,42,0.55)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(255,255,255,0.96)",
                      border: "1px solid rgba(15,23,42,0.12)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="value" fill="#003087" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-end justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Cohort retention</h3>
              <p className="text-xs text-slate-600">
                Heatmap preview (% retained); powered by warehouse cohorts in prod.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                downloadCsv(
                  "nexapeople-cohort.csv",
                  cohort.flatMap((row) =>
                    row.values.map((v, i) => ({
                      cohort: row.week,
                      week_index: i + 1,
                      retained_pct: v,
                    }))
                  )
                )
              }
              className="rounded-lg border border-slate-900/10 bg-white/80 px-2 py-1 text-[11px] font-semibold text-slate-800 shadow-sm hover:border-primary/25"
            >
              CSV
            </button>
          </div>
          <div className="glass-panel overflow-x-auto p-3">
            <table className="w-full min-w-[420px] border-collapse text-xs">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wide text-slate-500">
                  <th className="pb-2 pr-2 font-medium">Cohort</th>
                  {cohort[0]?.values.map((_, i) => (
                    <th key={i} className="pb-2 px-1 font-medium">
                      +{i + 1}w
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cohort.map((row) => (
                  <tr key={row.week} className="border-t border-slate-900/10">
                    <td className="py-2 pr-2 font-mono text-slate-700">{row.week}</td>
                    {row.values.map((v, i) => (
                      <td key={i} className="px-1 py-2">
                        <div
                          className={clsx(
                            "rounded-md px-2 py-1 text-center font-mono text-[11px] text-slate-900",
                            v > 70 && "bg-emerald-500/15",
                            v > 45 && v <= 70 && "bg-primary/10",
                            v <= 45 && "bg-slate-900/[0.04]"
                          )}
                        >
                          {v}%
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-slate-900">Segment breakdown</h3>
            <p className="text-xs text-slate-600">
              Share of sessions by commercial tier (mock split).
            </p>
          </div>
          <div className="glass-panel overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-900/10 bg-slate-900/[0.02] text-left text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Segment</th>
                  <th className="px-4 py-3 font-medium">Share</th>
                  <th className="px-4 py-3 font-medium">Sessions</th>
                </tr>
              </thead>
              <tbody>
                {segments.map((s) => (
                  <tr
                    key={s.label}
                    className="border-t border-slate-900/10 hover:bg-slate-900/[0.02]"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">{s.label}</td>
                    <td className="px-4 py-3 font-mono text-slate-700">
                      {(s.share * 100).toFixed(0)}%
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700">
                      {s.sessions.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end border-t border-slate-900/10 px-4 py-3">
              <button
                type="button"
                className="text-xs font-semibold text-primary hover:underline"
              >
                View full network report →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
