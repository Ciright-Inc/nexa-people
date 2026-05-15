/**
 * Contextual skeleton layouts — premium glass + shimmer (see `globals.css` `.nexa-skeleton`).
 */
import { clsx } from "clsx";

import { MapModuleSkeleton } from "@/components/dashboard/map-module-skeleton";

export type SkeletonShimmer = "default" | "slow" | "fast" | "delay2" | "delay3";

function shimmerClass(shimmer: SkeletonShimmer) {
  if (shimmer === "slow") return "nexa-skel--shimmer-slow";
  if (shimmer === "fast") return "nexa-skel--shimmer-fast";
  if (shimmer === "delay2") return "nexa-skel--shimmer-delay-2";
  if (shimmer === "delay3") return "nexa-skel--shimmer-delay-3";
  return "";
}

export function SkeletonBar({
  className = "",
  shimmer = "default",
  breathe = false,
}: {
  className?: string;
  shimmer?: SkeletonShimmer;
  breathe?: boolean;
}) {
  return (
    <div
      className={clsx("nexa-skeleton", shimmerClass(shimmer), breathe && "nexa-skel--breathe", className)}
      aria-hidden
    />
  );
}

/** Horizontal rows with varied line lengths (list / feed). */
export function SkeletonListRows({ rows = 4 }: { rows?: number }) {
  const widths = ["w-[96%]", "w-[88%]", "w-full", "w-[72%]", "w-[91%]", "w-[84%]"];
  const shimmers: SkeletonShimmer[] = ["slow", "default", "fast", "delay2"];
  return (
    <div className="divide-y divide-slate-100/80 rounded-b-[1.1rem] border border-t-0 border-white/60 bg-white/50 p-2 shadow-[0_8px_32px_rgba(0,0,0,0.03)] backdrop-blur-sm">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="py-2.5">
          <SkeletonBar
            className={clsx("h-9 rounded-[0.65rem]", widths[i % widths.length])}
            shimmer={shimmers[i % shimmers.length]}
          />
        </div>
      ))}
    </div>
  );
}

export function SkeletonKanbanColumn({ titleWidth = "w-[55%]" }: { titleWidth?: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[1.05rem] border border-white/55 bg-white/55 shadow-[0_8px_32px_rgba(0,0,0,0.04)] ring-1 ring-slate-900/[0.03] backdrop-blur-md">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100/90 bg-gradient-to-r from-white/70 to-sky-50/30 px-3 py-2.5">
        <SkeletonBar className={clsx("h-4 rounded-lg", titleWidth)} shimmer="slow" />
        <div className="flex shrink-0 items-center gap-1.5">
          <SkeletonBar className="h-6 w-6 rounded-md" shimmer="fast" />
          <SkeletonBar className="h-6 w-6 rounded-md" shimmer="delay2" />
          <SkeletonBar className="h-6 w-6 rounded-full" shimmer="default" />
        </div>
      </div>
      <SkeletonListRows rows={4} />
    </div>
  );
}

export function SkeletonKanbanRow({ columns = 4 }: { columns?: number }) {
  return (
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: columns }).map((_, i) => (
        <SkeletonKanbanColumn key={i} titleWidth={i % 2 === 0 ? "w-[58%]" : "w-[48%]"} />
      ))}
    </div>
  );
}

function DashboardHeaderSkeleton() {
  return (
    <div className="nexa-app-header">
      <div className="nexa-skel-stagger flex items-center gap-3 px-4 py-2.5 sm:px-5 lg:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <SkeletonBar className="h-9 w-9 shrink-0 rounded-xl" shimmer="slow" breathe />
          <SkeletonBar className="hidden h-4 w-28 rounded-md sm:block" shimmer="delay2" />
        </div>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <SkeletonBar className="h-9 w-[min(100%,11rem)] max-w-[11rem] rounded-full" shimmer="default" />
          <SkeletonBar className="hidden h-9 w-32 rounded-full md:block" shimmer="fast" />
          <SkeletonBar className="h-9 w-9 shrink-0 rounded-full" shimmer="delay3" />
        </div>
      </div>
    </div>
  );
}

