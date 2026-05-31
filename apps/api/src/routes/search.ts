import { Hono } from "hono";
import { prisma } from "@repo/db";

const search = new Hono();

const R2_DOMAIN = process.env.R2_PUBLIC_DOMAIN ?? "";

function getImageUrl(key: string | undefined | null): string | null {
  if (!key) return null;
  if (key.startsWith("http")) return key;
  const cleanKey = key.startsWith("/") ? key.slice(1) : key;
  return R2_DOMAIN ? `${R2_DOMAIN}/${cleanKey}` : null;
}

// ─── Enum maps ────────────────────────────────────────────────────────────────

const FUEL_MAP: Record<string, string> = {
  petrol: "PETROL",
  diesel: "DIESEL",
  electric: "ELECTRIC",
  "mhev-petrol": "MHEV_PETROL",
  "mhev-diesel": "MHEV_DIESEL",
  "phev-petrol": "PHEV_PETROL",
  "phev-diesel": "PHEV_DIESEL",
  "hev-petrol": "HEV_PETROL",
  "hev-diesel": "HEV_DIESEL",
  "ethanol-petrol": "ETHANOL_PETROL",
  "cng-petrol": "CNG_PETROL",
  "lpg-petrol": "LPG_PETROL",
  hydrogen: "HYDROGEN",
};

const TRANSMISSION_MAP: Record<string, string> = {
  automatic: "AUTOMATIC",
  manual: "MANUAL",
  "automatic-stepless": "AUTOMATIC_STEPLESS",
  "semi-automatic": "SEMI_AUTOMATIC",
};

const DRIVE_MAP: Record<string, string> = {
  all: "ALL",
  front: "FRONT",
  rear: "REAR",
};

const COLOR_MAP: Record<string, string> = {
  anthracite: "ANTHRACITE",
  beige: "BEIGE",
  black: "BLACK",
  blue: "BLUE",
  bordeaux: "BORDEAUX",
  brown: "BROWN",
  gold: "GOLD",
  gray: "GRAY",
  green: "GREEN",
  multicoloured: "MULTICOLOURED",
  orange: "ORANGE",
  pink: "PINK",
  red: "RED",
  silver: "SILVER",
  turquoise: "TURQUOISE",
  violet: "VIOLET",
  white: "WHITE",
  yellow: "YELLOW",
  other: "OTHER",
};

const VEHICLE_TYPE_MAP: Record<string, string> = {
  car: "CAR",
  camper: "CAMPER",
  utility: "UTILITY",
  truck: "TRUCK",
};

const CONDITION_MAP: Record<string, string> = {
  new: "NEW",
  used: "USED",
  demonstration: "DEMONSTRATION",
  "pre-registered": "PRE_REGISTERED",
  oldtimer: "OLDTIMER",
};

const EURO_NORM_MAP: Record<string, string> = {
  "euro-6e": "EURO_6E",
  "euro-6d-isc-fcm": "EURO_6D_ISC_FCM",
  "euro-6d-isc": "EURO_6D_ISC",
  "euro-6d-temp-evap-isc": "EURO_6D_TEMP_EVAP_ISC",
  "euro-6d-temp-evap": "EURO_6D_TEMP_EVAP",
  "euro-6d-temp-isc": "EURO_6D_TEMP_ISC",
  "euro-6d-temp": "EURO_6D_TEMP",
  "euro-6d": "EURO_6D",
  "euro-6c": "EURO_6C",
  "euro-6b": "EURO_6B",
  "euro-6a": "EURO_6A",
  "euro-6": "EURO_6",
  "euro-5-plus": "EURO_5_PLUS",
  "euro-5": "EURO_5",
  "euro-4": "EURO_4",
  "euro-3": "EURO_3",
  "euro-2": "EURO_2",
  "euro-1": "EURO_1",
};

