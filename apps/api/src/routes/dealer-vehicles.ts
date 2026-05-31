import { Hono } from "hono";
import { prisma } from "@repo/db";
import {
  VALID_MAKES_BY_TYPE,
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
const VALID_GEAR_TRANSMISSIONS = new Set(GearTransmissionEnum.map((v) => v.value));
const VALID_TRANSMISSION_TYPES = new Set(TransmissionTypeEnum.map((v) => v.value));
const VALID_DRIVE_TYPES = new Set(DriveTypeEnum.map((v) => v.value));
const VALID_COLORS = new Set(ColorEnum.map((v) => v.value));
const VALID_CONDITIONS = new Set(VehicleConditionEnum.map((v) => v.value));
const VALID_WARRANTIES = new Set(WarrantyEnum.map((v) => v.value));
const VALID_ENERGY_LABELS = new Set(EnergyLabelEnum.map((v) => v.value));
const VALID_BATTERY_OWNERSHIPS = new Set(BatteryOwnershipEnum.map((v) => v.value));
const VALID_CHARGING_AC = new Set(ChargingPlugTypeStandardEnum.map((v) => v.value));
const VALID_CHARGING_DC = new Set(ChargingPlugTypeFastEnum.map((v) => v.value));
const VALID_EMISSION_STANDARDS = new Set(EmissionStandardEnum.map((v) => v.value));
const VALID_STATUSES = new Set<string>(["DRAFT", "PUBLISHED", "PAUSED", "SOLD", "ARCHIVED"]);

const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/;

// ─── Body validation (mirrors DB CHECK constraints exactly) ───────────────────

function validateBody(body: Record<string, any>): string | null {
  const b = body;

  // ── Required enums ──────────────────────────────────────────────────────────
  if (!VALID_VEHICLE_TYPES.has(b.vehicleType))
    return `Invalid vehicleType: ${b.vehicleType}`;

  const validMakes = VALID_MAKES_BY_TYPE[b.vehicleType as string];
  if (!validMakes?.includes(b.make))
    return `Invalid make for vehicleType ${b.vehicleType}: ${b.make}`;

  if (!VALID_COLORS.has(b.color)) return `Invalid color: ${b.color}`;

  // ── Optional enums ──────────────────────────────────────────────────────────
  if (b.fuelType != null && !b.fuelType === false) {
    // validated per vehicle type by DB enum — check against full union here
  }
  if (b.gearTransmission && !VALID_GEAR_TRANSMISSIONS.has(b.gearTransmission))
    return `Invalid gearTransmission: ${b.gearTransmission}`;
  if (b.transmissionType && !VALID_TRANSMISSION_TYPES.has(b.transmissionType))
    return `Invalid transmissionType: ${b.transmissionType}`;
  if (b.driveType && !VALID_DRIVE_TYPES.has(b.driveType))
    return `Invalid driveType: ${b.driveType}`;
  if (b.interiorColor && !VALID_COLORS.has(b.interiorColor))
    return `Invalid interiorColor: ${b.interiorColor}`;
  if (b.vehicleCondition && !VALID_CONDITIONS.has(b.vehicleCondition))
    return `Invalid vehicleCondition: ${b.vehicleCondition}`;
  if (b.warranty && !VALID_WARRANTIES.has(b.warranty))
    return `Invalid warranty: ${b.warranty}`;
  if (b.energyLabel && !VALID_ENERGY_LABELS.has(b.energyLabel))
    return `Invalid energyLabel: ${b.energyLabel}`;
  if (b.batteryOwnership && !VALID_BATTERY_OWNERSHIPS.has(b.batteryOwnership))
    return `Invalid batteryOwnership: ${b.batteryOwnership}`;
  if (b.chargingPlugTypeStandard && !VALID_CHARGING_AC.has(b.chargingPlugTypeStandard))
    return `Invalid chargingPlugTypeStandard: ${b.chargingPlugTypeStandard}`;
  if (b.chargingPlugTypeFast && !VALID_CHARGING_DC.has(b.chargingPlugTypeFast))
    return `Invalid chargingPlugTypeFast: ${b.chargingPlugTypeFast}`;
  if (b.emissionStandard && !VALID_EMISSION_STANDARDS.has(b.emissionStandard))
    return `Invalid emissionStandard: ${b.emissionStandard}`;
  if (b.status && !VALID_STATUSES.has(b.status))
    return `Invalid status: ${b.status}`;

  // ── Equipment / extras keys ─────────────────────────────────────────────────
  if (b.equipment && typeof b.equipment === "object") {
    const invalid = Object.keys(b.equipment).filter(
      (k) => !(VALID_EQUIPMENT_KEYS as string[]).includes(k),
    );
    if (invalid.length) return `Invalid equipment keys: ${invalid.join(", ")}`;
  }
  if (b.extras && typeof b.extras === "object") {
    const validExtras = VALID_EXTRAS_KEYS_BY_TYPE[b.vehicleType as string] ?? [];
    const invalid = Object.keys(b.extras).filter((k) => !validExtras.includes(k));
    if (invalid.length) return `Invalid extras keys: ${invalid.join(", ")}`;
  }

  // ── String lengths ──────────────────────────────────────────────────────────
  if (typeof b.make === "string" && (b.make.length < 1 || b.make.length > 50))
    return "make must be 1–50 characters";
  if (b.model != null && (b.model.length < 1 || b.model.length > 50))
    return "model must be 1–50 characters";
  if (b.version != null && (b.version.length < 1 || b.version.length > 50))
    return "version must be 1–50 characters";
  if (b.serialNumber != null && (b.serialNumber.length < 1 || b.serialNumber.length > 100))
    return "serialNumber must be 1–100 characters";
  if (b.typeApproval != null && (b.typeApproval.length < 1 || b.typeApproval.length > 50))
    return "typeApproval must be 1–50 characters";
  if (b.vin != null && !VIN_REGEX.test(b.vin))
    return "vin must be exactly 17 alphanumeric characters (no I, O, Q)";

  // ── Int ranges (mirror DB CHECK constraints) ────────────────────────────────
  const inRange = (v: unknown, min: number, max: number) =>
    v == null || (Number.isFinite(Number(v)) && Number(v) >= min && Number(v) <= max);

  if (!inRange(b.registrationMonth, 1, 12)) return "registrationMonth must be 1–12";
  if (!inRange(b.registrationYear, 1900, new Date().getFullYear()))
    return `registrationYear must be 1900–${new Date().getFullYear()}`;
  if (Number(b.kilometer) < 0) return "kilometer must be >= 0";
  if (Number(b.price) < 0) return "price must be >= 0";
  if (b.newPrice != null && Number(b.newPrice) < 0) return "newPrice must be >= 0";
  if (!inRange(b.hp, 1, 4000)) return "hp must be 1–4000";
  if (!inRange(b.kw, 1, 3000)) return "kw must be 1–3000";
  if (!inRange(b.combustionEnginePowerHp, 1, 2500)) return "combustionEnginePowerHp must be 1–2500";
  if (!inRange(b.electricMotorPowerHp, 1, 4000)) return "electricMotorPowerHp must be 1–4000";
  if (!inRange(b.seats, 1, 150)) return "seats must be 1–150";
  if (!inRange(b.doors, 1, 20)) return "doors must be 1–20";
  if (!inRange(b.cylinders, 1, 16)) return "cylinders must be 1–16";
  if (!inRange(b.numberOfGears, 1, 10)) return "numberOfGears must be 1–10";
  if (!inRange(b.cubicCapacity, 1, 30000)) return "cubicCapacity must be 1–30000";
  if (!inRange(b.length, 1, 30000)) return "length must be 1–30000";
  if (!inRange(b.width, 1, 5000)) return "width must be 1–5000";
  if (!inRange(b.height, 1, 6000)) return "height must be 1–6000";
  if (!inRange(b.wheelbase, 1, 15000)) return "wheelbase must be 1–15000";
  if (!inRange(b.emptyWeight, 1, 100000)) return "emptyWeight must be 1–100000";
  if (!inRange(b.loadCapacity, 0, 100000)) return "loadCapacity must be 0–100000";
  if (!inRange(b.towingCapacityBraked, 0, 100000)) return "towingCapacityBraked must be 0–100000";
  if (!inRange(b.co2Emission, 0, 1000)) return "co2Emission must be 0–1000";
  if (!inRange(b.consumptionCity, 0, 100)) return "consumptionCity must be 0–100";
  if (!inRange(b.consumptionCountry, 0, 100)) return "consumptionCountry must be 0–100";
  if (!inRange(b.consumptionTotal, 0, 100)) return "consumptionTotal must be 0–100";
  if (!inRange(b.range, 1, 1500)) return "range must be 1–1500";
  if (!inRange(b.batteryCapacity, 0, 500)) return "batteryCapacity must be 0–500";
  if (!inRange(b.powerConsumption, 0, 100)) return "powerConsumption must be 0–100";
  if (!inRange(b.chargingPower, 0, 1000)) return "chargingPower must be 0–1000";
  if (!inRange(b.batteryRentalMonth, 1, 120)) return "batteryRentalMonth must be 1–120";
  if (!inRange(b.duration, 1, 120)) return "duration must be 1–120";
  if (!inRange(b.maxKm, 0, 500000)) return "maxKm must be 0–500000";

  return null;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

async function getDealer(userId: string) {
  return prisma.dealer.findUnique({ where: { userId } });
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

  let body: Record<string, any>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }

  // Required field check
  const required = ["vehicleType", "make", "bodyType", "color", "registrationMonth", "registrationYear", "kilometer", "price"];
  const missing = required.filter((f) => body[f] == null);
  if (missing.length)
    return c.json({ error: `Missing required fields: ${missing.join(", ")}` }, 400);

  const validationError = validateBody(body);
  if (validationError) return c.json({ error: validationError }, 400);

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

  const required = ["vehicleType", "make", "bodyType", "color", "registrationMonth", "registrationYear", "kilometer", "price"];
  const missing = required.filter((f) => body[f] == null);
  if (missing.length)
    return c.json({ error: `Missing required fields: ${missing.join(", ")}` }, 400);

  const validationError = validateBody(body);
  if (validationError) return c.json({ error: validationError }, 400);

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

  const existing = await prisma.vehicle.findFirst({
    where: { id: c.req.param("id"), dealerId: dealer.id },
    select: { id: true },
  });
  if (!existing) return c.json({ error: "Vehicle not found" }, 404);

  let body: { status?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }

  const allowed: VehicleStatus[] = [
    "DRAFT",
    "PUBLISHED",
    "PAUSED",
    "SOLD",
    "ARCHIVED",
  ];
  if (!body.status || !allowed.includes(body.status as VehicleStatus)) {
    return c.json(
      { error: `status must be one of: ${allowed.join(", ")}` },
      400,
    );
  }

  const vehicle = await prisma.vehicle.update({
    where: { id: existing.id },
    data: { status: body.status as VehicleStatus },
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
