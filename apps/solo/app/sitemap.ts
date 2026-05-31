import type { MetadataRoute } from "next";

const BASE_URL = "https://autosolo.ch";
const LOCALES = ["de", "en", "fr", "it"];
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const STATIC_PATHS = [
  { path: "", priority: 1.0, changeFrequency: "daily" as const },
  { path: "/cars", priority: 0.9, changeFrequency: "hourly" as const },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/contact", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/faq", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/pricing", priority: 0.7, changeFrequency: "monthly" as const },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const res = await fetch(`${API_BASE}/api/sitemap?sellerOnly=true`, {
    cache: "no-store",
  });
  const { vehicles } = res.ok
    ? await res.json()
    : { vehicles: [] };

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.flatMap(
    ({ path, priority, changeFrequency }) =>
      LOCALES.map((locale) => ({
        url: `${BASE_URL}/${locale}${path}`,
        priority,
        changeFrequency,
        lastModified: new Date(),
      })),
  );

  const vehicleEntries: MetadataRoute.Sitemap = vehicles.flatMap((v) =>
    LOCALES.map((locale) => ({
      url: `${BASE_URL}/${locale}/cars/${v.id}`,
      lastModified: v.updatedAt,
      priority: 0.8,
      changeFrequency: "weekly" as const,
    })),
  );

  return [...staticEntries, ...vehicleEntries];
}
