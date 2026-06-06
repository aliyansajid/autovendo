import { Hono } from "hono";
import { z } from "zod";
import { prisma } from "@repo/db";
import { auth } from "../lib/auth";
import {
  VALID_MAKES_BY_TYPE,
  VALID_MODELS_BY_TYPE,
  VALID_EQUIPMENT_KEYS,
  VALID_EXTRAS_KEYS_BY_TYPE,
  VehicleTypeEnum,
  GearTransmissionEnum,
  TransmissionTypeEnum,
  DriveTypeEnum,
  ColorEnum,
  VehicleConditionEnum,
  WarrantyEnum,
  EnergyLabelEnum,
  BatteryOwnershipEnum,
  ChargingPlugTypeStandardEnum,
  ChargingPlugTypeFastEnum,
  EmissionStandardEnum,
  carFuelTypeEnum,
  utilityFuelTypeEnum,
  truckFuelTypeEnum,
  camperFuelTypeEnum,
} from "@repo/vehicle-constants";
import type {
  VehicleType,
  BodyType,
  FuelType,
  GearTransmission,
  TransmissionType,
  DriveType,
  Color,
  VehicleCondition,
  Warranty,
  EnergyLabel,
  EmissionStandard,
  BatteryOwnership,
  ChargingPlugTypeStandard,
  ChargingPlugTypeFast,
  VehicleStatus,
} from "@repo/db";

type Variables = {
  user: { id: string; email: string; role?: string | null } | null;
  session: unknown | null;
};

const router = new Hono<{ Variables: Variables }>();

// ─── Auth guard ───────────────────────────────────────────────────────────────

router.use("*", async (c, next) => {
  if (!c.get("user")) return c.json({ error: "Unauthorized" }, 401);
  await next();
});

// ─── Enum sets (derived from shared constants) ────────────────────────────────

const VALID_VEHICLE_TYPES = new Set(VehicleTypeEnum.map((v) => v.value));
const VALID_FUEL_TYPES = new Set([
  ...carFuelTypeEnum.map((v) => v.value),
  ...utilityFuelTypeEnum.map((v) => v.value),
  ...truckFuelTypeEnum.map((v) => v.value),
  ...camperFuelTypeEnum.map((v) => v.value),
]);
const VALID_GEAR_TRANSMISSIONS = new Set(
  GearTransmissionEnum.map((v) => v.value),
);
const VALID_TRANSMISSION_TYPES = new Set(
  TransmissionTypeEnum.map((v) => v.value),
);
const VALID_DRIVE_TYPES = new Set(DriveTypeEnum.map((v) => v.value));
const VALID_COLORS = new Set(ColorEnum.map((v) => v.value));
const VALID_CONDITIONS = new Set(VehicleConditionEnum.map((v) => v.value));
const VALID_WARRANTIES = new Set(WarrantyEnum.map((v) => v.value));
const VALID_ENERGY_LABELS = new Set(EnergyLabelEnum.map((v) => v.value));
const VALID_BATTERY_OWNERSHIPS = new Set(
  BatteryOwnershipEnum.map((v) => v.value),
);
const VALID_CHARGING_AC = new Set(
  ChargingPlugTypeStandardEnum.map((v) => v.value),
);
const VALID_CHARGING_DC = new Set(ChargingPlugTypeFastEnum.map((v) => v.value));
const VALID_EMISSION_STANDARDS = new Set(
  EmissionStandardEnum.map((v) => v.value),
);
const VALID_STATUSES = new Set<string>([
  "DRAFT",
  "PUBLISHED",
  "PAUSED",
  "SOLD",
  "ARCHIVED",
]);

const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/;

// ─── Zod body schema (mirrors DB CHECK constraints exactly) ───────────────────

// Coerce null/undefined/empty to undefined, then validate numeric range
const n = (min: number, max: number) =>
  z.preprocess(
    (v) => (v == null || v === "" ? undefined : Number(v)),
    z.number().min(min).max(max).optional(),
  );

