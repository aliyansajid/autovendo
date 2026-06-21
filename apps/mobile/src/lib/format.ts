// ─────────────────────────────────────────────────────────────────────────────
// de-CH formatting helpers. Swiss German uses ’ (apostrophe) as the thousands
// separator and CHF as the currency. Intl is available in the Hermes runtime
// used by this app; helpers fall back gracefully if a locale is unavailable.
// ─────────────────────────────────────────────────────────────────────────────

const LOCALE = "de-CH";

function safeNumber(value: number, options?: Intl.NumberFormatOptions): string {
  try {
    return new Intl.NumberFormat(LOCALE, options).format(value);
  } catch {
    return String(value);
  }
}

/** "CHF 24’900" — no decimals, Swiss grouping. */
export function formatPrice(value: number | null | undefined): string {
  if (value == null) return "Preis auf Anfrage";
  return safeNumber(value, {
    style: "currency",
    currency: "CHF",
    maximumFractionDigits: 0,
  });
}

/** "84’500 km" */
export function formatKm(value: number | null | undefined): string {
  if (value == null) return "–";
  return `${safeNumber(value)} km`;
}

/** Plain grouped number. */
export function formatNumber(value: number | null | undefined): string {
  if (value == null) return "–";
  return safeNumber(value);
}

/** Engine power shown the Swiss way: "150 PS (110 kW)". */
export function formatPower(
  hp: number | null | undefined,
  kw: number | null | undefined,
): string {
  if (hp != null && kw != null) return `${hp} PS (${kw} kW)`;
  if (hp != null) return `${hp} PS`;
  if (kw != null) return `${kw} kW`;
  return "–";
}

/** First registration "MM.YYYY" (or just the year if month is missing). */
export function formatRegistration(
  month: number | null | undefined,
  year: number | null | undefined,
): string {
  if (year == null) return "–";
  if (month == null) return String(year);
  return `${String(month).padStart(2, "0")}.${year}`;
}

/** "1.2.2024" style date from an ISO string. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "–";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "–";
  try {
    return new Intl.DateTimeFormat(LOCALE, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return d.toLocaleDateString();
  }
}

/** Relative German label: "Heute", "Gestern", "vor 4 Tagen". */
export function formatRelativeDays(iso: string | null | undefined): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return "Heute";
  if (days === 1) return "Gestern";
  if (days < 7) return `vor ${days} Tagen`;
  if (days < 14) return "vor 1 Woche";
  if (days < 30) return `vor ${Math.floor(days / 7)} Wochen`;
  if (days < 60) return "vor 1 Monat";
  return `vor ${Math.floor(days / 30)} Monaten`;
}

/** "L/100 km" consumption value. */
export function formatConsumption(value: number | null | undefined): string {
  if (value == null) return "–";
  return `${safeNumber(value, { maximumFractionDigits: 1 })} l/100 km`;
}

/** Build a concise subtitle line for a listing, e.g. "03.2021 · 84’500 km · 150 PS". */
export function vehicleMetaLine(parts: (string | null | undefined)[]): string {
  return parts.filter((p) => p && p !== "–").join("  ·  ");
}
