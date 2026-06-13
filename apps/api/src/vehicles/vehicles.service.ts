import { Injectable, NotFoundException } from "@nestjs/common";
import { prisma } from "@repo/db";

export class VehiclesQueryDto {
  page?: string;
  pageSize?: string;
  make?: string;
  model?: string;
  bodyType?: string;
  fuelType?: string;
  transmissionType?: string;
  vehicleCondition?: string;
  vehicleType?: string;
  color?: string;
  driveType?: string;
  priceMin?: string;
  priceMax?: string;
  kmMin?: string;
  kmMax?: string;
  yearMin?: string;
  yearMax?: string;
  hpMin?: string;
  hpMax?: string;
  sort?: string;
}

const VEHICLE_LIST_SELECT = {
  id: true,
  make: true,
  model: true,
  version: true,
  price: true,
  kilometer: true,
  registrationMonth: true,
  registrationYear: true,
  kw: true,
  hp: true,
  fuelType: true,
  vehicleCondition: true,
  bodyType: true,
  color: true,
  createdAt: true,
  images: true,
  dealer: {
    select: {
      id: true,
      companyName: true,
      city: true,
      zipCode: true,
      phoneNumber: true,
      googleRating: true,
      googleReviewCount: true,
    },
  },
} as const;

const VEHICLE_DETAIL_SELECT = {
  id: true,
  make: true,
  model: true,
  version: true,
  price: true,
  kilometer: true,
  registrationMonth: true,
  registrationYear: true,
  kw: true,
  hp: true,
  fuelType: true,
  vehicleCondition: true,
  bodyType: true,
  vehicleType: true,
  color: true,
  interiorColor: true,
  transmissionType: true,
  driveType: true,
  vehicleDescription: true,
  images: true,
  equipment: true,
  energyLabel: true,
  emissionStandard: true,
  metallic: true,
  inspectionPassed: true,
  warranty: true,
  cubicCapacity: true,
  cylinders: true,
  consumptionTotal: true,
  co2Emission: true,
  range: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  dealerId: true,
  sellerId: true,
  newPrice: true,
  doors: true,
  seats: true,
  gearTransmission: true,
  typeApproval: true,
  wheelbase: true,
  vin: true,
  emptyWeight: true,
  loadCapacity: true,
  serialNumber: true,
  height: true,
  width: true,
  length: true,
  towingCapacityBraked: true,
  numberOfGears: true,
  consumptionCity: true,
  consumptionCountry: true,
  batteryCapacity: true,
  batteryRentalMonth: true,
  powerConsumption: true,
  batteryOwnership: true,
  chargingPlugTypeStandard: true,
  chargingPlugTypeFast: true,
  chargingPower: true,
  combustionEnginePowerHp: true,
  electricMotorPowerHp: true,
  extras: true,
  lastInspectionDate: true,
  warrantyStartDate: true,
  duration: true,
  maxKm: true,
  dealer: {
    select: {
      id: true,
      companyName: true,
      city: true,
      zipCode: true,
      phoneNumber: true,
      businessEmail: true,
      website: true,
      logo: true,
      googleRating: true,
      googleReviewCount: true,
      openingHours: {
        select: {
          id: true,
          day: true,
          isOpen: true,
          openTime: true,
          closeTime: true,
        },
        orderBy: { day: "asc" as const },
      },
    },
  },
} as const;

type SortOrder = "asc" | "desc";
type VehicleOrderBy =
  | { price: SortOrder }
  | { kilometer: SortOrder }
  | { createdAt: SortOrder }
  | { registrationYear: SortOrder; registrationMonth?: SortOrder }
  | Array<{ registrationYear: SortOrder } | { registrationMonth: SortOrder }>;

function buildSortOrder(sort: string | undefined): VehicleOrderBy {
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
      return [{ registrationYear: "asc" }, { registrationMonth: "asc" }];
    case "registration-desc":
      return [{ registrationYear: "desc" }, { registrationMonth: "desc" }];
    case "created-asc":
      return { createdAt: "asc" };
    case "created-desc":
    default:
      return { createdAt: "desc" };
  }
}

const ACTIVE_OWNER_FILTER = {
  OR: [
    {
      dealerId: { not: null },
      dealer: {
        user: {
          OR: [{ banned: null }, { banned: false }, { banExpires: { lte: new Date() } }],
        },
      },
    },
    {
      sellerId: { not: null },
      seller: {
        user: {
          OR: [{ banned: null }, { banned: false }, { banExpires: { lte: new Date() } }],
        },
      },
    },
  ],
} as const;

