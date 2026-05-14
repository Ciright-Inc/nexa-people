/** Points along the mini chart (treated as evenly spaced buckets in the window). */
export const PERSONAL_SITE_SPARK_POINTS = 12;

/**
 * Linear series from a normalized baseline through the percent change in `deltaPct`,
 * so the chart slope matches the ↗ / ↘ label (mock / display-only).
 */
export function buildSparkFromDelta(deltaPct: number, visitors24h: number): number[] {
  const n = PERSONAL_SITE_SPARK_POINTS;
  if (visitors24h === 0) {
    return Array(n).fill(0);
  }
  if (deltaPct === 0) {
    return Array(n).fill(1);
  }
  const start = 100;
  const end = start * (1 + deltaPct / 100);
  return Array.from({ length: n }, (_, i) => {
    const t = n <= 1 ? 1 : i / (n - 1);
    return start + (end - start) * t;
  });
}
