import { Suspense } from "react";
import { DashboardFiltersProvider } from "@/context/dashboard-filters";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

function DashboardFallback() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-primary" />
      <p className="text-sm text-white/55">Loading analytics workspace…</p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardFiltersProvider>
        <DashboardShell />
      </DashboardFiltersProvider>
    </Suspense>
  );
}
