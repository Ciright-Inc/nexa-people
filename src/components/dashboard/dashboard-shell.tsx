"use client";

import { DashboardHeader } from "./header";
import { FilterChips } from "./filter-chips";
import { GlobalControls } from "./global-controls";
import { WorldMapScatter } from "./world-map";
import { KpiGrid } from "./kpi-grid";
import { ChartsSection } from "./charts-section";

export function DashboardShell() {
  return (
    <div className="flex min-h-dvh flex-col">
      <DashboardHeader />
      <FilterChips />
      <main className="flex-1 space-y-8 px-4 py-8 sm:px-6 lg:space-y-10 lg:px-8">
        <GlobalControls />
        <WorldMapScatter />
        <KpiGrid />
        <ChartsSection />
      </main>
      <footer className="border-t border-slate-900/10 px-4 py-4 text-xs leading-tight text-slate-500 sm:px-6 lg:px-8">
        <p className="text-center">©{new Date().getFullYear()} Ciright. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
