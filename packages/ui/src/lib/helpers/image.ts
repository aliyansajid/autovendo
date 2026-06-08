const R2_DOMAIN = process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN || "";

export function getImageUrl(key: string | undefined | null): string {
  if (!key) return "";
  if (key.startsWith("http")) return key;

  const cleanKey = key.startsWith("/") ? key.slice(1) : key;
  return `${R2_DOMAIN}/${cleanKey}`;
}

export function getImageUrls(keys: string[]): string[] {
  return keys.map(getImageUrl);
}

export function getFirstImage(images: string[]): string {
  return getImageUrl(images[0]);
}
