import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { Prisma } from "../generated/prisma/client";
import React from "react";
import { sendEmail, ListingContactEmail } from "../transactional";

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
  make?: string | string[];
  excludeMake?: string | string[];
  fuel?: string | string[];
  condition?: string | string[];
  bodyType?: string | string[];
  transmission?: string | string[];
  color?: string | string[];
  driveType?: string | string[];
  priceFrom?: string;
  priceTo?: string;
  kilometerFrom?: string;
  kilometerTo?: string;
  registrationFrom?: string;
  registrationTo?: string;
  powerFrom?: string;
  powerTo?: string;
}

function parseArray(val: string | string[] | undefined): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.flatMap((v) => v.split(",").filter(Boolean));
  return val.split(",").filter(Boolean);
}

function toInt(val: string | undefined): number | undefined {
  if (!val) return undefined;
  const n = parseInt(val, 10);
  return isNaN(n) ? undefined : n;
}

export class DealerContactDto {
  name!: string;
  phone!: string;
  email!: string;
  message?: string;
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
  | { createdAt: "asc" | "desc" }
  | Array<{ registrationYear: "asc" | "desc" } | { registrationMonth: "asc" | "desc" }>;

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

const ACTIVE_DEALER_FILTER = {
  user: {
    OR: [{ banned: null }, { banned: false }, { banExpires: { lte: new Date() } }],
  },
};

@Injectable()
export class DealersService {
  constructor(private prisma: PrismaService) {}
  async findMany(query: DealersQueryDto) {
    const page = Math.max(1, parseInt(query.page ?? "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize ?? "12", 10)));
    const skip = (page - 1) * pageSize;

    const where: Prisma.DealerWhereInput = {
      ...ACTIVE_DEALER_FILTER,
    };

    if (query.search) {
      where!.companyName = { contains: query.search, mode: "insensitive" };
    }

    if (query.city) {
      where!.city = { equals: query.city, mode: "insensitive" };
    }

    const [dealers, total] = await Promise.all([
      this.prisma.dealer.findMany({
        where,
        select: DEALER_LIST_SELECT,
        orderBy: { companyName: "asc" },
        skip,
        take: pageSize,
      }),
      this.prisma.dealer.count({ where }),
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
    const dealers = await this.prisma.dealer.findMany({
      where: {
        logo: { not: null },
        ...ACTIVE_DEALER_FILTER,
      },
      select: DEALER_LIST_SELECT,
      orderBy: [{ googleRating: "desc" }, { companyName: "asc" }],
      take: 6,
    });

    return { data: dealers };
  }

  async findOne(id: string) {
    const raw = await this.prisma.dealer.findFirst({
      where: { id, ...ACTIVE_DEALER_FILTER },
      select: {
        ...DEALER_DETAIL_SELECT,
        user: { select: { emailVerified: true } },
      },
    });

    if (!raw) {
      throw new NotFoundException(`Dealer with id "${id}" not found`);
    }

    const { user, ...dealer } = raw;
    return { data: { ...dealer, isVerified: user.emailVerified === true } };
  }

  async findDealerVehicles(id: string, query: DealerVehiclesQueryDto) {
    const page = Math.max(1, parseInt(query.page ?? "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize ?? "12", 10)));
    const skip = (page - 1) * pageSize;

    const dealerExists = await this.prisma.dealer.findFirst({
      where: { id, ...ACTIVE_DEALER_FILTER },
      select: { id: true },
    });

    if (!dealerExists) {
      throw new NotFoundException(`Dealer with id "${id}" not found`);
    }

    const and: Prisma.VehicleWhereInput[] = [];

    const makes = parseArray(query.make);
    if (makes.length === 1) and.push({ make: { equals: makes[0], mode: "insensitive" } });
    else if (makes.length > 1) and.push({ make: { in: makes, mode: "insensitive" } });

    const excludeMakes = parseArray(query.excludeMake);
    if (excludeMakes.length > 0 && makes.length === 0) and.push({ make: { notIn: excludeMakes, mode: "insensitive" } });

    const fuels = parseArray(query.fuel);
    if (fuels.length === 1) and.push({ fuelType: fuels[0] as never });
    else if (fuels.length > 1) and.push({ fuelType: { in: fuels as never[] } });

    const conditions = parseArray(query.condition);
    if (conditions.length === 1) and.push({ vehicleCondition: conditions[0] as never });
    else if (conditions.length > 1) and.push({ vehicleCondition: { in: conditions as never[] } });

    const bodyTypes = parseArray(query.bodyType);
    if (bodyTypes.length === 1) and.push({ bodyType: bodyTypes[0] as never });
    else if (bodyTypes.length > 1) and.push({ bodyType: { in: bodyTypes as never[] } });

    const transmissions = parseArray(query.transmission);
    if (transmissions.length === 1) and.push({ transmissionType: transmissions[0] as never });
    else if (transmissions.length > 1) and.push({ transmissionType: { in: transmissions as never[] } });

    const colors = parseArray(query.color);
    if (colors.length === 1) and.push({ color: colors[0] as never });
    else if (colors.length > 1) and.push({ color: { in: colors as never[] } });

    const driveTypes = parseArray(query.driveType);
    if (driveTypes.length === 1) and.push({ driveType: driveTypes[0] as never });
    else if (driveTypes.length > 1) and.push({ driveType: { in: driveTypes as never[] } });

    const priceFrom = toInt(query.priceFrom);
    const priceTo = toInt(query.priceTo);
    if (priceFrom != null || priceTo != null) {
      and.push({ price: { ...(priceFrom != null ? { gte: priceFrom } : {}), ...(priceTo != null ? { lte: priceTo } : {}) } });
    }

    const kmFrom = toInt(query.kilometerFrom);
    const kmTo = toInt(query.kilometerTo);
    if (kmFrom != null || kmTo != null) {
      and.push({ kilometer: { ...(kmFrom != null ? { gte: kmFrom } : {}), ...(kmTo != null ? { lte: kmTo } : {}) } });
    }

    const yearFrom = toInt(query.registrationFrom);
    const yearTo = toInt(query.registrationTo);
    if (yearFrom != null || yearTo != null) {
      and.push({ registrationYear: { ...(yearFrom != null ? { gte: yearFrom } : {}), ...(yearTo != null ? { lte: yearTo } : {}) } });
    }

    const hpFrom = toInt(query.powerFrom);
    const hpTo = toInt(query.powerTo);
    if (hpFrom != null || hpTo != null) {
      and.push({ hp: { ...(hpFrom != null ? { gte: hpFrom } : {}), ...(hpTo != null ? { lte: hpTo } : {}) } });
    }

    const where = { dealerId: id, status: "PUBLISHED" as const, ...(and.length > 0 ? { AND: and } : {}) };
    const orderBy = buildDealerVehicleOrderBy(query.sort);

    const [vehicles, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
        select: DEALER_VEHICLE_LIST_SELECT,
        orderBy,
        skip,
        take: pageSize,
      }),
      this.prisma.vehicle.count({ where }),
    ]);

    return {
      data: vehicles,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async sendContactEmail(id: string, body: DealerContactDto) {
    const dealer = await this.prisma.dealer.findFirst({
      where: { id, ...ACTIVE_DEALER_FILTER },
      select: { companyName: true, businessEmail: true },
    });

    if (!dealer) {
      throw new NotFoundException(`Dealer with id "${id}" not found`);
    }

    const result = await sendEmail({
      to: dealer.businessEmail,
      subject: `Neue Anfrage von ${body.name} via Autovendo`,
      replyTo: body.email,
      template: React.createElement(ListingContactEmail, {
        recipientName: dealer.companyName,
        senderName: body.name,
        senderEmail: body.email,
        senderPhone: body.phone,
        message: body.message ?? "",
      }),
    });

    if (!result.success) {
      return { success: false, error: "errorDefault" };
    }

    return { success: true };
  }
}
