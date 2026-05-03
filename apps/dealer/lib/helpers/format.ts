/**
 * ============================================================================
 * FORMATTING HELPERS - Production Grade
 * ============================================================================
 * Pure formatting functions with NO side effects
 */

/**
 * Map base locale to Swiss-specific locale for formatting
 */
export function getCHLocale(locale: string): string {
  const mapping: Record<string, string> = {
    de: "de-CH",
    fr: "fr-CH",
    it: "it-CH",
    en: "en-CH",
  };
  return mapping[locale] || locale || "de-CH";
}

/**
 * Format price in Swiss Francs (CHF 1'234.00)
 */
export function formatPrice(price: number, locale: string = "de-CH"): string {
  const chLocale = getCHLocale(locale);
  return new Intl.NumberFormat(chLocale, {
    style: "currency",
    currency: "CHF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatNumber(
  num: number | null | undefined,
  locale: string = "de-CH",
): string {
  if (num === null || num === undefined) return "0";
  const chLocale = getCHLocale(locale);
  return new Intl.NumberFormat(chLocale).format(num);
}

/**
 * Format kilometers (1'234 km)
 */
export function formatKilometers(km: number, locale: string = "de-CH"): string {
  return `${formatNumber(km, locale)} km`;
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
export function formatPower(
  kw: number | null,
  hp: number | null,
  locale: string = "de-CH",
): string {
  if (kw === null && hp === null) return "N/A";
  if (kw !== null && hp !== null)
    return `${formatNumber(kw, locale)} kW (${formatNumber(hp, locale)} PS)`;
  if (kw !== null) return `${formatNumber(kw, locale)} kW`;
  return `${formatNumber(hp, locale)} PS`;
}

/**
 * Format PS only
 */
export function formatPS(hp: number | null, locale: string = "de-CH"): string {
  if (hp === null) return "N/A";
  return `${formatNumber(hp, locale)} PS`;
}

/**
 * Format kW only
 */
export function formatKW(kw: number | null, locale: string = "de-CH"): string {
  if (kw === null) return "N/A";
  return `${formatNumber(kw, locale)} kW`;
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
export function formatCount(count: number, locale: string = "de-CH"): string {
  return formatNumber(count, locale);
}

/**
 * Format date time following Swiss standards
 */
export function formatDateTime(
  date: Date | string | number,
  locale: string = "de-CH",
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  },
): string {
  const chLocale = getCHLocale(locale);
  const d =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;
  return new Intl.DateTimeFormat(chLocale, options).format(d);
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