const FUEL_LABELS: Record<string, string> = {
  PETROL: "Petrol",
  DIESEL: "Diesel",
  ELECTRIC: "Electric",
  MHEV_PETROL: "Mild Hybrid",
  MHEV_DIESEL: "Mild Hybrid",
  PHEV_PETROL: "Plug-in Hybrid",
  PHEV_DIESEL: "Plug-in Hybrid",
  HEV_PETROL: "Hybrid",
  HEV_DIESEL: "Hybrid",
  ETHANOL_PETROL: "Ethanol",
  CNG_PETROL: "CNG",
  LPG_PETROL: "LPG",
  HYDROGEN: "Hydrogen",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function toInt(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = parseInt(value, 10);
  return isNaN(n) ? undefined : n;
}

function toFloat(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = parseFloat(value);
  return isNaN(n) ? undefined : n;
}

function mapArray<T extends string>(
  values: string[],
  map: Record<string, string>
): T[] {
  return values
    .map((v) => map[v])
    .filter(Boolean) as T[];
}

// ─── Route ────────────────────────────────────────────────────────────────────

search.get("/", async (c) => {
  const q = c.req.queries();

  // Pagination
  const page = Math.max(1, toInt(c.req.query("page")) ?? 1);
  const pageSize = Math.min(50, Math.max(1, toInt(c.req.query("pageSize")) ?? 20));

  // Vehicle type
  const vehicleTypeRaw = c.req.query("vehicleType");
  const vehicleType = vehicleTypeRaw ? VEHICLE_TYPE_MAP[vehicleTypeRaw] : undefined;

  // Text search
  const query = c.req.query("q")?.trim();

  // Multi-select filters
  const makes = getArray(q["make"]);
  const fuels = mapArray(getArray(q["fuel"]), FUEL_MAP);
  const transmissions = mapArray(getArray(q["transmission"]), TRANSMISSION_MAP);
  const drives = mapArray(getArray(q["drive"]), DRIVE_MAP);
  const colors = mapArray(getArray(q["color"]), COLOR_MAP);
  const intColors = mapArray(getArray(q["intColor"]), COLOR_MAP);
  const conditions = mapArray(getArray(q["condition"]), CONDITION_MAP);
  const bodyTypes = getArray(q["bodyType"]);
  const energyLabels = getArray(q["energyLabel"]).map((l) => l.toUpperCase());
  const euroNorms = mapArray(getArray(q["euroNorm"]), EURO_NORM_MAP);
  const equipment = getArray(q["equipment"]);

  // Range filters
  const priceFrom = toInt(c.req.query("priceFrom"));
  const priceTo = toInt(c.req.query("priceTo"));
  const yearFrom = toInt(c.req.query("yearFrom"));
  const yearTo = toInt(c.req.query("yearTo"));
  const kmFrom = toInt(c.req.query("kmFrom"));
  const kmTo = toInt(c.req.query("kmTo"));
  const cubicFrom = toInt(c.req.query("cubicFrom"));
  const cubicTo = toInt(c.req.query("cubicTo"));
  const cylinderFrom = toInt(c.req.query("cylinderFrom"));
  const cylinderTo = toInt(c.req.query("cylinderTo"));
  const consumFrom = toFloat(c.req.query("consumFrom"));
  const consumTo = toFloat(c.req.query("consumTo"));
  const co2From = toInt(c.req.query("co2From"));
  const co2To = toInt(c.req.query("co2To"));

  // Power — ps or kw
  const powerUnit = c.req.query("powerUnit") === "kw" ? "kw" : "ps";
  const powerFrom = toInt(c.req.query("powerFrom"));
  const powerTo = toInt(c.req.query("powerTo"));

  // Boolean filters
  const metallic = c.req.query("metallic") === "true" ? true : undefined;
  const mfk = c.req.query("mfk") === "true" ? true : undefined;
  const warranty = c.req.query("warranty") === "true" ? true : undefined;

  // Days listed
  const daysListed = toInt(c.req.query("daysListed"));

  // ─── Build WHERE clause ────────────────────────────────────────────────────

  const where: Record<string, unknown> = {
    status: "PUBLISHED",
  };

  if (vehicleType) where.vehicleType = vehicleType;

  if (query) {
    where.OR = [
      { make: { contains: query, mode: "insensitive" } },
      { model: { contains: query, mode: "insensitive" } },
      { version: { contains: query, mode: "insensitive" } },
    ];
  }

  if (makes.length) where.make = { in: makes };
  if (fuels.length) where.fuelType = { in: fuels };
  if (transmissions.length) where.transmissionType = { in: transmissions };
  if (drives.length) where.driveType = { in: drives };
  if (colors.length) where.color = { in: colors };
  if (intColors.length) where.interiorColor = { in: intColors };
  if (conditions.length) where.vehicleCondition = { in: conditions };
  if (energyLabels.length) where.energyLabel = { in: energyLabels };
  if (euroNorms.length) where.emissionStandard = { in: euroNorms };

  if (bodyTypes.length) {
    where.bodyType = { in: bodyTypes };
  }

  if (priceFrom !== undefined || priceTo !== undefined) {
    where.price = {
      ...(priceFrom !== undefined ? { gte: priceFrom } : {}),
      ...(priceTo !== undefined ? { lte: priceTo } : {}),
    };
  }

  if (yearFrom !== undefined || yearTo !== undefined) {
    where.registrationYear = {
      ...(yearFrom !== undefined ? { gte: yearFrom } : {}),
      ...(yearTo !== undefined ? { lte: yearTo } : {}),
    };
  }

  if (kmFrom !== undefined || kmTo !== undefined) {
    where.kilometer = {
      ...(kmFrom !== undefined ? { gte: kmFrom } : {}),
      ...(kmTo !== undefined ? { lte: kmTo } : {}),
    };
  }

  if (cubicFrom !== undefined || cubicTo !== undefined) {
    where.cubicCapacity = {
      ...(cubicFrom !== undefined ? { gte: cubicFrom } : {}),
      ...(cubicTo !== undefined ? { lte: cubicTo } : {}),
    };
  }

  if (cylinderFrom !== undefined || cylinderTo !== undefined) {
    where.cylinders = {
      ...(cylinderFrom !== undefined ? { gte: cylinderFrom } : {}),
      ...(cylinderTo !== undefined ? { lte: cylinderTo } : {}),
    };
  }

  if (consumFrom !== undefined || consumTo !== undefined) {
    where.consumptionTotal = {
      ...(consumFrom !== undefined ? { gte: consumFrom } : {}),
      ...(consumTo !== undefined ? { lte: consumTo } : {}),
    };
  }

  if (co2From !== undefined || co2To !== undefined) {
    where.co2Emission = {
      ...(co2From !== undefined ? { gte: co2From } : {}),
      ...(co2To !== undefined ? { lte: co2To } : {}),
    };
  }

  if (powerFrom !== undefined || powerTo !== undefined) {
    if (powerUnit === "kw") {
      where.kw = {
        ...(powerFrom !== undefined ? { gte: powerFrom } : {}),
        ...(powerTo !== undefined ? { lte: powerTo } : {}),
      };
    } else {
      where.hp = {
        ...(powerFrom !== undefined ? { gte: powerFrom } : {}),
        ...(powerTo !== undefined ? { lte: powerTo } : {}),
      };
    }
  }

  if (metallic !== undefined) where.metallic = metallic;
  if (mfk !== undefined) where.inspectionPassed = mfk;
  if (warranty !== undefined) where.warranty = { not: null };

  if (daysListed !== undefined) {
    const since = new Date();
    since.setDate(since.getDate() - daysListed);
    where.createdAt = { gte: since };
  }

  // Equipment — all selected items must be present in JSON
  if (equipment.length) {
    where.AND = equipment.map((key) => ({
      equipment: { path: [key], equals: true },
    }));
  }

  // ─── Execute queries ───────────────────────────────────────────────────────

  const [total, vehicles] = await Promise.all([
    prisma.vehicle.count({ where: where as any }),
    prisma.vehicle.findMany({
      where: where as any,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        make: true,
        model: true,
        version: true,
        price: true,
        kilometer: true,
        fuelType: true,
        registrationYear: true,
        registrationMonth: true,
        bodyType: true,
        transmissionType: true,
        hp: true,
        kw: true,
        color: true,
        images: true,
        createdAt: true,
        vehicleCondition: true,
        dealer: { select: { city: true } },
        seller: { select: { city: true } },
      },
    }),
  ]);

  const results = vehicles.map((v) => ({
    id: v.id,
    make: v.make,
    model: v.model ?? "",
    version: v.version ?? null,
    price: v.price,
    mileage: v.kilometer,
    fuel: v.fuelType ? (FUEL_LABELS[v.fuelType] ?? v.fuelType) : null,
    year: v.registrationYear,
    month: v.registrationMonth ?? null,
    bodyType: v.bodyType ?? null,
    transmission: v.transmissionType ?? null,
    hp: v.hp ?? null,
    kw: v.kw ?? null,
    color: v.color ?? null,
    condition: v.vehicleCondition ?? null,
    image: getImageUrl(v.images[0]),
    images: v.images.map(getImageUrl).filter(Boolean) as string[],
    city: v.dealer?.city ?? v.seller?.city ?? null,
    createdAt: v.createdAt.toISOString(),
  }));

  return c.json({
    data: results,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasNext: page * pageSize < total,
      hasPrev: page > 1,
    },
  });
});

export default search;
