"use client";

import { AppLogo } from "@/components/brand/app-logo";
import { ProductSelect } from "./product-select";
import { UserMenu } from "./user-menu";

export function DashboardHeader() {
  return (
    <header className="border-b border-slate-900/10 bg-white/75 shadow-card backdrop-blur-xl">
      <div className="flex items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-10 shrink-0 items-center">
            <AppLogo
              className="h-7 w-auto shrink-0"
              title="Ciright"
              priority
            />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-lg font-semibold tracking-[-0.02em] text-primary sm:text-xl">
                Nexa People
              </h1>
              <span className="inline-flex items-center rounded-full border border-slate-200/90 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-primary shadow-[inset_0_2px_4px_rgba(15,23,42,0.1),inset_0_-1px_2px_rgba(0,48,135,0.06)]">
                Analytics
              </span>
            </div>
            <p className="truncate text-xs font-medium text-slate-500">
              Modern workforce insights
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <ProductSelect />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
