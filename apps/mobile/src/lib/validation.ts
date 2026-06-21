// ─────────────────────────────────────────────────────────────────────────────
// Client-side field validators — mirror the server Zod rules
// (apps/api profile.validation.ts + apps/seller schema/profile-schema.ts) so the
// app shows inline errors before submit. The API still re-validates everything.
// Each validator returns a German error string, or null when valid.
// ─────────────────────────────────────────────────────────────────────────────

import { swissCities } from "@repo/vehicle-constants";

const CITY_SET = new Set((swissCities as { value: string }[]).map((c) => c.value));

export const RE = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  swissPhone: /^(\+41|0041|0)\s?([1-9]{2})\s?(\d{3})\s?(\d{2})\s?(\d{2})$/,
  swissZip: /^\d{4}$/,
  uid: /^CHE-\d{3}\.\d{3}\.\d{3}$/,
  url: /^https?:\/\/.+\..+/i,
  vin: /^[A-HJ-NPR-Z0-9]{17}$/,
};

function len(s: string, min: number, max: number, label: string): string | null {
  const t = s.trim();
  if (t.length < min) return `${label} muss mind. ${min} Zeichen lang sein.`;
  if (t.length > max) return `${label} darf max. ${max} Zeichen lang sein.`;
  return null;
}

export const validate = {
  name: (s: string) => len(s, 3, 50, "Name"),
  email: (s: string) => (RE.email.test(s.trim()) ? null : "Ungültige E-Mail-Adresse."),
  phone: (s: string) => {
    const t = s.trim();
    if (!t) return "Telefonnummer ist erforderlich.";
    return RE.swissPhone.test(t) ? null : "Ungültige Telefonnummer (z. B. 079 123 45 67).";
  },
  address: (s: string) => len(s, 5, 100, "Adresse"),
  zip: (s: string) => (RE.swissZip.test(s.trim()) ? null : "Ungültige PLZ (4 Ziffern)."),
  city: (s: string) => (CITY_SET.has(s) ? null : "Bitte wählen Sie einen Ort."),
  companyName: (s: string) => len(s, 3, 50, "Firmenname"),
  contactPerson: (s: string) => len(s, 3, 50, "Kontaktperson"),
  uid: (s: string) => {
    const t = s.trim();
    if (!t) return "UID-Nummer ist erforderlich.";
    return RE.uid.test(t) ? null : "Ungültige UID (CHE-123.456.789).";
  },
  businessEmail: (s: string) => (RE.email.test(s.trim()) ? null : "Ungültige E-Mail-Adresse."),
  // Optional URL — valid when empty.
  websiteOptional: (s: string) => {
    const t = s.trim();
    if (!t) return null;
    return RE.url.test(t) ? null : "Ungültige URL (https://…).";
  },
};

// Show an error only once the user has typed something OR after a submit attempt
// (so empty required fields don't flash red before interaction).
export function fieldError(value: string, error: string | null, submitted: boolean): string | null {
  if (!error) return null;
  return submitted || value.trim().length > 0 ? error : null;
}
