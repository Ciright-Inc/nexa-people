export type UserRole = "viewer" | "analyst" | "admin";

export type DateRangePreset =
  | "7d"
  | "30d"
  | "90d"
  | "qtd"
  | "custom";

/** Matches dashboard filter defaults (URL + chips). */
export const DASHBOARD_DEFAULT_MIN_ACTIVE_USERS = 250;

/** Upper bound for the “minimum active users” slider and URL param. */
export const DASHBOARD_MAX_MIN_ACTIVE_USERS = 120_000;

/** Slider / URL stepping for min active users. */
export const DASHBOARD_MIN_ACTIVE_USERS_STEP = 50;

export type PlatformKey = "web" | "ios" | "android";

/** One or more platforms; all three selected means “all platforms” for analytics. */
export type PlatformFilter = PlatformKey[];

export type SegmentFilter = "all" | "enterprise" | "pro" | "free";

export type EngagementBand = "low" | "med" | "high";

export type MapPoint = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  activeUsers: number;
  engagement: EngagementBand;
  topPlatform: "web" | "ios" | "android";
};

export type Product = {
  id: string;
  name: string;
  slug: string;
};

/** Tracked site for “My Personal Sites”. */
export type PersonalSite = {
  id: string;
  host: string;
  /** Visitors in last 24h (0 until real analytics are wired). */
  visitors24h: number;
  /** Percent change vs prior window (0 until real analytics are wired). */
  deltaPct: number;
};

export type DashboardFiltersState = {
  productId: string;
  datePreset: DateRangePreset;
  customFrom: string | null;
  customTo: string | null;
  geographyId: string | null;
  geographyLabel: string | null;
  platforms: PlatformFilter;
  segment: SegmentFilter;
  /** Default 250; shown as a chip when changed from default. */
  minActiveUsers: number;
};
