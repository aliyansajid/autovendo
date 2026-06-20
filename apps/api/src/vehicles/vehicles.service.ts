import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { Prisma } from "../generated/prisma/client";

export class VehiclesQueryDto {
  page?: string;
  pageSize?: string;
  sort?: string;
  q?: string;
  dealerId?: string;

  // Single-value filters
  vehicleType?: string | string[];
  metallic?: string;
  inspectionPassed?: string;
  hasWarranty?: string;
  model?: string;
  daysListed?: string;

  // Array filters (repeated params or comma-separated)
  make?: string | string[];
  excludeMake?: string | string[];
  fuel?: string | string[];
  condition?: string | string[];
  bodyType?: string | string[];
  transmission?: string | string[];
  color?: string | string[];
  interiorColor?: string | string[];
  driveType?: string | string[];
  sellerType?: string | string[];
  energyLabels?: string | string[];
  emissionStandards?: string | string[];
  batteryOwnership?: string | string[];
  chargingPlugTypeStandard?: string | string[];
  chargingPlugTypeFast?: string | string[];
  equipment?: string | string[];
  extras?: string | string[];

  // Range filters
  priceFrom?: string;
  priceTo?: string;
  kilometerFrom?: string;
  kilometerTo?: string;
  registrationFrom?: string;
  registrationTo?: string;
  powerFrom?: string;
  powerTo?: string;
  kwFrom?: string;
  kwTo?: string;
  cubicCapacityFrom?: string;
  cubicCapacityTo?: string;
  cylindersFrom?: string;
  cylindersTo?: string;
  consumptionFrom?: string;
  consumptionTo?: string;
  co2From?: string;
  co2To?: string;
  rangeFrom?: string;
  rangeTo?: string;
  doorsFrom?: string;
  doorsTo?: string;
  seatsFrom?: string;
  seatsTo?: string;
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
  seller: {
    select: {
      id: true,
      city: true,
      zipCode: true,
      phoneNumber: true,
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
      streetAddress: true,
      city: true,
      zipCode: true,
      phoneNumber: true,
      businessEmail: true,
      website: true,
      logo: true,
      googleRating: true,
      googleReviewCount: true,
      user: { select: { emailVerified: true } },
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
  seller: {
    select: {
      id: true,
      city: true,
      zipCode: true,
      phoneNumber: true,
    },
  },
} as const;

type SortOrder = "asc" | "desc";
type VehicleOrderBy =
  | { price: SortOrder }
  | { kilometer: SortOrder }
  | { createdAt: SortOrder }
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
    case "relevance":
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
};

// Normalizes a query param that may be a comma-joined string, repeated params, or undefined.
function parseArray(val: string | string[] | undefined): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.flatMap((v) => v.split(",").filter(Boolean));
  return val.split(",").filter(Boolean);
}

function parseInt10(val: string | undefined): number | undefined {
  if (!val) return undefined;
  const n = parseInt(val, 10);
  return isNaN(n) ? undefined : n;
}

function parseFloat10(val: string | undefined): number | undefined {
  if (!val) return undefined;
  const n = parseFloat(val);
  return isNaN(n) ? undefined : n;
}

type WhereClause = Prisma.VehicleFindManyArgs["where"];

