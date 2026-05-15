/** Canonical host key for dedupe (lowercase, no protocol / leading www / path). */
export function normalizeSiteHostInput(raw: string): string {
  let d = raw.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  d = d.split(/[/:?#]/)[0]?.trim().toLowerCase() ?? "";
  return d;
}

/** Loose validation for domains we persist (allows localhost / .local for dev). */
export function isValidAnalyticsHost(normalized: string): boolean {
  if (normalized.length < 1) return false;
  if (normalized === "localhost" || normalized.endsWith(".local")) return true;
  return normalized.includes(".");
}
