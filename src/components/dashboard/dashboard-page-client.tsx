"use client";

import { DashboardFiltersProvider } from "@/context/dashboard-filters";
import { DashboardShell } from "./dashboard-shell";

/** Client root for /dashboard. `Suspense` for `useSearchParams` lives inside `DashboardFiltersProvider`. */
export function DashboardPageClient() {
  return (
    <DashboardFiltersProvider>
      <DashboardShell />
    </DashboardFiltersProvider>
  );
}
