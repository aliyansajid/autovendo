import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { prisma } from "@repo/db";
import type { UserSession } from "@thallesp/nestjs-better-auth";

export class UpdateDealerProfileDto {
  companyName?: string;
  streetAddress?: string;
  zipCode?: string;
  city?: string;
  phoneNumber?: string;
  website?: string;
  businessEmail?: string;
  description?: string;
  logo?: string;
  openingHours?: Array<{
    day: string;
    isOpen: boolean;
    openTime?: string | null;
    closeTime?: string | null;
  }>;
}

export class DealerVehiclesQueryDto {
  page?: string;
  pageSize?: string;
  sort?: string;
}

export class CreateVehicleDto {
  [key: string]: unknown;
}

export class UpdateVehicleDto {
  [key: string]: unknown;
}

export class CreateCheckoutSessionDto {
  planId?: string;
}

const DEALER_PROFILE_SELECT = {
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
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
    },
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
  status: true,
  createdAt: true,
  updatedAt: true,
  images: true,
} as const;

type DealerVehicleSortOrder =
  | { price: "asc" | "desc" }
  | { kilometer: "asc" | "desc" }
  | { createdAt: "asc" | "desc" };

function buildDealerVehicleOrderBy(
  sort: string | undefined,
): DealerVehicleSortOrder {
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
export class DealerService {
  private async getDealerByUserId(userId: string) {
    const dealer = await prisma.dealer.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!dealer) {
      throw new NotFoundException("Dealer profile not found for this user");
    }
    return dealer;
  }

  async getProfile(session: UserSession) {
    const dealer = await prisma.dealer.findUnique({
      where: { userId: session.user.id },
      select: DEALER_PROFILE_SELECT,
    });

    if (!dealer) {
      throw new NotFoundException("Dealer profile not found");
    }

    return { data: dealer };
  }

  async updateProfile(session: UserSession, body: UpdateDealerProfileDto) {
    const dealer = await this.getDealerByUserId(session.user.id);

    const { openingHours, ...profileFields } = body;

    const updated = await prisma.dealer.update({
      where: { id: dealer.id },
      data: {
        ...profileFields,
        ...(openingHours
          ? {
              openingHours: {
                upsert: openingHours.map((oh) => ({
                  where: {
                    dealerId_day: { dealerId: dealer.id, day: oh.day as never },
                  },
                  create: {
                    day: oh.day as never,
                    isOpen: oh.isOpen,
                    openTime: oh.openTime
                      ? new Date(`1970-01-01T${oh.openTime}:00Z`)
                      : null,
                    closeTime: oh.closeTime
                      ? new Date(`1970-01-01T${oh.closeTime}:00Z`)
                      : null,
                  },
                  update: {
                    isOpen: oh.isOpen,
                    openTime: oh.openTime
                      ? new Date(`1970-01-01T${oh.openTime}:00Z`)
                      : null,
                    closeTime: oh.closeTime
                      ? new Date(`1970-01-01T${oh.closeTime}:00Z`)
                      : null,
                  },
                })),
              },
            }
          : {}),
      },
      select: DEALER_PROFILE_SELECT,
    });

    return { data: updated };
  }

  async listVehicles(session: UserSession, query: DealerVehiclesQueryDto) {
    const dealer = await this.getDealerByUserId(session.user.id);

    const page = Math.max(1, parseInt(query.page ?? "1", 10));
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(query.pageSize ?? "12", 10)),
    );
    const skip = (page - 1) * pageSize;
    const orderBy = buildDealerVehicleOrderBy(query.sort);

    const where = { dealerId: dealer.id };

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

  async createVehicle(session: UserSession, body: CreateVehicleDto) {
    const dealer = await this.getDealerByUserId(session.user.id);

    const vehicle = await prisma.vehicle.create({
      data: {
        ...(body as any),
        dealerId: dealer.id,
        sellerId: undefined,
      },
    });

    return { data: vehicle };
  }

  async getVehicle(session: UserSession, id: string) {
    const dealer = await this.getDealerByUserId(session.user.id);

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with id "${id}" not found`);
    }

    if (vehicle.dealerId !== dealer.id) {
      throw new ForbiddenException("This vehicle does not belong to you");
    }

    return { data: vehicle };
  }

  async updateVehicle(
    session: UserSession,
    id: string,
    body: UpdateVehicleDto,
  ) {
    const dealer = await this.getDealerByUserId(session.user.id);

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      select: { id: true, dealerId: true },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with id "${id}" not found`);
    }

    if (vehicle.dealerId !== dealer.id) {
      throw new ForbiddenException("This vehicle does not belong to you");
    }

    const updated = await prisma.vehicle.update({
      where: { id },
      data: body as never,
    });

    return { data: updated };
  }

  async deleteVehicle(session: UserSession, id: string) {
    const dealer = await this.getDealerByUserId(session.user.id);

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      select: { id: true, dealerId: true },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with id "${id}" not found`);
    }

    if (vehicle.dealerId !== dealer.id) {
      throw new ForbiddenException("This vehicle does not belong to you");
    }

    await prisma.vehicle.delete({ where: { id } });

    return { data: { success: true } };
  }

  async getSubscription(session: UserSession) {
    const stripe = await getStripe();

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });

    if (!stripe || !user?.stripeCustomerId) {
      // Return mock/empty data when Stripe is not configured
      const subscriptions = await prisma.subscription.findMany({
        where: { referenceId: session.user.id },
      });

      const plans = await prisma.plan.findMany({
        orderBy: { price: "asc" },
      });

      const dealer = await this.getDealerByUserId(session.user.id);
      const vehicleCount = await prisma.vehicle.count({
        where: { dealerId: dealer.id },
      });

      return {
        data: {
          subscriptions,
          plans,
          vehicleCount,
          paymentMethod: null,
          invoices: [],
        },
      };
    }

    const [
      stripeSubscriptions,
      paymentMethods,
      invoices,
      subscriptions,
      plans,
    ] = await Promise.all([
      stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: "all",
        expand: ["data.default_payment_method"],
        limit: 10,
      }),
      stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type: "card",
      }),
      stripe.invoices.list({
        customer: user.stripeCustomerId,
        limit: 24,
      }),
      prisma.subscription.findMany({
        where: { referenceId: session.user.id },
      }),
      prisma.plan.findMany({ orderBy: { price: "asc" } }),
    ]);

    const dealer = await this.getDealerByUserId(session.user.id);
    const vehicleCount = await prisma.vehicle.count({
      where: { dealerId: dealer.id },
    });

    const defaultPaymentMethod = paymentMethods.data[0] ?? null;

    return {
      data: {
        subscriptions,
        stripeSubscriptions: stripeSubscriptions.data,
        plans,
        vehicleCount,
        paymentMethod: defaultPaymentMethod
          ? {
              brand: defaultPaymentMethod.card?.brand ?? "",
              last4: defaultPaymentMethod.card?.last4 ?? "",
              expMonth: defaultPaymentMethod.card?.exp_month ?? 0,
              expYear: defaultPaymentMethod.card?.exp_year ?? 0,
            }
          : null,
        invoices: invoices.data.map((inv: any) => ({
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

  async createCheckoutSession(
    session: UserSession,
    body: CreateCheckoutSessionDto,
  ) {
    const stripe = await getStripe();

    if (!stripe) {
      throw new BadRequestException("Stripe is not configured");
    }

    const { planId } = body;
    if (!planId) {
      throw new BadRequestException("planId is required");
    }

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException(`Plan with id "${planId}" not found`);
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true, email: true },
    });

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer: user?.stripeCustomerId ?? undefined,
      customer_email: !user?.stripeCustomerId ? user?.email : undefined,
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.user.id,
        planId: plan.id,
      },
      success_url:
        process.env.STRIPE_SUCCESS_URL ??
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?success=1`,
      cancel_url:
        process.env.STRIPE_CANCEL_URL ??
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?canceled=1`,
    });

    return { data: { url: checkoutSession.url } };
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
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription`,
    });

    return { data: { url: portalSession.url } };
  }
}