function DashboardFiltersSkeleton() {
  return (
    <div className="nexa-active-filters-slab relative z-[20]">
      <div className="nexa-skel-stagger mx-auto flex w-full max-w-[1400px] flex-col gap-2 px-4 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-2.5 lg:px-8">
        <SkeletonBar className="h-9 max-w-xl flex-1 rounded-full" shimmer="slow" />
        <div className="flex flex-wrap gap-2">
          <SkeletonBar className="h-8 w-24 rounded-full" shimmer="fast" />
          <SkeletonBar className="h-8 w-20 rounded-full" shimmer="delay2" />
          <SkeletonBar className="h-8 w-[4.5rem] rounded-full md:hidden" shimmer="default" />
        </div>
      </div>
    </div>
  );
}

/** Map + copy row matching `WorldMapScatter` rhythm. */
function MapSectionSkeleton() {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-6 pb-1 lg:flex-row lg:items-start lg:justify-between lg:gap-10 xl:gap-12">
        <div className="nexa-skel-stagger min-w-0 flex-1 space-y-2.5 lg:max-w-2xl">
          <SkeletonBar className="h-2.5 w-28 rounded-full" shimmer="fast" />
          <SkeletonBar className="h-8 w-[min(100%,22rem)] max-w-full rounded-xl" shimmer="slow" breathe />
          <SkeletonBar className="h-3 w-full max-w-lg rounded-lg" shimmer="default" />
          <SkeletonBar className="h-3 w-[88%] max-w-md rounded-lg" shimmer="delay2" />
          <SkeletonBar className="h-3 w-[72%] max-w-sm rounded-lg" shimmer="delay3" />
        </div>
        <div className="nexa-skel-stagger flex shrink-0 flex-col items-stretch gap-3 text-right sm:flex-row sm:justify-end lg:flex-col lg:items-end lg:gap-4">
          <div className="flex flex-col gap-1.5 rounded-2xl border border-white/50 bg-white/40 px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.03)] backdrop-blur-md sm:min-w-[9.5rem]">
            <SkeletonBar className="ml-auto h-2 w-24 rounded-full" shimmer="slow" />
            <SkeletonBar className="ml-auto mt-1 h-6 w-20 rounded-lg" shimmer="fast" breathe />
          </div>
          <div className="flex flex-col gap-1.5 rounded-2xl border border-white/50 bg-white/40 px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.03)] backdrop-blur-md sm:min-w-[9.5rem]">
            <SkeletonBar className="ml-auto h-2 w-28 rounded-full" shimmer="delay2" />
            <SkeletonBar className="ml-auto mt-1 h-6 w-16 rounded-lg" shimmer="default" breathe />
          </div>
        </div>
      </div>
      <MapModuleSkeleton />
    </section>
  );
}

function KpiCardsSkeleton() {
  const layouts = [
    { spark: "w-[72%]", label: "w-24", sub: "w-16" },
    { spark: "w-[58%]", label: "w-20", sub: "w-12" },
    { spark: "w-[80%]", label: "w-28", sub: "w-14" },
    { spark: "w-[64%]", label: "w-[4.5rem]", sub: "w-10" },
  ] as const;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {layouts.map((L, i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-[1.15rem] border border-white/55 bg-white/55 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.04)] ring-1 ring-slate-900/[0.03] backdrop-blur-md"
        >
          <div className="mb-3 flex items-start justify-between gap-2">
            <SkeletonBar className="h-8 w-8 rounded-xl" shimmer={i % 2 === 0 ? "slow" : "fast"} />
            <SkeletonBar className="h-3 w-14 rounded-full opacity-80" shimmer="delay2" />
          </div>
          <SkeletonBar className={clsx("mb-2 h-2 rounded-full", L.spark)} shimmer="default" />
          <SkeletonBar className={clsx("mb-3 h-8 rounded-xl", L.label)} shimmer="slow" breathe={i === 1} />
          <SkeletonBar className={clsx("h-2.5 rounded-md", L.sub)} shimmer="delay3" />
        </div>
      ))}
    </div>
  );
}

function ChartAndTableSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
      <div className="xl:col-span-3">
        <div className="overflow-hidden rounded-[1.25rem] border border-white/55 bg-white/55 p-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.04)] ring-1 ring-slate-900/[0.03] backdrop-blur-md sm:p-4">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2 border-b border-slate-100/90 pb-3">
            <div className="nexa-skel-stagger min-w-0 space-y-2">
              <SkeletonBar className="h-5 w-48 max-w-[70%] rounded-lg" shimmer="slow" />
              <SkeletonBar className="h-2.5 w-full max-w-md rounded-full" shimmer="default" />
              <SkeletonBar className="h-2.5 w-[78%] max-w-sm rounded-full" shimmer="delay2" />
            </div>
            <div className="flex gap-2">
              <SkeletonBar className="h-8 w-14 rounded-full" shimmer="fast" />
              <SkeletonBar className="h-8 w-14 rounded-full" shimmer="delay3" />
            </div>
          </div>
          <div className="relative h-[260px] w-full sm:h-[300px]">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-sky-50/40 via-white/30 to-slate-50/50" />
            <svg className="absolute inset-2 h-[calc(100%-1rem)] w-[calc(100%-1rem)]" viewBox="0 0 400 200" preserveAspectRatio="none" aria-hidden>
              <path
                className="nexa-skel-chart-path"
                d="M0,160 C60,140 100,40 160,80 S280,20 400,100"
                fill="none"
                stroke="rgba(0,48,135,0.28)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute bottom-2 left-3 right-3 flex justify-between">
              {["w-8", "w-10", "w-7", "w-9", "w-11", "w-8"].map((w, j) => (
                <SkeletonBar key={j} className={clsx("h-2 rounded-full", w)} shimmer={j % 2 === 0 ? "slow" : "fast"} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="xl:col-span-2">
        <div className="flex flex-col overflow-hidden rounded-[1.15rem] border border-white/55 bg-white/55 shadow-[0_8px_32px_rgba(0,0,0,0.04)] ring-1 ring-slate-900/[0.03] backdrop-blur-md">
          <div className="border-b border-slate-100/90 px-4 py-3 sm:px-5 sm:py-4">
            <SkeletonBar className="h-5 w-40 rounded-lg" shimmer="slow" />
            <SkeletonBar className="mt-2 h-2.5 w-full max-w-[14rem] rounded-full" shimmer="default" />
          </div>
          <div className="divide-y divide-slate-100/80 px-2 py-1">
            {[
              ["w-[42%]", "w-16", "w-12"],
              ["w-[55%]", "w-20", "w-10"],
              ["w-[38%]", "w-14", "w-14"],
              ["w-[48%]", "w-[4.5rem]", "w-11"],
              ["w-[62%]", "w-16", "w-9"],
            ].map((cols, r) => (
              <div key={r} className="nexa-skel-stagger flex items-center gap-3 px-2 py-3">
                <SkeletonBar className="h-8 w-8 shrink-0 rounded-full" shimmer="delay2" />
                <SkeletonBar className={clsx("h-3 flex-1 rounded-md", cols[0])} shimmer={r % 2 === 0 ? "slow" : "fast"} />
                <SkeletonBar className={clsx("h-6 shrink-0 rounded-full", cols[1])} shimmer="default" />
                <SkeletonBar className={clsx("h-3 shrink-0 rounded-md", cols[2])} shimmer="delay3" />
              </div>
            ))}
          </div>
          <div className="border-t border-slate-100/90 p-3">
            <SkeletonBar className="h-11 w-full rounded-xl" shimmer="slow" breathe />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Full analytics dashboard shell — layout mirrors `DashboardShell`. */
export function DashboardPageSkeleton() {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="sticky top-0 z-[1000] bg-[var(--canvas-0)]">
        <DashboardHeaderSkeleton />
        <DashboardFiltersSkeleton />
      </div>
      <main className="mx-auto w-full max-w-[1400px] flex-1 space-y-8 px-4 py-6 sm:px-5 lg:space-y-10 lg:px-8 lg:py-8">
        <MapSectionSkeleton />

        <section className="space-y-6">
          <div className="nexa-skel-stagger flex flex-col gap-3 border-b border-slate-100/80 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <SkeletonBar className="h-2.5 w-32 rounded-full" shimmer="fast" />
              <SkeletonBar className="h-8 w-[min(100%,20rem)] rounded-xl" shimmer="slow" breathe />
            </div>
            <SkeletonBar className="h-9 w-full max-w-[10rem] rounded-full sm:w-36" shimmer="delay2" />
          </div>

          <div className="nexa-skel-stagger flex flex-col gap-3 rounded-[1.25rem] border border-white/55 bg-gradient-to-r from-white/60 via-sky-50/20 to-white/50 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.03)] backdrop-blur-md sm:flex-row sm:flex-wrap sm:items-center">
            <SkeletonBar className="h-10 flex-1 rounded-xl sm:max-w-xs" shimmer="slow" />
            <SkeletonBar className="h-10 w-full rounded-xl sm:w-40" shimmer="default" />
            <SkeletonBar className="h-10 w-full rounded-xl sm:w-36" shimmer="fast" />
            <SkeletonBar className="h-10 w-full rounded-full sm:ml-auto sm:w-44" shimmer="delay3" />
          </div>

          <KpiCardsSkeleton />
          <ChartAndTableSkeleton />
        </section>
      </main>
      <footer className="nexa-footer-slab px-4 py-3 sm:px-5 lg:px-8">
        <SkeletonBar className="mx-auto h-2.5 w-40 rounded-full opacity-70" shimmer="slow" />
      </footer>
    </div>
  );
}

export function LoginPageSkeleton() {
  return (
    <div className="nexa-login-canvas flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="glass-panel w-full max-w-md overflow-hidden p-7 sm:p-8">
        <div className="nexa-skel-stagger space-y-4 text-center">
          <SkeletonBar className="mx-auto h-11 w-44 rounded-2xl" shimmer="slow" breathe />
          <SkeletonBar className="mx-auto h-4 w-52 rounded-lg" shimmer="default" />
          <SkeletonBar className="mx-auto h-2.5 w-[85%] max-w-xs rounded-full" shimmer="delay2" />
        </div>
        <div className="nexa-skel-stagger mt-8 space-y-4">
          <div>
            <SkeletonBar className="mb-2 h-2.5 w-24 rounded-full" shimmer="fast" />
            <SkeletonBar className="h-12 w-full rounded-2xl" shimmer="slow" />
          </div>
          <div>
            <SkeletonBar className="mb-2 h-2.5 w-20 rounded-full" shimmer="delay3" />
            <SkeletonBar className="h-12 w-full rounded-xl" shimmer="default" />
          </div>
          <SkeletonBar className="mt-2 h-12 w-full rounded-[1.05rem]" shimmer="fast" breathe />
        </div>
      </div>
    </div>
  );
}

/** My Personal Sites — desktop grid vs mobile stacked cards. */
export function PersonalSitesPageSkeleton() {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="sticky top-0 z-[1000] bg-[var(--canvas-0)]">
        <DashboardHeaderSkeleton />
      </div>
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-5 lg:px-8 lg:py-8">
        <div className="nexa-skel-stagger mb-8 space-y-4 border-b border-slate-100/80 pb-8">
          <SkeletonBar className="h-3 w-40 rounded-full" shimmer="slow" />
          <SkeletonBar className="h-9 w-[min(100%,18rem)] rounded-xl" shimmer="default" breathe />
          <SkeletonBar className="h-3 w-full max-w-lg rounded-lg" shimmer="delay2" />
        </div>

        {/* Mobile: large tap targets, single column story */}
        <div className="nexa-skel-stagger mb-6 space-y-4 md:hidden">
          <SkeletonBar className="h-12 w-full rounded-2xl" shimmer="slow" />
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-[1.25rem] border border-white/55 bg-white/55 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-md"
            >
              <div className="flex items-center gap-4">
                <SkeletonBar className="h-14 w-14 shrink-0 rounded-2xl" shimmer="fast" breathe={i === 0} />
                <div className="min-w-0 flex-1 space-y-2">
                  <SkeletonBar className="h-4 w-[88%] rounded-lg" shimmer="default" />
                  <SkeletonBar className="h-3 w-[55%] rounded-full" shimmer="delay2" />
                </div>
              </div>
              <SkeletonBar className="mt-5 h-12 w-full rounded-xl" shimmer="slow" />
            </div>
          ))}
        </div>

        {/* Tablet + desktop: denser grid, table-like rows */}
        <div className="mb-6 hidden md:block">
          <SkeletonBar className="mb-5 h-11 max-w-xl rounded-2xl" shimmer="slow" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col rounded-[1.05rem] border border-white/55 bg-white/50 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.035)] backdrop-blur-sm lg:rounded-[1.2rem]"
              >
                <div className="flex items-center gap-3">
                  <SkeletonBar className="h-10 w-10 shrink-0 rounded-xl" shimmer={i % 3 === 0 ? "slow" : "fast"} />
                  <SkeletonBar className="h-3 flex-1 rounded-md" shimmer="delay2" />
                </div>
                <SkeletonBar className="mt-3 h-9 w-full rounded-lg" shimmer="default" />
                <div className="mt-3 flex justify-between gap-2">
                  <SkeletonBar className="h-2.5 w-28 rounded-full" shimmer="slow" />
                  <SkeletonBar className="h-5 w-14 rounded-full" shimmer="fast" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export function AddSitePageSkeleton() {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="sticky top-0 z-[1000] bg-[var(--canvas-0)]">
        <DashboardHeaderSkeleton />
      </div>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8 sm:px-5">
        <SkeletonBar className="mb-6 h-3 w-36 rounded-full" shimmer="slow" />
        <div className="nexa-skel-stagger flex gap-2 pb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex flex-1 flex-col items-center gap-2">
              <SkeletonBar className={clsx("h-8 w-8 rounded-full", s === 1 && "ring-2 ring-primary/25")} shimmer={s === 1 ? "slow" : "default"} breathe={s === 1} />
              <SkeletonBar className="h-2 w-full max-w-[4rem] rounded-full" shimmer="fast" />
            </div>
          ))}
        </div>
        <div className="overflow-hidden rounded-[1.35rem] border border-white/55 bg-white/60 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)] ring-1 ring-slate-900/[0.04] backdrop-blur-xl">
          <div className="nexa-skel-stagger space-y-5">
            <SkeletonBar className="h-6 w-44 rounded-xl" shimmer="slow" />
            <SkeletonBar className="h-11 w-full rounded-2xl" shimmer="default" />
            <SkeletonBar className="h-24 w-full rounded-2xl" shimmer="delay2" />
            <SkeletonBar className="h-12 w-full rounded-xl" shimmer="fast" breathe />
          </div>
        </div>
      </main>
    </div>
  );
}

export function RootPageSkeleton() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-16">
      <div className="nexa-skel-stagger flex w-full max-w-sm flex-col items-center">
        <div className="relative mb-6 flex h-16 w-16 items-center justify-center">
          <span className="nexa-skel-node-pulse absolute inset-0 rounded-2xl bg-primary/8" aria-hidden />
          <SkeletonBar className="relative z-[1] h-12 w-12 rounded-2xl" shimmer="slow" breathe />
        </div>
        <SkeletonBar className="mb-3 h-4 w-48 rounded-lg" shimmer="default" />
        <SkeletonBar className="h-2.5 w-full max-w-xs rounded-full" shimmer="delay2" />
      </div>
    </div>
  );
}
