// Vehicle/dealer images come back from the API as R2 storage *keys*
// (e.g. "vehicles/uuid.jpg"), not absolute URLs. Mirror the web's getImageUrl
// (packages/ui/src/lib/helpers/image.ts): pass through full URLs, otherwise
// prepend the public CDN domain.
const R2_DOMAIN = process.env.EXPO_PUBLIC_R2_PUBLIC_DOMAIN ?? "https://cdn.autovendo.ch";

export function imageUrl(key: string | null | undefined): string | null {
  if (!key) return null;
  if (key.startsWith("http")) return key;
  const clean = key.startsWith("/") ? key.slice(1) : key;
  return `${R2_DOMAIN}/${clean}`;
}

export function imageUrls(keys: string[] | null | undefined): string[] {
  if (!keys) return [];
  return keys.map(imageUrl).filter((u): u is string => !!u);
}
