"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { prefetchPersonalSites } from "@/lib/personal-sites-fetch";

/** Prefetch common dashboard routes + sites API once per session. */
export function DashboardRouteWarmup({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    void prefetchPersonalSites();
    router.prefetch("/dashboard");
    router.prefetch("/dashboard/sites");
    router.prefetch("/dashboard/sites/add");
  }, [router]);

  return children;
}
