/**
 * IMAGE HELPERS
 * Image URL handling with CDN support for Admin
 */

const R2_DOMAIN = process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN || "";

/**
 * Get full image URL from storage key
 */
export function getImageUrl(key: string | undefined | null): string {
  if (!key) return "";
  if (key.startsWith("http")) return key;

  const cleanKey = key.startsWith("/") ? key.slice(1) : key;
  return `${R2_DOMAIN}/${cleanKey}`;
}