function buildWhereClause(query: VehiclesQueryDto): Parameters<typeof prisma.vehicle.findMany>[0]["where"] {
  const where: Parameters<typeof prisma.vehicle.findMany>[0]["where"] = {
    status: "PUBLISHED",
    AND: [ACTIVE_OWNER_FILTER],
  };

  if (query.make) where!.make = { equals: query.make, mode: "insensitive" };
  if (query.model) where!.model = { equals: query.model, mode: "insensitive" };
  if (query.bodyType) where!.bodyType = query.bodyType as never;
  if (query.fuelType) where!.fuelType = query.fuelType as never;
  if (query.transmissionType) where!.transmissionType = query.transmissionType as never;
  if (query.vehicleCondition) where!.vehicleCondition = query.vehicleCondition as never;
  if (query.vehicleType) where!.vehicleType = query.vehicleType as never;
  if (query.color) where!.color = query.color as never;
  if (query.driveType) where!.driveType = query.driveType as never;

  if (query.priceMin || query.priceMax) {
    where!.price = {};
    if (query.priceMin) (where!.price as { gte?: number }).gte = parseInt(query.priceMin, 10);
    if (query.priceMax) (where!.price as { lte?: number }).lte = parseInt(query.priceMax, 10);
  }

  if (query.kmMin || query.kmMax) {
    where!.kilometer = {};
    if (query.kmMin) (where!.kilometer as { gte?: number }).gte = parseInt(query.kmMin, 10);
    if (query.kmMax) (where!.kilometer as { lte?: number }).lte = parseInt(query.kmMax, 10);
  }

  if (query.yearMin || query.yearMax) {
    where!.registrationYear = {};
    if (query.yearMin) (where!.registrationYear as { gte?: number }).gte = parseInt(query.yearMin, 10);
    if (query.yearMax) (where!.registrationYear as { lte?: number }).lte = parseInt(query.yearMax, 10);
  }

  if (query.hpMin || query.hpMax) {
    where!.hp = {};
    if (query.hpMin) (where!.hp as { gte?: number }).gte = parseInt(query.hpMin, 10);
    if (query.hpMax) (where!.hp as { lte?: number }).lte = parseInt(query.hpMax, 10);
  }

  return where;
}

