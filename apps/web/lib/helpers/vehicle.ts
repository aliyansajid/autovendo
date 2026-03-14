/**
 * ============================================================================
 * VEHICLE HELPERS - Production Grade
 * ============================================================================
 * Vehicle-specific business logic helpers
 */

import type { Prisma } from "@repo/db";

/**
 * Build vehicle title from parts
 */
export function buildVehicleTitle(
  make: string,
  model: string | null,
  version: string | null,
): string {
  const parts = [make, model, version].filter(Boolean);
  return parts.join(" ").trim();
}

/**
 * Format vehicle name with proper capitalization
 */
export function formatVehicleName(
  parts: (string | null | undefined)[],
): string {
  const raw = parts
    .filter((p): p is string => !!p && p.trim().length > 0)
    .join(" ");

  return raw
    .split(" ")
    .filter(Boolean)
    .map((word) =>
      word
        .split("-")
        .map((segment) => {
          const firstChar = segment.charAt(0);
          if (!firstChar) return "";
          return firstChar.toUpperCase() + segment.slice(1);
        })
        .join("-"),
    )
    .join(" ");
}

/**
 * Extract equipment keys from JSON
 */
export function extractEquipment(
  equipment: Prisma.JsonValue | null,
  limit?: number,
): string[] {
  if (!equipment || typeof equipment !== "object") return [];

  const entries = Object.entries(equipment)
    .filter(([_, value]) => value === true)
    .map(([key]) => key);

  return limit ? entries.slice(0, limit) : entries;
}

/**
 * Format equipment key to readable label
 * Example: "airConditioning" -> "Air Conditioning"
 */
export function formatEquipmentLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Check if vehicle is electric
 */
export function isElectric(fuelType: string | null): boolean {
  return fuelType?.toUpperCase() === "ELECTRIC";
}

/**
 * Check if vehicle is new
 */
export function isNew(condition: string | null): boolean {
  return condition?.toUpperCase() === "NEW";
}

/**
 * Parse URL search params to validated search object
 */
export function parseSearchParams(params: {
  [key: string]: string | string[] | undefined;
}): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;

    // Handle arrays (comma-separated or multiple values)
    if (Array.isArray(value)) {
      result[key] = value;
    } else if (value.includes(",")) {
      result[key] = value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    } else {
      // Handle single values
      const num = Number(value);
      if (!isNaN(num) && value !== "") {
        result[key] = num;
      } else if (value === "true") {
        result[key] = true;
      } else if (value === "false") {
        result[key] = false;
      } else {
        result[key] = value;
      }
    }
  }

  return result;
}
