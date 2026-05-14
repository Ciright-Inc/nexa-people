import { DashboardFiltersProvider } from "@/context/dashboard-filters";
import { PersonalSitesClient } from "@/components/dashboard/personal-sites-client";

export const dynamic = "force-dynamic";

export default function PersonalSitesPage() {
  return (
    <DashboardFiltersProvider>
      <PersonalSitesClient />
    </DashboardFiltersProvider>
  );
}
