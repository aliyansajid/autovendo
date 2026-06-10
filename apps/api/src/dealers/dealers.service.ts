import { Injectable, NotFoundException } from "@nestjs/common";
import { prisma } from "@repo/db";

export class DealersQueryDto {
  page?: string;
  pageSize?: string;
  search?: string;
  city?: string;
}

export class DealerVehiclesQueryDto {
  page?: string;
  pageSize?: string;
  sort?: string;
}

const DEALER_LIST_SELECT = {
  id: true,
  companyName: true,
  streetAddress: true,
  city: true,
  zipCode: true,
  logo: true,
  coverImage: true,
  googleRating: true,
  googleReviewCount: true,
} as const;

const DEALER_DETAIL_SELECT = {
  id: true,
  userId: true,
  companyName: true,
  description: true,
  website: true,
  logo: true,
  coverImage: true,
  streetAddress: true,
  zipCode: true,
  city: true,
  country: true,
  uidNumber: true,
  contactPerson: true,
  phoneNumber: true,
  businessEmail: true,
  googlePlaceId: true,
  googleRating: true,
  googleReviewCount: true,
  createdAt: true,
  updatedAt: true,
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
} as const;

const DEALER_VEHICLE_LIST_SELECT = {
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
} as const;

type VehicleSortOrder =
  | { price: "asc" | "desc" }
  | { kilometer: "asc" | "desc" }
  | { createdAt: "asc" | "desc" };

function buildDealerVehicleOrderBy(sort: string | undefined): VehicleSortOrder {
  switch (sort) {
    case "price-asc":
      return { price: "asc" };
    case "price-desc":
      return { price: "desc" };
    case "kilometer-asc":
      return { kilometer: "asc" };
    case "kilometer-desc":
      return { kilometer: "desc" };
    case "created-asc":
      return { createdAt: "asc" };
    case "created-desc":
    default:
      return { createdAt: "desc" };
  }
}

@Injectable()
export class DealersService {
  async findMany(query: DealersQueryDto) {
    const page = Math.max(1, parseInt(query.page ?? "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize ?? "12", 10)));
    const skip = (page - 1) * pageSize;

    const where: Parameters<typeof prisma.dealer.findMany>[0]["where"] = {};

    if (query.search) {
      where!.companyName = { contains: query.search, mode: "insensitive" };
    }

    if (query.city) {
      where!.city = { equals: query.city, mode: "insensitive" };
    }

    const [dealers, total] = await Promise.all([
      prisma.dealer.findMany({
        where,
        select: DEALER_LIST_SELECT,
        orderBy: { companyName: "asc" },
        skip,
        take: pageSize,
      }),
      prisma.dealer.count({ where }),
    ]);

    return {
      data: dealers,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findFeatured() {
    const dealers = await prisma.dealer.findMany({
      where: {
        logo: { not: null },
      },
      select: DEALER_LIST_SELECT,
      orderBy: [{ googleRating: "desc" }, { companyName: "asc" }],
      take: 6,
    });

    return { data: dealers };
  }

  async findOne(id: string) {
    const dealer = await prisma.dealer.findUnique({
      where: { id },
      select: DEALER_DETAIL_SELECT,
    });

    if (!dealer) {
      throw new NotFoundException(`Dealer with id "${id}" not found`);
    }

    return { data: dealer };
  }

  async findDealerVehicles(id: string, query: DealerVehiclesQueryDto) {
    const page = Math.max(1, parseInt(query.page ?? "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize ?? "12", 10)));
    const skip = (page - 1) * pageSize;

    const dealerExists = await prisma.dealer.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!dealerExists) {
      throw new NotFoundException(`Dealer with id "${id}" not found`);
    }

    const where = { dealerId: id, status: "PUBLISHED" as const };
    const orderBy = buildDealerVehicleOrderBy(query.sort);

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        select: DEALER_VEHICLE_LIST_SELECT,
        orderBy,
        skip,
        take: pageSize,
      }),
      prisma.vehicle.count({ where }),
    ]);

    return {
      data: vehicles,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