@Injectable()
export class VehiclesService {
  async findMany(query: VehiclesQueryDto) {
    const page = Math.max(1, parseInt(query.page ?? "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize ?? "24", 10)));
    const skip = (page - 1) * pageSize;

    const where = buildWhereClause(query);
    const orderBy = buildSortOrder(query.sort);

    const [vehicles, total, facets] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        select: VEHICLE_LIST_SELECT,
        orderBy: orderBy as never,
        skip,
        take: pageSize,
      }),
      prisma.vehicle.count({ where }),
      this.computeFacets(where),
    ]);

    return {
      data: vehicles,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      facets,
    };
  }

  async findFeatured() {
    const vehicles = await prisma.vehicle.findMany({
      where: { status: "PUBLISHED", AND: [ACTIVE_OWNER_FILTER] },
      select: VEHICLE_LIST_SELECT,
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    return { data: vehicles };
  }

  async findSimilar(id: string) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      select: { make: true, bodyType: true, fuelType: true, price: true, vehicleType: true },
    });

    if (!vehicle) return { data: [] };

    const priceFilter = vehicle.price
      ? { gte: Math.round(vehicle.price * 0.5), lte: Math.round(vehicle.price * 1.5) }
      : undefined;

    const vehicles = await prisma.vehicle.findMany({
      where: {
        id: { not: id },
        status: "PUBLISHED",
        AND: [ACTIVE_OWNER_FILTER],
        vehicleType: vehicle.vehicleType,
        OR: [
          { make: vehicle.make },
          { bodyType: vehicle.bodyType },
          ...(vehicle.fuelType ? [{ fuelType: vehicle.fuelType }] : []),
        ],
        ...(priceFilter ? { price: priceFilter } : {}),
      },
      select: VEHICLE_LIST_SELECT,
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    return { data: vehicles };
  }

  async findOne(id: string) {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id, status: "PUBLISHED", AND: [ACTIVE_OWNER_FILTER] },
      select: VEHICLE_DETAIL_SELECT,
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with id "${id}" not found`);
    }

    return { data: vehicle };
  }

  private async computeFacets(where: Parameters<typeof prisma.vehicle.findMany>[0]["where"]) {
    const [
      makeGroups,
      fuelTypeGroups,
      transmissionTypeGroups,
      vehicleConditionGroups,
      vehicleTypeGroups,
      bodyTypeGroups,
      colorGroups,
      interiorColorGroups,
      driveTypeGroups,
      energyLabelGroups,
      emissionStandardGroups,
      aggregates,
      metallicCount,
      inspectionPassedCount,
      hasWarrantyCount,
    ] = await Promise.all([
      prisma.vehicle.groupBy({ by: ["make"], where, _count: true, orderBy: { _count: { make: "desc" } } }),
      prisma.vehicle.groupBy({ by: ["fuelType"], where, _count: true, orderBy: { _count: { fuelType: "desc" } } }),
      prisma.vehicle.groupBy({ by: ["transmissionType"], where, _count: true, orderBy: { _count: { transmissionType: "desc" } } }),
      prisma.vehicle.groupBy({ by: ["vehicleCondition"], where, _count: true, orderBy: { _count: { vehicleCondition: "desc" } } }),
      prisma.vehicle.groupBy({ by: ["vehicleType"], where, _count: true, orderBy: { _count: { vehicleType: "desc" } } }),
      prisma.vehicle.groupBy({ by: ["bodyType"], where, _count: true, orderBy: { _count: { bodyType: "desc" } } }),
      prisma.vehicle.groupBy({ by: ["color"], where, _count: true, orderBy: { _count: { color: "desc" } } }),
      prisma.vehicle.groupBy({ by: ["interiorColor"], where, _count: true, orderBy: { _count: { interiorColor: "desc" } } }),
      prisma.vehicle.groupBy({ by: ["driveType"], where, _count: true, orderBy: { _count: { driveType: "desc" } } }),
      prisma.vehicle.groupBy({ by: ["energyLabel"], where, _count: true, orderBy: { _count: { energyLabel: "desc" } } }),
      prisma.vehicle.groupBy({ by: ["emissionStandard"], where, _count: true, orderBy: { _count: { emissionStandard: "desc" } } }),
      prisma.vehicle.aggregate({
        where,
        _max: {
          price: true,
          kilometer: true,
          hp: true,
          kw: true,
          registrationYear: true,
          consumptionTotal: true,
          co2Emission: true,
          cubicCapacity: true,
          cylinders: true,
        },
        _min: {
          registrationYear: true,
        },
      }),
      prisma.vehicle.count({ where: { ...where, metallic: true } }),
      prisma.vehicle.count({ where: { ...where, inspectionPassed: true } }),
      prisma.vehicle.count({ where: { ...where, warranty: { not: null } } }),
    ]);

    return {
      make: toFacetArray(makeGroups, "make"),
      fuelType: toFacetArray(fuelTypeGroups, "fuelType"),
      transmissionType: toFacetArray(transmissionTypeGroups, "transmissionType"),
      vehicleCondition: toFacetArray(vehicleConditionGroups, "vehicleCondition"),
      vehicleType: toFacetArray(vehicleTypeGroups, "vehicleType"),
      bodyType: toFacetArray(bodyTypeGroups, "bodyType"),
      color: toFacetArray(colorGroups, "color"),
      interiorColor: toFacetArray(interiorColorGroups, "interiorColor"),
      driveType: toFacetArray(driveTypeGroups, "driveType"),
      energyLabel: toFacetArray(energyLabelGroups, "energyLabel"),
      emissionStandard: toFacetArray(emissionStandardGroups, "emissionStandard"),
      priceMax: aggregates._max.price,
      kilometerMax: aggregates._max.kilometer,
      hpMax: aggregates._max.hp,
      kwMax: aggregates._max.kw,
      yearMin: aggregates._min.registrationYear,
      yearMax: aggregates._max.registrationYear,
      consumptionMax: aggregates._max.consumptionTotal,
      co2Max: aggregates._max.co2Emission,
      cubicCapacityMax: aggregates._max.cubicCapacity,
      cylindersMax: aggregates._max.cylinders,
      metallic: metallicCount,
      inspectionPassed: inspectionPassedCount,
      hasWarranty: hasWarrantyCount,
    };
  }
}

function toFacetArray(
  groups: Array<Record<string, unknown> & { _count: number }>,
  field: string,
): { value: unknown; count: number }[] {
  return groups
    .filter((g) => g[field] !== null && g[field] !== undefined)
    .map((g) => ({ value: g[field], count: g._count }));
}