// Optional enum field — allow null/undefined or a valid string value
const enumOpt = (set: Set<string>) =>
  z.preprocess(
    (v) => (v == null || v === "" ? undefined : v),
    z
      .string()
      .refine((v) => set.has(v), { message: "Invalid value" })
      .optional(),
  );

const vehicleApiBodySchema = z
  .object({
    vehicleType: z.string(),
    make: z.string().min(1).max(50),
    model: z.preprocess((v) => v ?? undefined, z.string().min(1).max(50).optional()),
    version: z.preprocess((v) => v ?? undefined, z.string().min(1).max(50).optional()),
    bodyType: z.string(),
    color: z.string().refine((v) => VALID_COLORS.has(v), "Invalid color"),
    interiorColor: enumOpt(VALID_COLORS),
    fuelType: enumOpt(VALID_FUEL_TYPES),
    gearTransmission: enumOpt(VALID_GEAR_TRANSMISSIONS),
    transmissionType: enumOpt(VALID_TRANSMISSION_TYPES),
    driveType: enumOpt(VALID_DRIVE_TYPES),
    vehicleCondition: enumOpt(VALID_CONDITIONS),
    warranty: enumOpt(VALID_WARRANTIES),
    energyLabel: enumOpt(VALID_ENERGY_LABELS),
    batteryOwnership: enumOpt(VALID_BATTERY_OWNERSHIPS),
    chargingPlugTypeStandard: enumOpt(VALID_CHARGING_AC),
    chargingPlugTypeFast: enumOpt(VALID_CHARGING_DC),
    emissionStandard: enumOpt(VALID_EMISSION_STANDARDS),
    status: z.enum(["DRAFT", "PUBLISHED", "PAUSED", "SOLD", "ARCHIVED"]).optional(),
    metallic: z.boolean().optional(),
    inspectionPassed: z.boolean().optional(),
    lastInspectionDate: z.string().optional().nullable(),
    warrantyStartDate: z.string().optional().nullable(),
    vehicleDescription: z.string().optional().nullable(),
    vin: z.preprocess(
      (v) => (v == null || v === "" ? undefined : v),
      z.string().regex(VIN_REGEX, "vin must be exactly 17 alphanumeric characters (no I, O, Q)").optional(),
    ),
    serialNumber: z.preprocess((v) => v ?? undefined, z.string().min(1).max(100).optional()),
    typeApproval: z.preprocess((v) => v ?? undefined, z.string().min(1).max(50).optional()),
    equipment: z.record(z.boolean().optional()).optional().nullable(),
    extras: z.record(z.boolean().optional()).optional().nullable(),
    images: z.array(z.string()).min(5).max(25),
    // ── Required numerics ───────────────────────────────────────────────────
    registrationMonth: z.coerce.number().int().min(1).max(12),
    registrationYear: z.coerce.number().int().min(1900).max(new Date().getFullYear()),
    kilometer: z.coerce.number().min(0),
    price: z.coerce.number().min(0),
    // ── Optional numerics (mirror DB CHECK constraints) ─────────────────────
    newPrice: n(0, Number.MAX_SAFE_INTEGER),
    hp: n(1, 4000),
    kw: n(1, 3000),
    combustionEnginePowerHp: n(1, 2500),
    electricMotorPowerHp: n(1, 4000),
    seats: n(1, 150),
    doors: n(1, 20),
    cylinders: n(1, 16),
    numberOfGears: n(1, 10),
    cubicCapacity: n(1, 30000),
    length: n(1, 30000),
    width: n(1, 5000),
    height: n(1, 6000),
    wheelbase: n(1, 15000),
    emptyWeight: n(1, 100000),
    loadCapacity: n(0, 100000),
    towingCapacityBraked: n(0, 100000),
    co2Emission: n(0, 1000),
    consumptionCity: n(0, 100),
    consumptionCountry: n(0, 100),
    consumptionTotal: n(0, 100),
    range: n(1, 1500),
    batteryCapacity: n(0, 500),
    powerConsumption: n(0, 100),
    chargingPower: n(0, 1000),
    batteryRentalMonth: n(1, 120),
    duration: n(1, 120),
    maxKm: n(0, 500000),
  })
  .superRefine((data, ctx) => {
    // Cross-field: vehicleType → make → model
    if (!VALID_VEHICLE_TYPES.has(data.vehicleType)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Invalid vehicleType: ${data.vehicleType}`, path: ["vehicleType"] });
      return z.NEVER;
    }
    const validMakes = VALID_MAKES_BY_TYPE[data.vehicleType as string];
    if (!validMakes?.includes(data.make)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Invalid make for vehicleType ${data.vehicleType}: ${data.make}`, path: ["make"] });
    }
    if (data.model != null) {
      const validModels = VALID_MODELS_BY_TYPE[data.vehicleType as string]?.[data.make as string];
      if (validModels && validModels.length > 0 && !validModels.includes(data.model)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Invalid model for ${data.vehicleType}/${data.make}: ${data.model}`, path: ["model"] });
      }
    }
    // Equipment keys
    if (data.equipment && typeof data.equipment === "object") {
      const invalid = Object.keys(data.equipment).filter((k) => !(VALID_EQUIPMENT_KEYS as string[]).includes(k));
      if (invalid.length) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Invalid equipment keys: ${invalid.join(", ")}`, path: ["equipment"] });
    }
    // Extras keys
    if (data.extras && typeof data.extras === "object") {
      const validExtras = VALID_EXTRAS_KEYS_BY_TYPE[data.vehicleType as string] ?? [];
      const invalid = Object.keys(data.extras).filter((k) => !validExtras.includes(k));
      if (invalid.length) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Invalid extras keys: ${invalid.join(", ")}`, path: ["extras"] });
    }
  });

// ─── Status transition rules (dealer-accessible transitions only) ─────────────

const ALLOWED_TRANSITIONS: Partial<Record<VehicleStatus, VehicleStatus[]>> = {
  DRAFT: ["PUBLISHED", "ARCHIVED"],
  PUBLISHED: ["DRAFT", "PAUSED", "SOLD", "ARCHIVED"],
  PAUSED: ["PUBLISHED", "DRAFT", "ARCHIVED"],
  SOLD: ["PUBLISHED", "ARCHIVED"],
  ARCHIVED: ["PUBLISHED", "DRAFT"],
  // BANNED: [] — admin-only, dealers cannot transition from BANNED
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getDealer(userId: string) {
  return prisma.dealer.findUnique({ where: { userId } });
}

async function getSubscriptionStatus(
  headers: Headers,
  dealerId?: string,
): Promise<"active" | "no_subscription" | "quota_exhausted"> {
  const subscriptionsResponse = await (auth.api as any).listActiveSubscriptions({ headers });
  const subscriptions = Array.isArray(subscriptionsResponse)
    ? subscriptionsResponse
    : (subscriptionsResponse as any)?.data || [];
  const limits = (subscriptionsResponse as any)?.limits;

  const activeSub = subscriptions.find(
    (s: any) => s.status === "active" || s.status === "trialing",
  );
  if (!activeSub) return "no_subscription";

  if (!dealerId) return "active";

  let maxVehicles: number = limits?.vehicles || 0;
  if (maxVehicles === 0 && activeSub.plan) {
    const plan = await prisma.plan.findFirst({
      where: { name: { contains: activeSub.plan, mode: "insensitive" } },
      select: { limits: true },
    });
    if (plan && (plan.limits as any)?.vehicles) {
      maxVehicles = (plan.limits as any).vehicles;
    }
  }

  if (maxVehicles > 0) {
    const currentCount = await prisma.vehicle.count({ where: { dealerId } });
    if (currentCount >= maxVehicles) return "quota_exhausted";
  }

  return "active";
}

// ─── GET / — list dealer's vehicles ──────────────────────────────────────────

router.get("/", async (c) => {
  const dealer = await getDealer(c.get("user")!.id);
  if (!dealer) return c.json({ error: "Dealer profile not found" }, 404);

  const qs = c.req.query();
  const page = Math.max(1, parseInt(qs.page ?? "1"));
  const limit = Math.min(100, Math.max(1, parseInt(qs.limit ?? "20")));
  const status = qs.status as VehicleStatus | undefined;
  const skip = (page - 1) * limit;

  const where = {
    dealerId: dealer.id,
    ...(status ? { status } : {}),
  };

  const [vehicles, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        make: true,
        model: true,
        version: true,
        vehicleType: true,
        bodyType: true,
        price: true,
        kilometer: true,
        registrationMonth: true,
        registrationYear: true,
        color: true,
        fuelType: true,
        status: true,
        images: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.vehicle.count({ where }),
  ]);

  return c.json({
    data: vehicles,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
});

// ─── POST / — create vehicle ──────────────────────────────────────────────────

router.post("/", async (c) => {
  const dealer = await getDealer(c.get("user")!.id);
  if (!dealer) return c.json({ error: "Dealer profile not found" }, 404);
  if (dealer.banned) return c.json({ error: "Account suspended" }, 403);

  const subStatus = await getSubscriptionStatus(c.req.raw.headers, dealer.id);
  if (subStatus === "no_subscription")
    return c.json({ error: "subscription_required" }, 403);
  if (subStatus === "quota_exhausted")
    return c.json({ error: "quota_exhausted" }, 403);

  let body: Record<string, any>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }

  // Required field check
  const required = [
    "vehicleType",
    "make",
    "bodyType",
    "color",
    "registrationMonth",
    "registrationYear",
    "kilometer",
    "price",
  ];
  const missing = required.filter((f) => body[f] == null);
  if (missing.length)
    return c.json(
      { error: `Missing required fields: ${missing.join(", ")}` },
      400,
    );

  const validation = vehicleApiBodySchema.safeParse(body);
  if (!validation.success) {
    return c.json({ error: validation.error.errors[0]?.message ?? "Validation failed" }, 400);
  }

  const status: VehicleStatus = VALID_STATUSES.has(body.status)
    ? (body.status as VehicleStatus)
    : "DRAFT";

  try {
    const vehicle = await prisma.vehicle.create({
      data: {
        dealerId: dealer.id,
        status,
        vehicleType: body.vehicleType as VehicleType,
        make: body.make,
        model: body.model ?? undefined,
        version: body.version ?? undefined,
        bodyType: body.bodyType as BodyType,
        fuelType: (body.fuelType as FuelType) ?? undefined,
        color: body.color as Color,
        interiorColor: (body.interiorColor as Color) ?? undefined,
        metallic: body.metallic ?? false,
        vehicleCondition:
          (body.vehicleCondition as VehicleCondition) ?? undefined,
        gearTransmission:
          (body.gearTransmission as GearTransmission) ?? undefined,
        transmissionType:
          (body.transmissionType as TransmissionType) ?? undefined,
        driveType: (body.driveType as DriveType) ?? undefined,
        registrationMonth: Number(body.registrationMonth),
        registrationYear: Number(body.registrationYear),
        kilometer: Number(body.kilometer),
        price: Number(body.price),
        newPrice: body.newPrice != null ? Number(body.newPrice) : undefined,
        seats: body.seats != null ? Number(body.seats) : undefined,
        doors: body.doors != null ? Number(body.doors) : undefined,
        lastInspectionDate: body.lastInspectionDate
          ? new Date(body.lastInspectionDate)
          : undefined,
        inspectionPassed: body.inspectionPassed ?? false,
        warranty: (body.warranty as Warranty) ?? undefined,
        warrantyStartDate: body.warrantyStartDate
          ? new Date(body.warrantyStartDate)
          : undefined,
        duration: body.duration != null ? Number(body.duration) : undefined,
        maxKm: body.maxKm != null ? Number(body.maxKm) : undefined,
        hp: body.hp != null ? Number(body.hp) : undefined,
        kw: body.kw != null ? Number(body.kw) : undefined,
        cubicCapacity:
          body.cubicCapacity != null ? Number(body.cubicCapacity) : undefined,
        cylinders: body.cylinders != null ? Number(body.cylinders) : undefined,
        numberOfGears:
          body.numberOfGears != null ? Number(body.numberOfGears) : undefined,
        emptyWeight:
          body.emptyWeight != null ? Number(body.emptyWeight) : undefined,
        loadCapacity:
          body.loadCapacity != null ? Number(body.loadCapacity) : undefined,
        wheelbase: body.wheelbase != null ? Number(body.wheelbase) : undefined,
        length: body.length != null ? Number(body.length) : undefined,
        width: body.width != null ? Number(body.width) : undefined,
        height: body.height != null ? Number(body.height) : undefined,
        towingCapacityBraked:
          body.towingCapacityBraked != null
            ? Number(body.towingCapacityBraked)
            : undefined,
        typeApproval: body.typeApproval ?? undefined,
        vin: body.vin ?? undefined,
        serialNumber: body.serialNumber ?? undefined,
        co2Emission:
          body.co2Emission != null ? Number(body.co2Emission) : undefined,
        consumptionCity:
          body.consumptionCity != null
            ? Number(body.consumptionCity)
            : undefined,
        consumptionCountry:
          body.consumptionCountry != null
            ? Number(body.consumptionCountry)
            : undefined,
        consumptionTotal:
          body.consumptionTotal != null
            ? Number(body.consumptionTotal)
            : undefined,
        emissionStandard:
          (body.emissionStandard as EmissionStandard) ?? undefined,
        energyLabel: (body.energyLabel as EnergyLabel) ?? undefined,
        range: body.range != null ? Number(body.range) : undefined,
        batteryCapacity:
          body.batteryCapacity != null
            ? Number(body.batteryCapacity)
            : undefined,
        powerConsumption:
          body.powerConsumption != null
            ? Number(body.powerConsumption)
            : undefined,
        chargingPower:
          body.chargingPower != null ? Number(body.chargingPower) : undefined,
        batteryOwnership:
          (body.batteryOwnership as BatteryOwnership) ?? undefined,
        chargingPlugTypeStandard:
          (body.chargingPlugTypeStandard as ChargingPlugTypeStandard) ??
          undefined,
        chargingPlugTypeFast:
          (body.chargingPlugTypeFast as ChargingPlugTypeFast) ?? undefined,
        combustionEnginePowerHp:
          body.combustionEnginePowerHp != null
            ? Number(body.combustionEnginePowerHp)
            : undefined,
        electricMotorPowerHp:
          body.electricMotorPowerHp != null
            ? Number(body.electricMotorPowerHp)
            : undefined,
        vehicleDescription: body.vehicleDescription ?? undefined,
        equipment: body.equipment ?? {},
        extras: body.extras ?? {},
        images: Array.isArray(body.images) ? body.images : [],
      },
    });

    return c.json(vehicle, 201);
  } catch (e: any) {
    if (e?.code === "P2002") return c.json({ error: "Duplicate entry" }, 409);
    if (e?.name === "PrismaClientValidationError")
      return c.json({ error: "Invalid field value", detail: e.message }, 400);
    throw e;
  }
});

// ─── GET /:id — get single vehicle ───────────────────────────────────────────

router.get("/:id", async (c) => {
  const dealer = await getDealer(c.get("user")!.id);
  if (!dealer) return c.json({ error: "Dealer profile not found" }, 404);

  const vehicle = await prisma.vehicle.findFirst({
    where: { id: c.req.param("id"), dealerId: dealer.id },
  });

  if (!vehicle) return c.json({ error: "Vehicle not found" }, 404);
  return c.json(vehicle);
});

// ─── PUT /:id — full update ───────────────────────────────────────────────────

router.put("/:id", async (c) => {
  const dealer = await getDealer(c.get("user")!.id);
  if (!dealer) return c.json({ error: "Dealer profile not found" }, 404);
  if (dealer.banned) return c.json({ error: "Account suspended" }, 403);

  if ((await getSubscriptionStatus(c.req.raw.headers)) === "no_subscription")
    return c.json({ error: "subscription_required" }, 403);

  const existing = await prisma.vehicle.findFirst({
    where: { id: c.req.param("id"), dealerId: dealer.id },
    select: { id: true },
  });
  if (!existing) return c.json({ error: "Vehicle not found" }, 404);

  let body: Record<string, any>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }

  const required = [
    "vehicleType",
    "make",
    "bodyType",
    "color",
    "registrationMonth",
    "registrationYear",
    "kilometer",
    "price",
  ];
  const missing = required.filter((f) => body[f] == null);
  if (missing.length)
    return c.json(
      { error: `Missing required fields: ${missing.join(", ")}` },
      400,
    );

  const validation = vehicleApiBodySchema.safeParse(body);
  if (!validation.success) {
    return c.json({ error: validation.error.errors[0]?.message ?? "Validation failed" }, 400);
  }

  try {
    const vehicle = await prisma.vehicle.update({
      where: { id: existing.id },
      data: {
        vehicleType: body.vehicleType as VehicleType,
        make: body.make,
        model: body.model ?? null,
        version: body.version ?? null,
        bodyType: body.bodyType as BodyType,
        fuelType: (body.fuelType as FuelType) ?? null,
        color: body.color as Color,
        interiorColor: (body.interiorColor as Color) ?? null,
        metallic: body.metallic ?? false,
        vehicleCondition: (body.vehicleCondition as VehicleCondition) ?? null,
        gearTransmission: (body.gearTransmission as GearTransmission) ?? null,
        transmissionType: (body.transmissionType as TransmissionType) ?? null,
        driveType: (body.driveType as DriveType) ?? null,
        registrationMonth: Number(body.registrationMonth),
        registrationYear: Number(body.registrationYear),
        kilometer: Number(body.kilometer),
        price: Number(body.price),
        newPrice: body.newPrice != null ? Number(body.newPrice) : null,
        seats: body.seats != null ? Number(body.seats) : null,
        doors: body.doors != null ? Number(body.doors) : null,
        lastInspectionDate: body.lastInspectionDate
          ? new Date(body.lastInspectionDate)
          : null,
        inspectionPassed: body.inspectionPassed ?? false,
        warranty: (body.warranty as Warranty) ?? null,
        warrantyStartDate: body.warrantyStartDate
          ? new Date(body.warrantyStartDate)
          : null,
        duration: body.duration != null ? Number(body.duration) : null,
        maxKm: body.maxKm != null ? Number(body.maxKm) : null,
        hp: body.hp != null ? Number(body.hp) : null,
        kw: body.kw != null ? Number(body.kw) : null,
        cubicCapacity:
          body.cubicCapacity != null ? Number(body.cubicCapacity) : null,
        cylinders: body.cylinders != null ? Number(body.cylinders) : null,
        numberOfGears:
          body.numberOfGears != null ? Number(body.numberOfGears) : null,
        emptyWeight: body.emptyWeight != null ? Number(body.emptyWeight) : null,
        loadCapacity:
          body.loadCapacity != null ? Number(body.loadCapacity) : null,
        wheelbase: body.wheelbase != null ? Number(body.wheelbase) : null,
        length: body.length != null ? Number(body.length) : null,
        width: body.width != null ? Number(body.width) : null,
        height: body.height != null ? Number(body.height) : null,
        towingCapacityBraked:
          body.towingCapacityBraked != null
            ? Number(body.towingCapacityBraked)
            : null,
        typeApproval: body.typeApproval ?? null,
        vin: body.vin ?? null,
        serialNumber: body.serialNumber ?? null,
        co2Emission: body.co2Emission != null ? Number(body.co2Emission) : null,
        consumptionCity:
          body.consumptionCity != null ? Number(body.consumptionCity) : null,
        consumptionCountry:
          body.consumptionCountry != null
            ? Number(body.consumptionCountry)
            : null,
        consumptionTotal:
          body.consumptionTotal != null ? Number(body.consumptionTotal) : null,
        emissionStandard: (body.emissionStandard as EmissionStandard) ?? null,
        energyLabel: (body.energyLabel as EnergyLabel) ?? null,
        range: body.range != null ? Number(body.range) : null,
        batteryCapacity:
          body.batteryCapacity != null ? Number(body.batteryCapacity) : null,
        powerConsumption:
          body.powerConsumption != null ? Number(body.powerConsumption) : null,
        chargingPower:
          body.chargingPower != null ? Number(body.chargingPower) : null,
        batteryOwnership: (body.batteryOwnership as BatteryOwnership) ?? null,
        chargingPlugTypeStandard:
          (body.chargingPlugTypeStandard as ChargingPlugTypeStandard) ?? null,
        chargingPlugTypeFast:
          (body.chargingPlugTypeFast as ChargingPlugTypeFast) ?? null,
        combustionEnginePowerHp:
          body.combustionEnginePowerHp != null
            ? Number(body.combustionEnginePowerHp)
            : null,
        electricMotorPowerHp:
          body.electricMotorPowerHp != null
            ? Number(body.electricMotorPowerHp)
            : null,
        vehicleDescription: body.vehicleDescription ?? null,
        equipment: body.equipment ?? {},
        extras: body.extras ?? {},
        images: Array.isArray(body.images) ? body.images : [],
      },
    });

    return c.json(vehicle);
  } catch (e: any) {
    if (e?.name === "PrismaClientValidationError")
      return c.json({ error: "Invalid field value", detail: e.message }, 400);
    throw e;
  }
});

// ─── PATCH /:id/status — change status ───────────────────────────────────────

router.patch("/:id/status", async (c) => {
  const dealer = await getDealer(c.get("user")!.id);
  if (!dealer) return c.json({ error: "Dealer profile not found" }, 404);
  if (dealer.banned) return c.json({ error: "Account suspended" }, 403);

  const existing = await prisma.vehicle.findFirst({
    where: { id: c.req.param("id"), dealerId: dealer.id },
    select: { id: true, status: true },
  });
  if (!existing) return c.json({ error: "Vehicle not found" }, 404);

  let body: { status?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }

  const nextStatus = body.status as VehicleStatus | undefined;
  if (!nextStatus || !VALID_STATUSES.has(nextStatus)) {
    return c.json(
      { error: `status must be one of: ${[...VALID_STATUSES].join(", ")}` },
      400,
    );
  }

  // Enforce state machine — BANNED vehicles are locked, all other transitions validated
  const allowedNext = ALLOWED_TRANSITIONS[existing.status as VehicleStatus];
  if (!allowedNext) {
    return c.json({ error: "Cannot change status of a banned vehicle" }, 403);
  }
  if (!allowedNext.includes(nextStatus)) {
    return c.json(
      { error: `Cannot transition from ${existing.status} to ${nextStatus}` },
      400,
    );
  }

  if (
    nextStatus !== "DRAFT" &&
    (await getSubscriptionStatus(c.req.raw.headers)) === "no_subscription"
  )
    return c.json({ error: "subscription_required" }, 403);

  const vehicle = await prisma.vehicle.update({
    where: { id: existing.id },
    data: { status: nextStatus },
    select: { id: true, status: true },
  });

  return c.json(vehicle);
});

// ─── DELETE /:id ──────────────────────────────────────────────────────────────

router.delete("/:id", async (c) => {
  const dealer = await getDealer(c.get("user")!.id);
  if (!dealer) return c.json({ error: "Dealer profile not found" }, 404);

  const existing = await prisma.vehicle.findFirst({
    where: { id: c.req.param("id"), dealerId: dealer.id },
    select: { id: true },
  });
  if (!existing) return c.json({ error: "Vehicle not found" }, 404);

  await prisma.vehicle.delete({ where: { id: existing.id } });
  return c.body(null, 204);
});

export default router;
