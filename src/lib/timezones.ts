export type TimezoneOption = {
  /** IANA zone id, e.g. `Asia/Kolkata` */
  id: string;
  /** Display label, e.g. `(GMT+05:30) Asia/Kolkata` */
  label: string;
  /** Offset in minutes from UTC at `at`, for sorting */
  offsetMinutes: number;
};

const intlWithSupported = Intl as typeof Intl & {
  supportedValuesOf?: (key: "timeZone") => string[];
};

function parseGmtOffsetToMinutes(gmt: string): number {
  const normalized = gmt.replace(/\u2212/g, "-").trim();
  const m = normalized.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/i);
  if (!m) return 0;
  const sign = m[1] === "-" ? -1 : 1;
  const hours = Number(m[2]);
  const mins = m[3] ? Number(m[3]) : 0;
  return sign * (hours * 60 + mins);
}

function formatGmtFromMinutes(offsetMinutes: number): string {
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const h = Math.floor(abs / 60);
  const min = abs % 60;
  return `GMT${sign}${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function offsetMinutesForZone(timeZone: string, at: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "longOffset",
  });
  const part = dtf.formatToParts(at).find((p) => p.type === "timeZoneName")?.value ?? "GMT+0";
  return parseGmtOffsetToMinutes(part);
}

const FALLBACK_IDS = [
  "UTC",
  "Etc/UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
  "Pacific/Auckland",
] as const;

/**
 * All IANA time zones the engine supports, labeled with GMT offset (current rules).
 * Sorted by offset, then id. Safe to call from client or server (Node 20+).
 */
export function getTimezoneOptions(at: Date = new Date()): TimezoneOption[] {
  const ids =
    typeof intlWithSupported.supportedValuesOf === "function"
      ? intlWithSupported.supportedValuesOf("timeZone")
      : [...FALLBACK_IDS];

  const options: TimezoneOption[] = ids.map((id) => {
    const offsetMinutes = offsetMinutesForZone(id, at);
    const label = `(${formatGmtFromMinutes(offsetMinutes)}) ${id}`;
    return { id, label, offsetMinutes };
  });

  options.sort((a, b) => {
    if (a.offsetMinutes !== b.offsetMinutes) return a.offsetMinutes - b.offsetMinutes;
    return a.id.localeCompare(b.id);
  });

  return options;
}

/** Default reporting zone for new site setup. */
export const DEFAULT_TIMEZONE_ID = "America/Toronto";
