"use server";

import { prisma } from "@repo/db";
import { Prisma } from "@repo/db";
import {
  VehicleSearchParamsSchema,
  buildVehicleOrderBy,
  buildVehicleWhere,
  groupByToCounts,
  type VehicleFacetCounts,
  type VehicleSearchParams,
} from "@/lib/vehicle-search";

export interface GetVehiclesParams {
  search?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
  make?: string;
  model?: string;
  priceFrom?: number;
  priceTo?: number;
  registrationFrom?: number;
  registrationTo?: number;
  kilometerFrom?: number;
  kilometerTo?: number;
  fuel?: string[];
  transmission?: string[];
  condition?: string[];
  vehicleType?: string[];
  powerFrom?: number;
  powerTo?: number;
  evs?: "only_ev" | "no_ev";
  metallic?: boolean;
  color?: string[];
  equipment?: string[];
}

export type VehicleListItem = Prisma.VehicleGetPayload<{
  select: {
    id: true;
    make: true;
    model: true;
    version: true;
    price: true;
    kilometer: true;
    registrationMonth: true;
    registrationYear: true;
    kw: true;
    hp: true;
    fuelType: true;
    vehicleCondition: true;
    images: true;
    dealer: {
      select: {
        id: true;
        companyName: true;
        city: true;
        zipCode: true;
        phoneNumber: true;
      };
    };
  };
}>;

export async function getVehicles(params: GetVehiclesParams) {
  const normalized = VehicleSearchParamsSchema.parse({
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 10,
    sort: params.sort ?? "relevance",
    search: params.search ?? "",
    make: params.make,
    model: params.model,
    priceFrom: params.priceFrom,
    priceTo: params.priceTo,
    registrationFrom: params.registrationFrom,
    registrationTo: params.registrationTo,
    kilometerFrom: params.kilometerFrom,
    kilometerTo: params.kilometerTo,
    powerFrom: params.powerFrom,
    powerTo: params.powerTo,
    fuel: params.fuel,
    transmission: params.transmission,
    condition: params.condition,
    vehicleType: params.vehicleType,
    evs: params.evs,
    metallic: params.metallic,
    color: params.color,
    equipment: params.equipment,
  });

  const skip = (normalized.page - 1) * normalized.pageSize;
  const take = normalized.pageSize;

  const where = buildVehicleWhere(normalized);
  const orderBy = buildVehicleOrderBy(normalized.sort);

  const [total, vehicles] = await Promise.all([
    prisma.vehicle.count({ where }),
    prisma.vehicle.findMany({
      where,
      orderBy,
      skip,
      take,
      select: {
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
        images: true,
        dealer: {
          select: {
            id: true,
            companyName: true,
            city: true,
            zipCode: true,
            phoneNumber: true,
          },
        },
      },
    }),
  ]);

  return {
    vehicles: vehicles as VehicleListItem[],
    total,
    page: normalized.page,
    pageSize: normalized.pageSize,
    totalPages: Math.ceil(total / normalized.pageSize),
  };
}

export async function getVehiclesWithFacets(params: VehicleSearchParams) {
  const skip = (params.page - 1) * params.pageSize;
  const take = params.pageSize;
  const where = buildVehicleWhere(params);
  const orderBy = buildVehicleOrderBy(params.sort);

  const facetBase = buildVehicleWhere(params, { make: true, model: true });

  const [
    total,
    vehicles,
    makeRows,
    fuelRows,
    transmissionRows,
    conditionRows,
    vehicleTypeRows,
    colorRows,
  ] = await Promise.all([
    prisma.vehicle.count({ where }),
    prisma.vehicle.findMany({
      where,
      orderBy,
      skip,
      take,
      select: {
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
        images: true,
        dealer: {
          select: {
            id: true,
            companyName: true,
            city: true,
            zipCode: true,
            phoneNumber: true,
          },
        },
      },
    }),
    prisma.vehicle.groupBy({
      by: ["make"],
      where: facetBase,
      _count: { _all: true },
      orderBy: { make: "asc" },
    }),
    prisma.vehicle.groupBy({
      by: ["fuelType"],
      where: buildVehicleWhere(params, { fuel: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["transmissionType"],
      where: buildVehicleWhere(params, { transmission: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["vehicleCondition"],
      where: buildVehicleWhere(params, { condition: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["vehicleType"],
      where: buildVehicleWhere(params, { vehicleType: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["color"],
      where: buildVehicleWhere(params, { color: true }),
      _count: { _all: true },
    }),
  ]);

  const facets: VehicleFacetCounts = {
    make: groupByToCounts(makeRows as any, "make"),
    fuelType: groupByToCounts(fuelRows as any, "fuelType"),
    transmissionType: groupByToCounts(
      transmissionRows as any,
      "transmissionType",
    ),
    vehicleCondition: groupByToCounts(conditionRows as any, "vehicleCondition"),
    vehicleType: groupByToCounts(vehicleTypeRows as any, "vehicleType"),
    color: groupByToCounts(colorRows as any, "color"),
  };

  return {
    vehicles: vehicles as VehicleListItem[],
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.ceil(total / params.pageSize),
    facets,
  };
}

export async function getVehicleById(id: string) {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        dealer: true,
      },
    });

    if (!vehicle) {
      return null;
    }

    return vehicle;
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    return null;
  }
}
