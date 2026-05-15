"use client";

import { useEffect, useState } from "react";

import { DashboardFiltersProvider } from "@/context/dashboard-filters";
import { SELECTED_SITE_CHANGED_EVENT, readSelectedSiteFromSession } from "@/lib/selected-site";
import { DashboardShell } from "./dashboard-shell";

/** Client root for /dashboard. Remounts map when selected site changes (no full page reload). */
export function DashboardPageClient() {
  const [mapScopeKey, setMapScopeKey] = useState(() => readSelectedSiteFromSession()?.id ?? "default");

  useEffect(() => {
    const sync = () => setMapScopeKey(readSelectedSiteFromSession()?.id ?? "default");
    sync();
    window.addEventListener(SELECTED_SITE_CHANGED_EVENT, sync);
    return () => window.removeEventListener(SELECTED_SITE_CHANGED_EVENT, sync);
  }, []);

  return (
    <DashboardFiltersProvider>
      <DashboardShell mapScopeKey={mapScopeKey} />
    </DashboardFiltersProvider>
  );
}
