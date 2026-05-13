import type { MapPoint, Product } from "./types";

export const PRODUCTS: Product[] = [
  { id: "p-delta", name: "Delta Cloud", slug: "delta-cloud" },
  { id: "p-nexus", name: "Nexus Workspaces", slug: "nexus-workspaces" },
  { id: "p-orbit", name: "Orbit Mobile", slug: "orbit-mobile" },
  { id: "p-stream", name: "Stream Analytics", slug: "stream-analytics" },
];

/** Synthetic scatter points — aggregated buckets (privacy-safe). */
export const MAP_POINTS: MapPoint[] = [
  {
    id: "sf",
    name: "San Francisco Bay",
    lat: 37.77,
    lng: -122.42,
    activeUsers: 842,
    engagement: "high",
    topPlatform: "web",
  },
  {
    id: "nyc",
    name: "New York Metro",
    lat: 40.71,
    lng: -74.01,
    activeUsers: 1204,
    engagement: "high",
    topPlatform: "ios",
  },
  {
    id: "ldn",
    name: "London",
    lat: 51.51,
    lng: -0.13,
    activeUsers: 640,
    engagement: "med",
    topPlatform: "web",
  },
  {
    id: "blr",
    name: "Bengaluru",
    lat: 12.97,
    lng: 77.59,
    activeUsers: 512,
    engagement: "med",
    topPlatform: "android",
  },
  {
    id: "tky",
    name: "Tokyo",
    lat: 35.68,
    lng: 139.76,
    activeUsers: 428,
    engagement: "high",
    topPlatform: "ios",
  },
  {
    id: "syd",
    name: "Sydney",
    lat: -33.87,
    lng: 151.21,
    activeUsers: 310,
    engagement: "low",
    topPlatform: "web",
  },
];
