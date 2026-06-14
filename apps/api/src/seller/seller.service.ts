import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { prisma } from "@repo/db";
import type { UserSession } from "@thallesp/nestjs-better-auth";

export class UpdateSellerProfileDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  city?: string;
  description?: string;
  avatar?: string;
}

export class SellerVehiclesQueryDto {
  page?: string;
  pageSize?: string;
  sort?: string;
}

export class CreateSellerVehicleDto {
  [key: string]: unknown;
}

export class UpdateSellerVehicleDto {
  [key: string]: unknown;
}

const SELLER_VEHICLE_LIST_SELECT = {
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
  status: true,
  createdAt: true,
  updatedAt: true,
  images: true,
} as const;

type SellerVehicleSortOrder =
  | { price: "asc" | "desc" }
  | { kilometer: "asc" | "desc" }
  | { createdAt: "asc" | "desc" };

function buildSellerVehicleOrderBy(
  sort: string | undefined,
): SellerVehicleSortOrder {
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

async function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  const { default: Stripe } = await import("stripe");
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

@Injectable()
export class SellerService {
  private async getSellerByUserId(userId: string) {
    const seller = await prisma.seller.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!seller) {
      throw new NotFoundException("Seller profile not found for this user");
    }
    return seller;
  }

  async getProfile(session: UserSession) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        image: true,
        seller: {
          select: {
            id: true,
            phoneNumber: true,
            streetAddress: true,
            zipCode: true,
            city: true,
            country: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return { data: user };
  }

  async updateProfile(session: UserSession, body: UpdateSellerProfileDto) {
    const {
      firstName,
      lastName,
      phoneNumber,
      city,
      description: _description,
      avatar,
    } = body;

    // Update the User record (name, image)
    const nameParts: string[] = [];
    if (firstName) nameParts.push(firstName);
    if (lastName) nameParts.push(lastName);

    const userUpdateData: Record<string, unknown> = {};
    if (nameParts.length > 0) userUpdateData.name = nameParts.join(" ");
    if (avatar !== undefined) userUpdateData.image = avatar;

    const sellerUpdateData: Record<string, unknown> = {};
    if (phoneNumber !== undefined) sellerUpdateData.phoneNumber = phoneNumber;
    if (city !== undefined) sellerUpdateData.city = city;

    await prisma.$transaction(async (tx: any) => {
      if (Object.keys(userUpdateData).length > 0) {
        await tx.user.update({
          where: { id: session.user.id },
          data: userUpdateData,
        });
      }

      if (Object.keys(sellerUpdateData).length > 0) {
        await tx.seller.upsert({
          where: { userId: session.user.id },
          create: {
            userId: session.user.id,
            phoneNumber: (sellerUpdateData.phoneNumber as string) ?? "",
            streetAddress: "",
            zipCode: "",
            city: (sellerUpdateData.city as string) ?? "",
          },
          update: sellerUpdateData,
        });
      }
    });

    return this.getProfile(session);
  }

  async listVehicles(session: UserSession, query: SellerVehiclesQueryDto) {
    const seller = await this.getSellerByUserId(session.user.id);

    const page = Math.max(1, parseInt(query.page ?? "1", 10));
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(query.pageSize ?? "12", 10)),
    );
    const skip = (page - 1) * pageSize;
    const orderBy = buildSellerVehicleOrderBy(query.sort);

    const where = { sellerId: seller.id };

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        select: SELLER_VEHICLE_LIST_SELECT,
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

  async createVehicle(session: UserSession, body: CreateSellerVehicleDto) {
    const seller = await this.getSellerByUserId(session.user.id);

    const vehicle = await prisma.vehicle.create({
      data: {
        ...(body as object),
        sellerId: seller.id,
        dealerId: undefined,
      },
    });

    return { data: vehicle };
  }

  async getVehicle(session: UserSession, id: string) {
    const seller = await this.getSellerByUserId(session.user.id);

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with id "${id}" not found`);
    }

    if (vehicle.sellerId !== seller.id) {
      throw new ForbiddenException("This vehicle does not belong to you");
    }

    return { data: vehicle };
  }

  async updateVehicle(
    session: UserSession,
    id: string,
    body: UpdateSellerVehicleDto,
  ) {
    const seller = await this.getSellerByUserId(session.user.id);

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      select: { id: true, sellerId: true },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with id "${id}" not found`);
    }

    if (vehicle.sellerId !== seller.id) {
      throw new ForbiddenException("This vehicle does not belong to you");
    }

    const updated = await prisma.vehicle.update({
      where: { id },
      data: body as never,
    });

    return { data: updated };
  }

  async deleteVehicle(session: UserSession, id: string) {
    const seller = await this.getSellerByUserId(session.user.id);

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      select: { id: true, sellerId: true },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with id "${id}" not found`);
    }

    if (vehicle.sellerId !== seller.id) {
      throw new ForbiddenException("This vehicle does not belong to you");
    }

    await prisma.vehicle.delete({ where: { id } });

    return { data: { success: true } };
  }

  async getBilling(session: UserSession) {
    const stripe = await getStripe();

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });

    if (!stripe || !user?.stripeCustomerId) {
      return {
        data: {
          paymentMethod: null,
          invoices: [],
        },
      };
    }

    const [paymentMethods, invoices] = await Promise.all([
      stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type: "card",
      }),
      stripe.invoices.list({
        customer: user.stripeCustomerId,
        limit: 24,
      }),
    ]);

    const defaultPaymentMethod = paymentMethods.data[0] ?? null;

    return {
      data: {
        paymentMethod: defaultPaymentMethod
          ? {
              brand: defaultPaymentMethod.card?.brand ?? "",
              last4: defaultPaymentMethod.card?.last4 ?? "",
              expMonth: defaultPaymentMethod.card?.exp_month ?? 0,
              expYear: defaultPaymentMethod.card?.exp_year ?? 0,
            }
          : null,
        invoices: invoices.data.map((inv) => ({
          id: inv.id,
          number: inv.number,
          date: inv.created,
          amount: inv.amount_paid,
          status: inv.status,
          hostedUrl: inv.hosted_invoice_url,
          pdfUrl: inv.invoice_pdf,
        })),
      },
    };
  }

  async createBillingPortalSession(session: UserSession) {
    const stripe = await getStripe();

    if (!stripe) {
      throw new BadRequestException("Stripe is not configured");
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      throw new BadRequestException("No Stripe customer found for this user");
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url:
        process.env.STRIPE_PORTAL_RETURN_URL ??
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
    });

    return { data: { url: portalSession.url } };
  }
}
