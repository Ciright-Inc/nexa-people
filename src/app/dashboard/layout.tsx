import { DashboardRouteWarmup } from "@/components/dashboard/dashboard-route-warmup";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardRouteWarmup>{children}</DashboardRouteWarmup>;
}
