"use client";

import Link from "next/link";

import { AppLogo } from "@/components/brand/app-logo";
import { ProductSelect } from "./product-select";
import { UserMenu } from "./user-menu";

export function DashboardHeader() {
  return (
    <header className="nexa-app-header relative z-[30]">
      <div className="flex items-center gap-3 px-4 py-2.5 sm:px-5 lg:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <Link
            href="/dashboard"
            aria-label="Go to dashboard"
            className="flex h-10 shrink-0 items-center rounded-md outline-none ring-offset-2 transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <AppLogo
              className="h-7 w-auto shrink-0"
              title="Ciright"
              priority
            />
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-lg font-semibold tracking-[-0.02em] text-slate-950 sm:text-xl">
                Nexa People
              </h1>
              <span className="inline-flex items-center rounded-full border border-slate-200/90 bg-slate-50/90 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
                Analytics
              </span>
            </div>
            <p className="truncate text-xs font-medium text-slate-500">
              Modern workforce insights
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/dashboard/sites/add"
            className="inline-flex max-w-[9.5rem] shrink-0 items-center justify-center truncate rounded-xl bg-primary px-2.5 py-2 text-xs font-semibold text-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_4px_14px_rgba(0,48,135,0.28)] transition-all duration-nexa ease-nexa-out hover:bg-primary-muted active:scale-[0.98] sm:max-w-none sm:px-3 sm:text-sm"
          >
            + Add website
          </Link>
          <ProductSelect />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
