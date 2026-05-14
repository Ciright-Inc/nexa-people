"use client";

import { DashboardHeader } from "./header";
import { DashboardActiveFiltersBar } from "./active-filters-bar";
import { GlobalControls } from "./global-controls";
import { WorldMapScatter } from "./world-map";
import { KpiGrid } from "./kpi-grid";
import { ChartsSection } from "./charts-section";
import { PerformanceAnalyticsHeading } from "./performance-analytics-heading";

export function DashboardShell() {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="sticky top-0 z-[1000] shadow-[0_6px_20px_-8px_rgba(15,23,42,0.12)]">
        <DashboardHeader />
        <DashboardActiveFiltersBar />
      </div>
      <main className="mx-auto w-full max-w-[1400px] flex-1 space-y-10 px-4 py-8 sm:px-6 lg:space-y-12 lg:px-10 lg:py-10">
        <WorldMapScatter />

        <section className="space-y-8">
          <PerformanceAnalyticsHeading />

          <GlobalControls />
          <KpiGrid />
          <ChartsSection />
        </section>
      </main>
      <footer className="border-t border-slate-200/90 bg-white/80 px-4 py-4 text-xs leading-tight text-slate-500 sm:px-6 lg:px-10">
        <p className="text-center">
          ©{new Date().getFullYear()} Ciright. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
