import type { DashboardFiltersState } from "@/lib/types";

/** Pretty-print `YYYY-MM-DD` pair for chips and headings; `null` if either side missing. */
export function formatCustomDateRangeLabel(
  customFrom: string | null,
  customTo: string | null
): string | null {
  if (!customFrom?.trim() || !customTo?.trim()) return null;
  try {
    const a = new Date(`${customFrom}T12:00:00`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const b = new Date(`${customTo}T12:00:00`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${a} – ${b}`;
  } catch {
    return `${customFrom} – ${customTo}`;
  }
}

/**
 * Single line describing the active date filter (preset label or formatted custom range).
 */
export function dashboardDateFilterLabel(f: DashboardFiltersState): string {
  if (f.datePreset === "custom") {
    const span = formatCustomDateRangeLabel(f.customFrom, f.customTo);
    if (span) return span;
    return "Custom (select dates)";
  }
  switch (f.datePreset) {
    case "7d":
      return "Last 7 days";
    case "30d":
      return "Last 30 days";
    case "90d":
      return "Last 90 days";
    case "qtd":
      return "Quarter to date";
    default:
      return "Last 30 days";
  }
}
