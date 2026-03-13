import { z } from "zod";
import type { Prisma } from "@repo/db";

export const SORT_VALUES = [
  "relevance",
  "price-asc",
  "price-desc",
  "kilometer-asc",
  "kilometer-desc",
  "registration-asc",
  "registration-desc",
  "created-asc",
  "created-desc",
] as const;

export type SortValue = (typeof SORT_VALUES)[number];

// Frontend filter value domains (URL/search param layer), kept in sync with UI constants.
const FUEL_VALUES = [
  "petrol",
  "ethanol-petrol",
  "diesel",
  "electric",
  "cng-petrol",
  "lpg-petrol",
  "mhev-diesel",
  "mhev-petrol",
  "phev-diesel",
  "phev-petrol",
  "hev-diesel",
  "hev-petrol",
  "hydrogen",
] as const;

const TRANSMISSION_VALUES = [
  "automatic",
  "automatic-stepless",
  "semi-automatic",
  "manual",
] as const;

const CONDITION_VALUES = [
  "new",
  "demonstration",
  "pre-registered",
  "used",
  "oldtimer",
] as const;

const VEHICLE_TYPE_VALUES = ["car", "utility", "truck", "camper"] as const;

const COLOR_VALUES = [
  "anthracite",
  "beige",
  "black",
  "blue",
  "bordeaux",
  "brown",
  "gold",
  "gray",
  "green",
  "multicoloured",
  "orange",
  "pink",
  "red",
  "silver",
  "turquoise",
  "violet",
  "white",
  "yellow",
  "other",
] as const;

function asString(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value[0];
  return value;
}

function asStringArray(
  value: string | string[] | undefined,
): string[] | undefined {
  if (value === undefined) return undefined;
  const raw = Array.isArray(value) ? value.join(",") : value;
  const parts = raw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
  return parts.length ? parts : undefined;
}

function asInt(value: string | string[] | undefined): number | undefined {
  const s = asString(value);
  if (!s) return undefined;
  const n = Number(s);
  if (!Number.isFinite(n)) return undefined;
  return Math.trunc(n);
}

function asBool(value: string | string[] | undefined): boolean | undefined {
  const s = asString(value);
  if (s === "true") return true;
  if (s === "false") return false;
  return undefined;
}

export const VehicleSearchParamsSchema = z.object({
  page: z.number().int().min(1).catch(1),
  pageSize: z.number().int().min(1).max(60).catch(10),
  sort: z.enum(SORT_VALUES).catch("relevance"),
  search: z.string().trim().catch(""),

  make: z.string().trim().optional(),
  model: z.string().trim().optional(),

  priceFrom: z.number().int().optional(),
  priceTo: z.number().int().optional(),
  registrationFrom: z.number().int().optional(),
  registrationTo: z.number().int().optional(),
  kilometerFrom: z.number().int().optional(),
  kilometerTo: z.number().int().optional(),
  powerFrom: z.number().int().optional(),
  powerTo: z.number().int().optional(),

  fuel: z.array(z.enum(FUEL_VALUES)).optional(),
  transmission: z.array(z.enum(TRANSMISSION_VALUES)).optional(),
  condition: z.array(z.enum(CONDITION_VALUES)).optional(),
  vehicleType: z.array(z.enum(VEHICLE_TYPE_VALUES)).optional(),
  color: z.array(z.enum(COLOR_VALUES)).optional(),

  evs: z.enum(["only_ev", "no_ev"]).optional(),
  metallic: z.boolean().optional(),
  equipment: z.array(z.string()).optional(),
});

export type VehicleSearchParams = z.infer<typeof VehicleSearchParamsSchema>;

export type VehicleFacetCounts = {
  make: Record<string, number>;
  fuelType: Record<string, number>;
  transmissionType: Record<string, number>;
  vehicleCondition: Record<string, number>;
  vehicleType: Record<string, number>;
  color: Record<string, number>;
};

export function parseVehicleSearchParams(input: {
  [key: string]: string | string[] | undefined;
}): VehicleSearchParams {
  const raw = {
    page: asInt(input.page),
    pageSize: asInt(input.pageSize),
    sort: asString(input.sort),
    search: asString(input.search),

    make: asString(input.make),
    model: asString(input.model),

    priceFrom: asInt(input.priceFrom),
    priceTo: asInt(input.priceTo),
    registrationFrom: asInt(input.registrationFrom),
    registrationTo: asInt(input.registrationTo),
    kilometerFrom: asInt(input.kilometerFrom),
    kilometerTo: asInt(input.kilometerTo),
    powerFrom: asInt(input.powerFrom),
    powerTo: asInt(input.powerTo),

    fuel: asStringArray(input.fuel),
    transmission: asStringArray(input.transmission),
    condition: asStringArray(input.condition),
    vehicleType: asStringArray(input.vehicleType),
    color: asStringArray(input.color),
    equipment: asStringArray(input.equipment),

    evs: asString(input.evs),
    metallic: asBool(input.metallic),
  };

  return VehicleSearchParamsSchema.parse(raw);
}

