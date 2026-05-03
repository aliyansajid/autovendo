/**
 * ============================================================================
 * FORMATTING HELPERS - Production Grade
 * ============================================================================
 * Pure formatting functions with NO side effects
 * Always using de-CH for Swiss standards
 */

const CH_LOCALE = "de-CH";

/**
 * Format price in Swiss Francs (CHF 1'234.00)
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return "0";
  return new Intl.NumberFormat("de-CH").format(num);
}

/**
 * Format kilometers (1'234 km)
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
  if (kw === null && hp === null) return "N/A";
  if (kw !== null && hp !== null)
    return `${formatNumber(kw)} kW (${formatNumber(hp)} PS)`;
  if (kw !== null) return `${formatNumber(kw)} kW`;
  return `${formatNumber(hp)} PS`;
}

/**
 * Format PS only
 */
export function formatPS(hp: number | null): string {
  if (hp === null) return "N/A";
  return `${formatNumber(hp)} PS`;
}

/**
 * Format kW only
 */
export function formatKW(kw: number | null): string {
  if (kw === null) return "N/A";
  return `${formatNumber(kw)} kW`;
}

/**
 * Format enum value to readable label - DEPRECATED: Use constants labels instead
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
  return formatNumber(count);
}

/**
 * Format date time following Swiss standards
 */
export function formatDateTime(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  },
  locale: string = "de-CH",
) : string {
  const d =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;
  return new Intl.DateTimeFormat(locale, options).format(d);
}

export const DAY_ORDER = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

/**
 * Map DayOfWeek enum values to German day names - DEPRECATED: Use localized strings in components
 */
export const DAY_LABELS: Record<string, string> = {
  MONDAY: "Montag",
  TUESDAY: "Dienstag",
  WEDNESDAY: "Mittwoch",
  THURSDAY: "Donnerstag",
  FRIDAY: "Freitag",
  SATURDAY: "Samstag",
  SUNDAY: "Sonntag",
};
