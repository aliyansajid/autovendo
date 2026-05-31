import type { MetadataRoute } from "next";

const BASE_URL = "https://autovendo.ch";
const LOCALES = ["de", "en", "fr", "it"];

const STATIC_PATHS = [
  { path: "", priority: 1.0, changeFrequency: "daily" as const },
  { path: "/cars", priority: 0.9, changeFrequency: "hourly" as const },
  { path: "/dealers", priority: 0.8, changeFrequency: "daily" as const },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/contact", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/faq", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/pricing", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/how-it-works", priority: 0.6, changeFrequency: "monthly" as const },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const res = await fetch(`${API_BASE}/api/sitemap`, { cache: "no-store" });
  const { vehicles, dealers } = res.ok
    ? await res.json()
    : { vehicles: [], dealers: [] };

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.flatMap(
    ({ path, priority, changeFrequency }) =>
      LOCALES.map((locale) => ({
        url: `${BASE_URL}/${locale}${path}`,
        priority,
        changeFrequency,
        lastModified: new Date(),
      }))
  );

  const vehicleEntries: MetadataRoute.Sitemap = vehicles.flatMap((v) =>
    LOCALES.map((locale) => ({
      url: `${BASE_URL}/${locale}/cars/${v.id}`,
      lastModified: v.updatedAt,
      priority: 0.8,
      changeFrequency: "weekly" as const,
    }))
  );

  const dealerEntries: MetadataRoute.Sitemap = dealers.flatMap((d) =>
    LOCALES.map((locale) => ({
      url: `${BASE_URL}/${locale}/dealers/${d.id}`,
      lastModified: d.updatedAt,
      priority: 0.7,
      changeFrequency: "weekly" as const,
    }))
  );

  return [...staticEntries, ...vehicleEntries, ...dealerEntries];
}
