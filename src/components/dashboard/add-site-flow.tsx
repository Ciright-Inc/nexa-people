"use client";

import { AddSiteWizard } from "./add-site-wizard";
import { DashboardHeader } from "./header";

export function AddSiteFlow() {
  return (
      <div className="flex min-h-dvh flex-col">
        <div className="sticky top-0 z-[1000] bg-[var(--canvas-0)]">
          <DashboardHeader />
        </div>
        <AddSiteWizard />
        <footer className="nexa-footer-slab mt-auto px-4 py-3 text-xs leading-tight text-slate-500 sm:px-5 lg:px-8">
          <p className="text-center">
            ©{new Date().getFullYear()} Ciright. All Rights Reserved.
          </p>
        </footer>
      </div>
  );
}
