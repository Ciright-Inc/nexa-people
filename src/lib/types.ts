export type UserRole = "viewer" | "analyst" | "admin";

export type DateRangePreset =
  | "7d"
  | "30d"
  | "90d"
  | "qtd"
  | "custom";

/** Matches dashboard filter defaults (URL + chips). */
export const DASHBOARD_DEFAULT_MIN_ACTIVE_USERS = 250;

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
