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
  getDemandNormalizedSeries,
  getFunnel,
  getRegionalNetworkRows,
  getSegments,
  type RegionalNetworkRow,
} from "@/lib/analytics";
import { downloadCsv, downloadElementPng } from "@/lib/export";

function StatusPill({ status }: { status: RegionalNetworkRow["status"] }) {
  const base =
    "inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]";
  if (status === "optimal") {
    return <span className={clsx(base, "bg-primary text-white")}>Optimal</span>;
  }
  if (status === "high load") {
    return (
      <span
        className={clsx(
          base,
          "border border-slate-300 bg-white text-slate-800 shadow-sm"
        )}
      >
        High load
      </span>
    );
  }
  return (
    <span
      className={clsx(
        base,
        "border border-slate-200 bg-slate-50 text-slate-600"
      )}
    >
      Maintenance
    </span>
  );
}

export function ChartsSection() {
  const { filters } = useDashboardFilters();
  const demand = useMemo(() => getDemandNormalizedSeries(filters), [filters]);
  const series = useMemo(() => getActiveSeries(filters), [filters]);
  const regional = useMemo(() => getRegionalNetworkRows(filters), [filters]);
  const funnel = useMemo(() => getFunnel(filters), [filters]);
  const cohort = useMemo(() => getCohortHeatmap(filters), [filters]);
  const segments = useMemo(() => getSegments(filters), [filters]);
  const chartCardRef = useRef<HTMLDivElement>(null);

  function exportDemandCsv() {
    downloadCsv(
      "nexapeople-demand-cycle.csv",
      demand.map((r) => ({ hour: r.t, normalized: r.v }))
    );
  }

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
    <section className="space-y-5">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-slate-900">
                Demand cycle (normalized)
              </h3>
              <p className="mt-1 max-w-md text-xs text-slate-500">
                Intraday curve scaled to peak — mirrors capacity planning views before
                warehouse wiring.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={exportDemandCsv}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-800 shadow-sm transition hover:border-slate-300"
              >
                CSV
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadElementPng(
                    chartCardRef.current,
                    "nexapeople-demand-cycle.png"
                  )
                }
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-800 shadow-sm transition hover:border-slate-300"
              >
                PNG
              </button>
            </div>
          </div>
          <div ref={chartCardRef} className="dash-card-lg p-4 sm:p-5">
            <div className="h-[300px] w-full sm:h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={demand}>
                  <defs>
                    <linearGradient id="demandFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#94a3b8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(15,23,42,0.06)" vertical={false} />
                  <XAxis
                    dataKey="t"
                    tick={{ fill: "rgba(15,23,42,0.45)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: "rgba(15,23,42,0.1)" }}
                  />
                  <YAxis
                    domain={[0, 1]}
                    tickFormatter={(v) => `${Math.round(v * 100)}%`}
                    tick={{ fill: "rgba(15,23,42,0.45)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={44}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(255,255,255,0.98)",
                      border: "1px solid rgba(15,23,42,0.1)",
                      borderRadius: 12,
                      fontSize: 12,
                      boxShadow: "0 12px 40px rgba(15,23,42,0.08)",
                    }}
                    labelStyle={{ color: "rgba(15,23,42,0.55)" }}
                    formatter={(value: number) => [
                      `${(value * 100).toFixed(1)}%`,
                      "Load",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="#64748b"
                    strokeWidth={2}
                    fill="url(#demandFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="mb-4">
            <h3 className="text-sm font-semibold tracking-tight text-slate-900">
              Regional status
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Synthetic health checks per market bucket.
            </p>
          </div>
          <div className="dash-card-lg flex flex-col overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[280px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    <th className="px-5 py-3 font-semibold">Market</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 text-right font-semibold">Ping</th>
                  </tr>
                </thead>
                <tbody>
                  {regional.map((row) => (
                    <tr
                      key={row.market}
                      className="border-t border-slate-100 transition hover:bg-slate-50/80"
                    >
                      <td className="px-5 py-3.5 font-medium text-slate-900">
                        {row.market}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusPill status={row.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-xs text-slate-700">
                        {row.ping} ms
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-slate-100 p-4 sm:px-5 sm:py-4">
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-muted"
              >
                View full network report
                <span aria-hidden className="text-base leading-none">
                  →
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <details className="dash-card-lg group overflow-hidden open:shadow-premiumLg">
        <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold text-slate-900 transition marker:content-none hover:bg-slate-50/80 [&::-webkit-details-marker]:hidden">
          <span className="flex items-center justify-between gap-2">
            Additional analytics
            <span className="text-xs font-normal text-slate-500 group-open:hidden">
              Funnel, cohorts, segments
            </span>
            <span className="hidden text-xs font-normal text-slate-500 group-open:inline">
              Hide
            </span>
          </span>
        </summary>
        <div className="space-y-8 border-t border-slate-100 px-5 py-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <div className="mb-3 flex items-end justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    Active users & sessions (24h)
                  </h4>
                  <p className="text-xs text-slate-500">Raw counts for the same window.</p>
                </div>
                <button
                  type="button"
                  onClick={exportSeriesCsv}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-800 shadow-sm hover:border-slate-300"
                >
                  CSV
                </button>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-inner">
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={series}>
                      <defs>
                        <linearGradient id="fillUsers2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#003087" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="#003087" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(15,23,42,0.06)" vertical={false} />
                      <XAxis
                        dataKey="t"
                        tick={{ fill: "rgba(15,23,42,0.45)", fontSize: 10 }}
                        tickLine={false}
                        axisLine={{ stroke: "rgba(15,23,42,0.1)" }}
                      />
                      <YAxis
                        tick={{ fill: "rgba(15,23,42,0.45)", fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(255,255,255,0.98)",
                          border: "1px solid rgba(15,23,42,0.1)",
                          borderRadius: 12,
                          fontSize: 12,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="users"
                        stroke="#003087"
                        strokeWidth={2}
                        fill="url(#fillUsers2)"
                      />
                      <Area
                        type="monotone"
                        dataKey="sessions"
                        stroke="#64748b"
                        strokeWidth={1.5}
                        fill="transparent"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-end justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    Activation funnel
                  </h4>
                  <p className="text-xs text-slate-500">Signup → activation → key action.</p>
                </div>
                <button
                  type="button"
                  onClick={exportFunnelCsv}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-800 shadow-sm hover:border-slate-300"
                >
                  CSV
                </button>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-inner">
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={funnel}>
                      <CartesianGrid stroke="rgba(15,23,42,0.06)" vertical={false} />
                      <XAxis
                        dataKey="step"
                        tick={{ fill: "rgba(15,23,42,0.45)", fontSize: 10 }}
                        tickLine={false}
                        axisLine={{ stroke: "rgba(15,23,42,0.1)" }}
                      />
                      <YAxis
                        tick={{ fill: "rgba(15,23,42,0.45)", fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(255,255,255,0.98)",
                          border: "1px solid rgba(15,23,42,0.1)",
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

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <div className="mb-3 flex items-end justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Cohort retention</h4>
                  <p className="text-xs text-slate-500">Weekly heatmap preview (%).</p>
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
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-800 shadow-sm hover:border-slate-300"
                >
                  CSV
                </button>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white p-3 shadow-inner">
                <table className="w-full min-w-[400px] border-collapse text-xs">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-wide text-slate-500">
                      <th className="pb-2 pr-2 font-semibold">Cohort</th>
                      {cohort[0]?.values.map((_, i) => (
                        <th key={i} className="pb-2 px-1 font-semibold">
                          +{i + 1}w
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cohort.map((row) => (
                      <tr key={row.week} className="border-t border-slate-100">
                        <td className="py-2 pr-2 font-mono text-slate-700">{row.week}</td>
                        {row.values.map((v, i) => (
                          <td key={i} className="px-1 py-2">
                            <div
                              className={clsx(
                                "rounded-lg px-2 py-1 text-center font-mono text-[11px] text-slate-900",
                                v > 70 && "bg-emerald-500/12",
                                v > 45 && v <= 70 && "bg-primary/10",
                                v <= 45 && "bg-slate-100"
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
                <h4 className="text-sm font-semibold text-slate-900">Segment breakdown</h4>
                <p className="text-xs text-slate-500">Share of sessions by tier (mock).</p>
              </div>
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-inner">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50/80 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Segment</th>
                      <th className="px-4 py-3">Share</th>
                      <th className="px-4 py-3">Sessions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {segments.map((s) => (
                      <tr key={s.label} className="border-t border-slate-100 hover:bg-slate-50/60">
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
              </div>
            </div>
          </div>
        </div>
      </details>
    </section>
  );
}
