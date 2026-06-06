import type {
  Prisma,
  BodyType,
  FuelType,
  TransmissionType,
  DriveType,
  Color,
  VehicleCondition,
  VehicleType,
  EnergyLabel,
  EmissionStandard,
  BatteryOwnership,
  ChargingPlugTypeStandard,
  ChargingPlugTypeFast,
} from "@repo/db";

export interface VehicleParams {
  search?: string;
  make?: string[];
  model?: string[];
  excludeMake?: string[];
  excludeModel?: string[];
  priceFrom?: number;
  priceTo?: number;
  registrationFrom?: number;
  registrationTo?: number;
  kilometerFrom?: number;
  kilometerTo?: number;
  powerFrom?: number;
  powerTo?: number;
  kwFrom?: number;
  kwTo?: number;
  evs?: string;
  fuel?: string[];
  transmission?: string[];
  condition?: string[];
  vehicleType?: string[];
  bodyType?: string[];
  color?: string[];
  metallic?: boolean;
  driveType?: string[];
  cubicCapacityFrom?: number;
  cubicCapacityTo?: number;
  cylindersFrom?: number;
  cylindersTo?: number;
  consumptionFrom?: number;
  consumptionTo?: number;
  co2From?: number;
  co2To?: number;
  energyLabels?: string[];
  emissionStandards?: string[];
  inspectionPassed?: boolean;
  hasWarranty?: boolean;
  dealerId?: string;
  interiorColor?: string[];
  daysListed?: number;
  equipment?: string[];
  rangeFrom?: number;
  rangeTo?: number;
  batteryOwnership?: string[];
  chargingPlugTypeStandard?: string[];
  chargingPlugTypeFast?: string[];
  doorsFrom?: number;
  doorsTo?: number;
  seatsFrom?: number;
  seatsTo?: number;
}

export function toDbEnum(value: string): string {
  return value.toUpperCase().replace(/-/g, "_");
}

