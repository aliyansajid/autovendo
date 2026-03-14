/**
 * ============================================================================
 * FORMATTING HELPERS - Production Grade
 * ============================================================================
 * Pure formatting functions with NO side effects
 */

/**
 * Format price in Swiss Francs
 */
export function formatPrice(price: number, locale: string = "de-CH"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "CHF",
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Format number with thousand separators
 */
export function formatNumber(num: number, locale: string = "de-DE"): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Format kilometers
 */
export function formatKilometers(km: number): string {
  return `${formatNumber(km)} km`;
}

/**
 * Format registration date (MM/YYYY)
 */
export function formatRegistrationDate(
  month: number | null | undefined,
  year: number | null | undefined,
): string {
  if (!month || !year) return "N/A";
  return `${String(month).padStart(2, "0")}/${year}`;
}

/**
 * Format power (kW and PS)
 */
export function formatPower(kw: number | null, hp: number | null): string {
  if (!kw && !hp) return "N/A";
  if (kw && hp) return `${kw} kW (${hp} PS)`;
  if (kw) return `${kw} kW`;
  return `${hp} PS`;
}

/**
 * Format enum value to readable label
 * Example: "MHEV_DIESEL" -> "Mhev Diesel"
 */
export function formatEnumLabel(value: string | null | undefined): string {
  if (!value) return "N/A";
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Format count with thousand separators
 */
export function formatCount(count: number): string {
  return new Intl.NumberFormat("de-CH").format(count);
}
