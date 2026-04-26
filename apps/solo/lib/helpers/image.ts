/**
 * ============================================================================
 * IMAGE HELPERS - Production Grade
 * ============================================================================
 * Image URL handling with CDN support
 */

const R2_DOMAIN = process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN || "";
const PLACEHOLDER_IMAGE = "/placeholder-car.jpg";

/**
 * Get full image URL from storage key
 * Handles CDN, absolute URLs, and fallback
 */
export function getImageUrl(key: string | undefined | null): string {
  if (!key) return PLACEHOLDER_IMAGE;
  if (key.startsWith("http")) return key;

  const cleanKey = key.startsWith("/") ? key.slice(1) : key;
  return `${R2_DOMAIN}/${cleanKey}`;
}

/**
 * Get multiple image URLs
 */
export function getImageUrls(keys: string[]): string[] {
  return keys.map(getImageUrl);
}

/**
 * Get first image or placeholder
 */
export function getFirstImage(images: string[]): string {
  return getImageUrl(images[0]);
}