export function buildWhereClause(
  params: VehicleParams,
  omitFilters: Partial<Record<keyof VehicleParams, boolean>> = {},
): Prisma.VehicleWhereInput {
  const where: Prisma.VehicleWhereInput = {};

  if (!omitFilters.search && params.search) {
    where.OR = [
      { make: { contains: params.search, mode: "insensitive" } },
      { model: { contains: params.search, mode: "insensitive" } },
      { version: { contains: params.search, mode: "insensitive" } },
    ];
  }

  if (!omitFilters.make && params.make && Array.isArray(params.make) && params.make.length > 0) {
    const makeOr = params.make.filter((m) => m && m !== "any").map((m) => ({ make: { equals: m, mode: "insensitive" as const } }));
    if (makeOr.length > 0) where.AND = [...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []), { OR: makeOr }];
  }

  if (!omitFilters.model && params.model && Array.isArray(params.model) && params.model.length > 0) {
    const modelOr = params.model.filter((m) => m && m !== "any").map((m) => ({ model: { equals: m, mode: "insensitive" as const } }));
    if (modelOr.length > 0) where.AND = [...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []), { OR: modelOr }];
  }

  if (params.excludeMake && Array.isArray(params.excludeMake) && params.excludeMake.length > 0) {
    where.NOT = [...(Array.isArray(where.NOT) ? where.NOT : where.NOT ? [where.NOT] : []), { make: { in: params.excludeMake, mode: "insensitive" as const } }];
  }

  if (params.excludeModel && Array.isArray(params.excludeModel) && params.excludeModel.length > 0) {
    where.NOT = [...(Array.isArray(where.NOT) ? where.NOT : where.NOT ? [where.NOT] : []), { model: { in: params.excludeModel, mode: "insensitive" as const } }];
  }

  if (!omitFilters.priceFrom && (params.priceFrom !== undefined || params.priceTo !== undefined)) {
    where.price = { ...(params.priceFrom && { gte: params.priceFrom }), ...(params.priceTo && { lte: params.priceTo }) };
  }

  if (!omitFilters.registrationFrom && (params.registrationFrom !== undefined || params.registrationTo !== undefined)) {
    where.registrationYear = { ...(params.registrationFrom && { gte: params.registrationFrom }), ...(params.registrationTo && { lte: params.registrationTo }) };
  }

  if (!omitFilters.kilometerFrom && (params.kilometerFrom !== undefined || params.kilometerTo !== undefined)) {
    where.kilometer = { ...(params.kilometerFrom && { gte: params.kilometerFrom }), ...(params.kilometerTo && { lte: params.kilometerTo }) };
  }

  if (params.powerFrom !== undefined || params.powerTo !== undefined) {
    where.hp = { ...(params.powerFrom && { gte: params.powerFrom }), ...(params.powerTo && { lte: params.powerTo }) };
  }

  if (params.kwFrom !== undefined || params.kwTo !== undefined) {
    where.kw = { ...(params.kwFrom ? { gte: params.kwFrom } : {}), ...(params.kwTo ? { lte: params.kwTo } : {}) };
  }

  if (!omitFilters.evs && params.evs) {
    if (params.evs === "only_ev") where.fuelType = "ELECTRIC";
    else if (params.evs === "no_ev") where.fuelType = { not: "ELECTRIC" };
  }

  if (!omitFilters.fuel && params.fuel && params.fuel.length > 0) {
    where.fuelType = { in: params.fuel.map(toDbEnum) as FuelType[] };
  }

  if (!omitFilters.transmission && params.transmission && params.transmission.length > 0) {
    where.transmissionType = { in: params.transmission.map(toDbEnum) as TransmissionType[] };
  }

  if (!omitFilters.condition && params.condition && params.condition.length > 0) {
    where.vehicleCondition = { in: params.condition.map(toDbEnum) as VehicleCondition[] };
  }

  if (!omitFilters.vehicleType && params.vehicleType && params.vehicleType.length > 0) {
    where.vehicleType = { in: params.vehicleType.map(toDbEnum) as VehicleType[] };
  }

  if (!omitFilters.bodyType && params.bodyType && params.bodyType.length > 0) {
    where.bodyType = { in: params.bodyType.map(toDbEnum) as BodyType[] };
  }

  if (!omitFilters.color && params.color && params.color.length > 0) {
    where.color = { in: params.color.map(toDbEnum) as Color[] };
  }

  if (!omitFilters.metallic && params.metallic !== undefined) where.metallic = params.metallic;

  if (!omitFilters.driveType && params.driveType && params.driveType.length > 0) {
    where.driveType = { in: params.driveType.map(toDbEnum) as DriveType[] };
  }

  if (params.cubicCapacityFrom !== undefined || params.cubicCapacityTo !== undefined) {
    where.cubicCapacity = { ...(params.cubicCapacityFrom ? { gte: params.cubicCapacityFrom } : {}), ...(params.cubicCapacityTo ? { lte: params.cubicCapacityTo } : {}) };
  }

  if (params.cylindersFrom !== undefined || params.cylindersTo !== undefined) {
    where.cylinders = { ...(params.cylindersFrom ? { gte: params.cylindersFrom } : {}), ...(params.cylindersTo ? { lte: params.cylindersTo } : {}) };
  }

  if (params.consumptionFrom !== undefined || params.consumptionTo !== undefined) {
    where.consumptionTotal = { ...(params.consumptionFrom ? { gte: params.consumptionFrom } : {}), ...(params.consumptionTo ? { lte: params.consumptionTo } : {}) };
  }

  if (params.co2From !== undefined || params.co2To !== undefined) {
    where.co2Emission = { ...(params.co2From ? { gte: params.co2From } : {}), ...(params.co2To ? { lte: params.co2To } : {}) };
  }

  if (!omitFilters.energyLabels && params.energyLabels && params.energyLabels.length > 0) {
    where.energyLabel = { in: params.energyLabels.map(toDbEnum) as EnergyLabel[] };
  }

  if (!omitFilters.emissionStandards && params.emissionStandards && params.emissionStandards.length > 0) {
    where.emissionStandard = { in: params.emissionStandards.map(toDbEnum) as EmissionStandard[] };
  }

  if (!omitFilters.inspectionPassed && params.inspectionPassed === true) where.inspectionPassed = true;
  if (!omitFilters.hasWarranty && params.hasWarranty === true) where.warranty = { not: null };
  if (!omitFilters.dealerId && params.dealerId) where.dealerId = params.dealerId;

  if (!omitFilters.interiorColor && params.interiorColor && params.interiorColor.length > 0) {
    where.interiorColor = { in: params.interiorColor.map(toDbEnum) as Color[] };
  }

  if (!omitFilters.daysListed && params.daysListed != null) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - params.daysListed);
    where.createdAt = { gte: cutoff };
  }

  if (!omitFilters.equipment && params.equipment && params.equipment.length > 0) {
    const equipmentClauses = params.equipment.map((item) => ({ equipment: { path: [item], equals: true } }));
    where.AND = [...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []), ...equipmentClauses];
  }

  if (params.rangeFrom !== undefined || params.rangeTo !== undefined) {
    where.range = { ...(params.rangeFrom ? { gte: params.rangeFrom } : {}), ...(params.rangeTo ? { lte: params.rangeTo } : {}) };
  }

  if (!omitFilters.batteryOwnership && params.batteryOwnership && params.batteryOwnership.length > 0) {
    where.batteryOwnership = { in: params.batteryOwnership.map(toDbEnum) as BatteryOwnership[] };
  }

  if (!omitFilters.chargingPlugTypeStandard && params.chargingPlugTypeStandard && params.chargingPlugTypeStandard.length > 0) {
    where.chargingPlugTypeStandard = { in: params.chargingPlugTypeStandard.map(toDbEnum) as ChargingPlugTypeStandard[] };
  }

  if (!omitFilters.chargingPlugTypeFast && params.chargingPlugTypeFast && params.chargingPlugTypeFast.length > 0) {
    where.chargingPlugTypeFast = { in: params.chargingPlugTypeFast.map(toDbEnum) as ChargingPlugTypeFast[] };
  }

  if (params.doorsFrom !== undefined || params.doorsTo !== undefined) {
    where.doors = { ...(params.doorsFrom ? { gte: params.doorsFrom } : {}), ...(params.doorsTo ? { lte: params.doorsTo } : {}) };
  }

  if (params.seatsFrom !== undefined || params.seatsTo !== undefined) {
    where.seats = { ...(params.seatsFrom ? { gte: params.seatsFrom } : {}), ...(params.seatsTo ? { lte: params.seatsTo } : {}) };
  }

  where.status = "PUBLISHED";
  where.dealer = { user: { banned: { not: true } } };
  return where;
}
