export type UserRole = "viewer" | "analyst" | "admin";

export type DateRangePreset =
  | "7d"
  | "30d"
  | "90d"
  | "qtd"
  | "custom";

export type PlatformFilter = "all" | "web" | "ios" | "android";

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
  platform: PlatformFilter;
  segment: SegmentFilter;
};
