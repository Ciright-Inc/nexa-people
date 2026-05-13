"use client";

import Image from "next/image";
import { ProductSelect } from "./product-select";
import { UserMenu } from "./user-menu";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-900/10 bg-white/75 shadow-card backdrop-blur-xl">
      <div className="flex items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-10 shrink-0 items-center">
            <Image
              src="/logo.png"
              alt="Ciright logo"
              width={160}
              height={48}
              priority
              className="h-7 w-auto"
            />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-lg font-semibold tracking-[-0.02em] text-slate-900 sm:text-xl">
                Nexa People
              </h1>
              <span className="inline-flex items-center rounded-full border border-slate-900/10 bg-white/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary shadow-sm">
                Analytics
              </span>
            </div>
            <p className="truncate text-xs font-medium text-slate-500">
              Modern internal people insights
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
