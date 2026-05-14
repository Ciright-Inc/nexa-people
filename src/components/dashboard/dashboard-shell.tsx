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
      <div className="sticky top-0 z-[1000] shadow-nexaHeader">
        <DashboardHeader />
        <DashboardActiveFiltersBar />
      </div>
      <main className="mx-auto w-full max-w-[1400px] flex-1 space-y-8 px-4 py-6 sm:px-5 lg:space-y-10 lg:px-8 lg:py-8">
        <WorldMapScatter />

        <section className="space-y-6">
          <PerformanceAnalyticsHeading />

          <GlobalControls />
          <KpiGrid />
          <ChartsSection />
        </section>
      </main>
      <footer className="nexa-footer-slab px-4 py-3 text-xs leading-tight text-slate-500 sm:px-5 lg:px-8">
        <p className="text-center">
          ©{new Date().getFullYear()} Ciright. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
