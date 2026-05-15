"use client";

import Link from "next/link";

import { AppLogo } from "@/components/brand/app-logo";
import { LoginSuccessToast } from "@/components/dashboard/login-success-toast";
import { PersonalSiteSelect } from "./personal-site-select";
import { UserMenu } from "./user-menu";

export function DashboardHeader() {
  return (
    <>
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
              <div className="flex flex-wrap items-end gap-2">
                <h1 className="truncate text-lg font-semibold leading-none tracking-[-0.02em] text-slate-950 sm:text-xl">
                  Nexa People
                </h1>
                <span className="inline-flex items-center rounded-md border border-slate-200/90 bg-slate-50/90 px-2 py-1 text-[11px] font-bold uppercase leading-none tracking-[0.08em] text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
                  Analytics
                </span>
              </div>
              <p className="truncate text-xs font-medium text-slate-500">
                Modern workforce insights
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <PersonalSiteSelect />
            <UserMenu />
          </div>
        </div>
      </header>
      <LoginSuccessToast />
    </>
  );
}
