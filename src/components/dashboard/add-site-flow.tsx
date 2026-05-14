"use client";

import { DashboardFiltersProvider } from "@/context/dashboard-filters";
import { AddSiteWizard } from "./add-site-wizard";
import { DashboardHeader } from "./header";

export function AddSiteFlow() {
  return (
    <DashboardFiltersProvider>
      <div className="flex min-h-dvh flex-col">
        <div className="sticky top-0 z-[1000] shadow-nexaHeader">
          <DashboardHeader />
        </div>
        <AddSiteWizard />
        <footer className="nexa-footer-slab mt-auto px-4 py-3 text-xs leading-tight text-slate-500 sm:px-5 lg:px-8">
          <p className="text-center">
            ©{new Date().getFullYear()} Ciright. All Rights Reserved.
          </p>
        </footer>
      </div>
    </DashboardFiltersProvider>
  );
}