function mapToEnumToken(value: string) {
  return value.trim().toUpperCase().replace(/-/g, "_");
}

export function buildVehicleWhere(
  params: VehicleSearchParams,
  omit: Partial<Record<keyof VehicleSearchParams, true>> = {},
): Prisma.VehicleWhereInput {
  const where: Prisma.VehicleWhereInput = {};

  if (!omit.search && params.search) {
    where.OR = [
      { make: { contains: params.search, mode: "insensitive" } },
      { model: { contains: params.search, mode: "insensitive" } },
      { version: { contains: params.search, mode: "insensitive" } },
    ];
  }

  if (!omit.make && params.make && params.make !== "any") {
    where.make = { equals: params.make, mode: "insensitive" };
  }

  if (!omit.model && params.model && params.model !== "any") {
    where.model = { equals: params.model, mode: "insensitive" };
  }

  if (!omit.priceFrom || !omit.priceTo) {
    if (params.priceFrom || params.priceTo) {
      where.price = {
        gte: params.priceFrom || undefined,
        lte: params.priceTo || undefined,
      };
    }
  }

  if (!omit.registrationFrom || !omit.registrationTo) {
    if (params.registrationFrom || params.registrationTo) {
      where.registrationYear = {
        gte: params.registrationFrom || undefined,
        lte: params.registrationTo || undefined,
      };
    }
  }

  if (!omit.kilometerFrom || !omit.kilometerTo) {
    if (params.kilometerFrom || params.kilometerTo) {
      where.kilometer = {
        gte: params.kilometerFrom || undefined,
        lte: params.kilometerTo || undefined,
      };
    }
  }

  if (!omit.powerFrom || !omit.powerTo) {
    if (params.powerFrom || params.powerTo) {
      where.hp = {
        gte: params.powerFrom || undefined,
        lte: params.powerTo || undefined,
      };
    }
  }

  if (!omit.evs) {
    if (params.evs === "only_ev") {
      where.fuelType = { equals: "ELECTRIC" };
    } else if (params.evs === "no_ev") {
      where.fuelType = { not: "ELECTRIC" };
    }
  }

  if (!omit.fuel && params.fuel?.length) {
    where.fuelType = {
      in: params.fuel.map(mapToEnumToken) as any,
    };
  }

  if (!omit.transmission && params.transmission?.length) {
    where.transmissionType = {
      in: params.transmission.map(mapToEnumToken) as any,
    };
  }

  if (!omit.condition && params.condition?.length) {
    where.vehicleCondition = {
      in: params.condition.map(mapToEnumToken) as any,
    };
  }

  if (!omit.vehicleType && params.vehicleType?.length) {
    where.vehicleType = {
      in: params.vehicleType.map((v) => v.trim().toUpperCase()) as any,
    };
  }

  if (!omit.metallic && params.metallic !== undefined) {
    where.metallic = params.metallic;
  }

  if (!omit.color && params.color?.length) {
    where.color = {
      in: params.color.map((c) => c.trim().toUpperCase()) as any,
    };
  }

  if (!omit.equipment && params.equipment?.length) {
    const equipmentFilters = params.equipment.map((item) => ({
      equipment: {
        path: [item],
        equals: true,
      },
    }));
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : []),
      ...equipmentFilters,
    ];
  }

  return where;
}

export function buildVehicleOrderBy(
  sort: SortValue,
): Prisma.VehicleOrderByWithRelationInput {
  switch (sort) {
    case "price-asc":
      return { price: "asc" };
    case "price-desc":
      return { price: "desc" };
    case "kilometer-asc":
      return { kilometer: "asc" };
    case "kilometer-desc":
      return { kilometer: "desc" };
    case "registration-asc":
      return { registrationYear: "asc" };
    case "registration-desc":
      return { registrationYear: "desc" };
    case "created-asc":
      return { createdAt: "asc" };
    case "created-desc":
      return { createdAt: "desc" };
    case "relevance":
    default:
      return { createdAt: "desc" };
  }
}

export function groupByToCounts(
  rows: Array<{ [k: string]: any; _count: { _all: number } }>,
  key: string,
) {
  const out: Record<string, number> = {};
  for (const row of rows) {
    const v = row[key];
    if (v === null || v === undefined) continue;
    out[String(v)] = row._count._all;
  }
  return out;
}