function buildWhereClause(query: VehiclesQueryDto): WhereClause {
  const and: NonNullable<WhereClause>[] = [ACTIVE_OWNER_FILTER];

  // ── Dealer-scoped page ──────────────────────────────────────────────────────
  if (query.dealerId) {
    and.push({ dealerId: query.dealerId });
  }

  // ── Full-text search ────────────────────────────────────────────────────────
  if (query.q) {
    and.push({
      OR: [
        { make: { contains: query.q, mode: "insensitive" } },
        { model: { contains: query.q, mode: "insensitive" } },
        { version: { contains: query.q, mode: "insensitive" } },
        { vehicleDescription: { contains: query.q, mode: "insensitive" } },
      ],
    });
  }

  // ── Vehicle type ────────────────────────────────────────────────────────────
  const vehicleTypes = parseArray(query.vehicleType);
  if (vehicleTypes.length === 1) {
    and.push({ vehicleType: vehicleTypes[0] as never });
  } else if (vehicleTypes.length > 1) {
    and.push({ vehicleType: { in: vehicleTypes as never[] } });
  }

  // ── Make / exclude make ─────────────────────────────────────────────────────
  const makes = parseArray(query.make);
  if (makes.length > 0) {
    and.push({ make: { in: makes, mode: "insensitive" } });
  }

  const excludeMakes = parseArray(query.excludeMake);
  if (excludeMakes.length > 0 && makes.length === 0) {
    and.push({ make: { notIn: excludeMakes, mode: "insensitive" } });
  }

  if (query.model) {
    and.push({ model: { equals: query.model, mode: "insensitive" } });
  }

  // ── Body type ───────────────────────────────────────────────────────────────
  const bodyTypes = parseArray(query.bodyType);
  if (bodyTypes.length === 1) {
    and.push({ bodyType: bodyTypes[0] as never });
  } else if (bodyTypes.length > 1) {
    and.push({ bodyType: { in: bodyTypes as never[] } });
  }

  // ── Fuel type ───────────────────────────────────────────────────────────────
  const fuels = parseArray(query.fuel);
  if (fuels.length === 1) {
    and.push({ fuelType: fuels[0] as never });
  } else if (fuels.length > 1) {
    and.push({ fuelType: { in: fuels as never[] } });
  }

  // ── Transmission ────────────────────────────────────────────────────────────
  const transmissions = parseArray(query.transmission);
  if (transmissions.length === 1) {
    and.push({ transmissionType: transmissions[0] as never });
  } else if (transmissions.length > 1) {
    and.push({ transmissionType: { in: transmissions as never[] } });
  }

  // ── Vehicle condition ───────────────────────────────────────────────────────
  const conditions = parseArray(query.condition);
  if (conditions.length === 1) {
    and.push({ vehicleCondition: conditions[0] as never });
  } else if (conditions.length > 1) {
    and.push({ vehicleCondition: { in: conditions as never[] } });
  }

  // ── Exterior color ──────────────────────────────────────────────────────────
  const colors = parseArray(query.color);
  if (colors.length === 1) {
    and.push({ color: colors[0] as never });
  } else if (colors.length > 1) {
    and.push({ color: { in: colors as never[] } });
  }

  // ── Interior color ──────────────────────────────────────────────────────────
  const interiorColors = parseArray(query.interiorColor);
  if (interiorColors.length === 1) {
    and.push({ interiorColor: interiorColors[0] as never });
  } else if (interiorColors.length > 1) {
    and.push({ interiorColor: { in: interiorColors as never[] } });
  }

  // ── Drive type ──────────────────────────────────────────────────────────────
  const driveTypes = parseArray(query.driveType);
  if (driveTypes.length === 1) {
    and.push({ driveType: driveTypes[0] as never });
  } else if (driveTypes.length > 1) {
    and.push({ driveType: { in: driveTypes as never[] } });
  }

  // ── Seller type ─────────────────────────────────────────────────────────────
  const sellerTypes = parseArray(query.sellerType);
  if (sellerTypes.length === 1) {
    if (sellerTypes[0] === "DEALER") and.push({ dealerId: { not: null } });
    else if (sellerTypes[0] === "SELLER") and.push({ sellerId: { not: null } });
  }

  // ── Energy label ────────────────────────────────────────────────────────────
  const energyLabels = parseArray(query.energyLabels);
  if (energyLabels.length === 1) {
    and.push({ energyLabel: energyLabels[0] as never });
  } else if (energyLabels.length > 1) {
    and.push({ energyLabel: { in: energyLabels as never[] } });
  }

  // ── Emission standard ───────────────────────────────────────────────────────
  const emissionStandards = parseArray(query.emissionStandards);
  if (emissionStandards.length === 1) {
    and.push({ emissionStandard: emissionStandards[0] as never });
  } else if (emissionStandards.length > 1) {
    and.push({ emissionStandard: { in: emissionStandards as never[] } });
  }

  // ── Battery ownership ───────────────────────────────────────────────────────
  const batteryOwnership = parseArray(query.batteryOwnership);
  if (batteryOwnership.length === 1) {
    and.push({ batteryOwnership: batteryOwnership[0] as never });
  } else if (batteryOwnership.length > 1) {
    and.push({ batteryOwnership: { in: batteryOwnership as never[] } });
  }

  // ── Charging plug (AC / DC) ─────────────────────────────────────────────────
  const chargingAC = parseArray(query.chargingPlugTypeStandard);
  if (chargingAC.length === 1) {
    and.push({ chargingPlugTypeStandard: chargingAC[0] as never });
  } else if (chargingAC.length > 1) {
    and.push({ chargingPlugTypeStandard: { in: chargingAC as never[] } });
  }

  const chargingDC = parseArray(query.chargingPlugTypeFast);
  if (chargingDC.length === 1) {
    and.push({ chargingPlugTypeFast: chargingDC[0] as never });
  } else if (chargingDC.length > 1) {
    and.push({ chargingPlugTypeFast: { in: chargingDC as never[] } });
  }

  // ── Equipment (JSON array contains all selected) ────────────────────────────
  const equipmentItems = parseArray(query.equipment);
  if (equipmentItems.length > 0) {
    and.push({ equipment: { array_contains: equipmentItems } });
  }

  // ── Extras (JSON array contains all selected) ───────────────────────────────
  const extrasItems = parseArray(query.extras);
  if (extrasItems.length > 0) {
    and.push({ extras: { array_contains: extrasItems } });
  }

  // ── Metallic ────────────────────────────────────────────────────────────────
  if (query.metallic === "true") and.push({ metallic: true });
  else if (query.metallic === "false") and.push({ metallic: false });

  // ── Inspection / warranty ───────────────────────────────────────────────────
  if (query.inspectionPassed === "true") and.push({ inspectionPassed: true });
  if (query.hasWarranty === "true") and.push({ warranty: { not: null } });

  // ── Days listed ─────────────────────────────────────────────────────────────
  const days = parseInt10(query.daysListed);
  if (days != null) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    and.push({ createdAt: { gte: cutoff } });
  }

  // ── Price ───────────────────────────────────────────────────────────────────
  const priceFrom = parseInt10(query.priceFrom);
  const priceTo = parseInt10(query.priceTo);
  if (priceFrom != null || priceTo != null) {
    and.push({
      price: {
        ...(priceFrom != null ? { gte: priceFrom } : {}),
        ...(priceTo != null ? { lte: priceTo } : {}),
      },
    });
  }

  // ── Kilometer ───────────────────────────────────────────────────────────────
  const kmFrom = parseInt10(query.kilometerFrom);
  const kmTo = parseInt10(query.kilometerTo);
  if (kmFrom != null || kmTo != null) {
    and.push({
      kilometer: {
        ...(kmFrom != null ? { gte: kmFrom } : {}),
        ...(kmTo != null ? { lte: kmTo } : {}),
      },
    });
  }

  // ── Registration year ───────────────────────────────────────────────────────
  const yearFrom = parseInt10(query.registrationFrom);
  const yearTo = parseInt10(query.registrationTo);
  if (yearFrom != null || yearTo != null) {
    and.push({
      registrationYear: {
        ...(yearFrom != null ? { gte: yearFrom } : {}),
        ...(yearTo != null ? { lte: yearTo } : {}),
      },
    });
  }

  // ── Power (HP / kW) ─────────────────────────────────────────────────────────
  const hpFrom = parseInt10(query.powerFrom);
  const hpTo = parseInt10(query.powerTo);
  if (hpFrom != null || hpTo != null) {
    and.push({
      hp: {
        ...(hpFrom != null ? { gte: hpFrom } : {}),
        ...(hpTo != null ? { lte: hpTo } : {}),
      },
    });
  }

  const kwFrom = parseInt10(query.kwFrom);
  const kwTo = parseInt10(query.kwTo);
  if (kwFrom != null || kwTo != null) {
    and.push({
      kw: {
        ...(kwFrom != null ? { gte: kwFrom } : {}),
        ...(kwTo != null ? { lte: kwTo } : {}),
      },
    });
  }

  // ── Cubic capacity ──────────────────────────────────────────────────────────
  const ccFrom = parseInt10(query.cubicCapacityFrom);
  const ccTo = parseInt10(query.cubicCapacityTo);
  if (ccFrom != null || ccTo != null) {
    and.push({
      cubicCapacity: {
        ...(ccFrom != null ? { gte: ccFrom } : {}),
        ...(ccTo != null ? { lte: ccTo } : {}),
      },
    });
  }

  // ── Cylinders ───────────────────────────────────────────────────────────────
  const cylFrom = parseInt10(query.cylindersFrom);
  const cylTo = parseInt10(query.cylindersTo);
  if (cylFrom != null || cylTo != null) {
    and.push({
      cylinders: {
        ...(cylFrom != null ? { gte: cylFrom } : {}),
        ...(cylTo != null ? { lte: cylTo } : {}),
      },
    });
  }

  // ── Consumption ─────────────────────────────────────────────────────────────
  const consFrom = parseFloat10(query.consumptionFrom);
  const consTo = parseFloat10(query.consumptionTo);
  if (consFrom != null || consTo != null) {
    and.push({
      consumptionTotal: {
        ...(consFrom != null ? { gte: consFrom } : {}),
        ...(consTo != null ? { lte: consTo } : {}),
      },
    });
  }

  // ── CO2 emissions ───────────────────────────────────────────────────────────
  const co2From = parseInt10(query.co2From);
  const co2To = parseInt10(query.co2To);
  if (co2From != null || co2To != null) {
    and.push({
      co2Emission: {
        ...(co2From != null ? { gte: co2From } : {}),
        ...(co2To != null ? { lte: co2To } : {}),
      },
    });
  }

  // ── EV range ────────────────────────────────────────────────────────────────
  const rangeFrom = parseInt10(query.rangeFrom);
  const rangeTo = parseInt10(query.rangeTo);
  if (rangeFrom != null || rangeTo != null) {
    and.push({
      range: {
        ...(rangeFrom != null ? { gte: rangeFrom } : {}),
        ...(rangeTo != null ? { lte: rangeTo } : {}),
      },
    });
  }

  // ── Doors ───────────────────────────────────────────────────────────────────
  const doorsFrom = parseInt10(query.doorsFrom);
  const doorsTo = parseInt10(query.doorsTo);
  if (doorsFrom != null || doorsTo != null) {
    and.push({
      doors: {
        ...(doorsFrom != null ? { gte: doorsFrom } : {}),
        ...(doorsTo != null ? { lte: doorsTo } : {}),
      },
    });
  }

  // ── Seats ───────────────────────────────────────────────────────────────────
  const seatsFrom = parseInt10(query.seatsFrom);
  const seatsTo = parseInt10(query.seatsTo);
  if (seatsFrom != null || seatsTo != null) {
    and.push({
      seats: {
        ...(seatsFrom != null ? { gte: seatsFrom } : {}),
        ...(seatsTo != null ? { lte: seatsTo } : {}),
      },
    });
  }

  return { status: "PUBLISHED", AND: and };
}

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}
  async findMany(query: VehiclesQueryDto) {
    const page = Math.max(1, parseInt(query.page ?? "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize ?? "24", 10)));
    const skip = (page - 1) * pageSize;

    const where = buildWhereClause(query);
    const orderBy = buildSortOrder(query.sort);

    const [vehicles, total, facets] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
        select: VEHICLE_LIST_SELECT,
        orderBy: orderBy as never,
        skip,
        take: pageSize,
      }),
      this.prisma.vehicle.count({ where }),
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
    const vehicles = await this.prisma.vehicle.findMany({
      where: { status: "PUBLISHED", AND: [ACTIVE_OWNER_FILTER] },
      select: VEHICLE_LIST_SELECT,
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    return { data: vehicles };
  }

  async findSimilar(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      select: { make: true, bodyType: true, fuelType: true, price: true, vehicleType: true },
    });

    if (!vehicle) return { data: [] };

    const priceFilter = vehicle.price
      ? { gte: Math.round(vehicle.price * 0.5), lte: Math.round(vehicle.price * 1.5) }
      : undefined;

    const vehicles = await this.prisma.vehicle.findMany({
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
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id, status: "PUBLISHED", AND: [ACTIVE_OWNER_FILTER] },
      select: VEHICLE_DETAIL_SELECT,
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with id "${id}" not found`);
    }

    return { data: vehicle };
  }

  private async computeFacets(where: WhereClause) {
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
      dealerCount,
      sellerCount,
    ] = await Promise.all([
      this.prisma.vehicle.groupBy({ by: ["make"], where, _count: true, orderBy: { _count: { make: "desc" } } }),
      this.prisma.vehicle.groupBy({ by: ["fuelType"], where, _count: true, orderBy: { _count: { fuelType: "desc" } } }),
      this.prisma.vehicle.groupBy({ by: ["transmissionType"], where, _count: true, orderBy: { _count: { transmissionType: "desc" } } }),
      this.prisma.vehicle.groupBy({ by: ["vehicleCondition"], where, _count: true, orderBy: { _count: { vehicleCondition: "desc" } } }),
      this.prisma.vehicle.groupBy({ by: ["vehicleType"], where, _count: true, orderBy: { _count: { vehicleType: "desc" } } }),
      this.prisma.vehicle.groupBy({ by: ["bodyType"], where, _count: true, orderBy: { _count: { bodyType: "desc" } } }),
      this.prisma.vehicle.groupBy({ by: ["color"], where, _count: true, orderBy: { _count: { color: "desc" } } }),
      this.prisma.vehicle.groupBy({ by: ["interiorColor"], where, _count: true, orderBy: { _count: { interiorColor: "desc" } } }),
      this.prisma.vehicle.groupBy({ by: ["driveType"], where, _count: true, orderBy: { _count: { driveType: "desc" } } }),
      this.prisma.vehicle.groupBy({ by: ["energyLabel"], where, _count: true, orderBy: { _count: { energyLabel: "desc" } } }),
      this.prisma.vehicle.groupBy({ by: ["emissionStandard"], where, _count: true, orderBy: { _count: { emissionStandard: "desc" } } }),
      this.prisma.vehicle.aggregate({
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
      this.prisma.vehicle.count({ where: { ...where, metallic: true } }),
      this.prisma.vehicle.count({ where: { ...where, inspectionPassed: true } }),
      this.prisma.vehicle.count({ where: { ...where, warranty: { not: null } } }),
      this.prisma.vehicle.count({ where: { ...where, dealerId: { not: null } } }),
      this.prisma.vehicle.count({ where: { ...where, sellerId: { not: null } } }),
    ]);

    return {
      make: toFacetRecord(makeGroups, "make"),
      fuelType: toFacetRecord(fuelTypeGroups, "fuelType"),
      transmissionType: toFacetRecord(transmissionTypeGroups, "transmissionType"),
      vehicleCondition: toFacetRecord(vehicleConditionGroups, "vehicleCondition"),
      vehicleType: toFacetRecord(vehicleTypeGroups, "vehicleType"),
      bodyType: toFacetRecord(bodyTypeGroups, "bodyType"),
      color: toFacetRecord(colorGroups, "color"),
      interiorColor: toFacetRecord(interiorColorGroups, "interiorColor"),
      driveType: toFacetRecord(driveTypeGroups, "driveType"),
      energyLabel: toFacetRecord(energyLabelGroups, "energyLabel"),
      emissionStandard: toFacetRecord(emissionStandardGroups, "emissionStandard"),
      sellerType: { DEALER: dealerCount, SELLER: sellerCount },
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

function toFacetRecord(
  groups: Array<Record<string, unknown> & { _count: number }>,
  field: string,
): Record<string, number> {
  const record: Record<string, number> = {};
  for (const g of groups) {
    const key = g[field];
    if (key != null) record[String(key)] = g._count;
  }
  return record;
}
