import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma.service.js";
import type { UserSession } from "@thallesp/nestjs-better-auth";

export class UpdateSellerProfileDto {
  phoneNumber?: string;
  streetAddress?: string;
  zipCode?: string;
  city?: string;
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

const VEHICLE_FIELDS = new Set([
  "vehicleType","status","make","model","version","bodyType","fuelType",
  "registrationMonth","registrationYear","kilometer","price","newPrice",
  "color","gearTransmission","transmissionType","driveType","interiorColor",
  "metallic","vehicleCondition","lastInspectionDate","inspectionPassed",
  "warranty","warrantyStartDate","duration","maxKm","doors","seats","hp","kw",
  "energyLabel","typeApproval","wheelbase","vin","emptyWeight","loadCapacity",
  "serialNumber","height","width","length","towingCapacityBraked","cubicCapacity",
  "co2Emission","cylinders","numberOfGears","emissionStandard","consumptionCity",
  "consumptionCountry","consumptionTotal","range","batteryCapacity",
  "batteryRentalMonth","powerConsumption","batteryOwnership",
  "chargingPlugTypeStandard","chargingPlugTypeFast","chargingPower",
  "combustionEnginePowerHp","electricMotorPowerHp","vehicleDescription",
  "equipment","extras","images","listingPlan","listingPaidAt",
  "listingExpiresAt","stripeSessionId",
]);

function sanitizeVehicleData(body: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(body)
      .filter(([k]) => VEHICLE_FIELDS.has(k))
      .map(([k, v]) => [k, v === "" ? undefined : v]),
  );
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
  listingPaidAt: true,
  listingPlan: true,
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
  constructor(private prisma: PrismaService) {}
  private async getSellerByUserId(userId: string) {
    const seller = await this.prisma.seller.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!seller) {
      throw new NotFoundException("Seller profile not found for this user");
    }
    return seller;
  }

  async getProfile(session: UserSession) {
    const user = await this.prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        seller: {
          select: {
            id: true,
            phoneNumber: true,
            streetAddress: true,
            zipCode: true,
            city: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return {
      data: {
        id: user.seller?.id ?? null,
        phoneNumber: user.seller?.phoneNumber ?? null,
        streetAddress: user.seller?.streetAddress ?? null,
        zipCode: user.seller?.zipCode ?? null,
        city: user.seller?.city ?? null,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
      },
    };
  }

  async updateProfile(session: UserSession, body: UpdateSellerProfileDto) {
    const sellerUpdateData: Record<string, unknown> = {};
    if (body.phoneNumber !== undefined) sellerUpdateData.phoneNumber = body.phoneNumber;
    if (body.streetAddress !== undefined) sellerUpdateData.streetAddress = body.streetAddress;
    if (body.zipCode !== undefined) sellerUpdateData.zipCode = body.zipCode;
    if (body.city !== undefined) sellerUpdateData.city = body.city;

    if (Object.keys(sellerUpdateData).length > 0) {
      await this.prisma.seller.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          phoneNumber: (sellerUpdateData.phoneNumber as string) ?? "",
          streetAddress: (sellerUpdateData.streetAddress as string) ?? "",
          zipCode: (sellerUpdateData.zipCode as string) ?? "",
          city: (sellerUpdateData.city as string) ?? "",
        },
        update: sellerUpdateData,
      });
    }

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
      this.prisma.vehicle.findMany({
        where,
        select: SELLER_VEHICLE_LIST_SELECT,
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

  async createVehicle(session: UserSession, body: CreateSellerVehicleDto) {
    const seller = await this.getSellerByUserId(session.user.id);
    const raw = body as Record<string, unknown>;

    const sellerUpdate: Record<string, unknown> = {};
    if (raw.phoneNumber) sellerUpdate.phoneNumber = raw.phoneNumber;
    if (raw.address) sellerUpdate.streetAddress = raw.address;
    if (raw.zipCode) sellerUpdate.zipCode = raw.zipCode;
    if (raw.city) sellerUpdate.city = raw.city;

    const [vehicle] = await this.prisma.$transaction([
      this.prisma.vehicle.create({
        data: {
          ...sanitizeVehicleData(raw),
          sellerId: seller.id,
          dealerId: undefined,
        } as any,
      }),
      ...(Object.keys(sellerUpdate).length
        ? [this.prisma.seller.update({ where: { id: seller.id }, data: sellerUpdate })]
        : []),
    ]);

    return { data: vehicle };
  }

  async getVehicle(session: UserSession, id: string) {
    const seller = await this.getSellerByUserId(session.user.id);

    const vehicle = await this.prisma.vehicle.findUnique({
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

    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      select: { id: true, sellerId: true, listingPaidAt: true, stripeSubscriptionId: true, status: true },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with id "${id}" not found`);
    }

    if (vehicle.sellerId !== seller.id) {
      throw new ForbiddenException("This vehicle does not belong to you");
    }

    const raw = body as Record<string, unknown>;

    // VIN is locked once the listing has been paid — prevents swapping vehicles under one plan
    if (vehicle.listingPaidAt && "vin" in raw && raw.vin !== undefined) {
      throw new ForbiddenException("VIN cannot be changed after the listing has been published");
    }

    const sanitized = sanitizeVehicleData(raw);

    // Update DB first so the webhook sees the correct status if it fires before we return
    const updated = await this.prisma.vehicle.update({
      where: { id },
      data: sanitized as never,
    });

    // Cancel Stripe subscription immediately when seller marks vehicle as sold
    if (sanitized.status === "SOLD" && vehicle.stripeSubscriptionId) {
      try {
        const stripe = await getStripe();
        if (stripe) await stripe.subscriptions.cancel(vehicle.stripeSubscriptionId);
      } catch { /* subscription may already be cancelled */ }
    }

    return { data: updated };
  }

  async deleteVehicle(session: UserSession, id: string) {
    const seller = await this.getSellerByUserId(session.user.id);

    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      select: { id: true, sellerId: true, stripeSubscriptionId: true },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with id "${id}" not found`);
    }

    if (vehicle.sellerId !== seller.id) {
      throw new ForbiddenException("This vehicle does not belong to you");
    }

    // Cancel active subscription so seller is not charged after deletion
    if (vehicle.stripeSubscriptionId) {
      try {
        const stripe = await getStripe();
        if (stripe) await stripe.subscriptions.cancel(vehicle.stripeSubscriptionId);
      } catch { /* subscription may already be cancelled */ }
    }

    await this.prisma.vehicle.delete({ where: { id } });

    return { data: { success: true } };
  }

  async getBilling(session: UserSession): Promise<any> {
    const stripe = await getStripe();

    const user = await this.prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });

    if (!stripe || !user?.stripeCustomerId) {
      return {
        data: {
          hasStripeCustomer: false,
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
        hasStripeCustomer: true,
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

  async createListingCheckout(
    session: UserSession,
    body: { vehicleId: string; planId: string; locale: string },
  ) {
    const stripe = await getStripe();
    if (!stripe) throw new BadRequestException("Stripe is not configured");

    const seller = await this.getSellerByUserId(session.user.id);
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: body.vehicleId },
      select: { id: true, sellerId: true },
    });
    if (!vehicle) throw new NotFoundException("Vehicle not found");
    if (vehicle.sellerId !== seller.id)
      throw new ForbiddenException("Vehicle does not belong to you");

    if (!["standard", "best_value"].includes(body.planId)) {
      throw new BadRequestException("Invalid plan");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true, email: true },
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_SELLER_URL ?? "https://seller.autovendo.ch";

    const commonParams = {
      customer: user?.stripeCustomerId ?? undefined,
      customer_email: !user?.stripeCustomerId ? user?.email : undefined,
      metadata: { vehicleId: body.vehicleId, planId: body.planId },
      success_url: `${baseUrl}/${body.locale}/dashboard/vehicles?listing=success`,
      cancel_url: `${baseUrl}/${body.locale}/dashboard/vehicles/${body.vehicleId}`,
    };

    let checkoutSession: Awaited<ReturnType<typeof stripe.checkout.sessions.create>>;

    if (body.planId === "standard") {
      // Recurring monthly subscription — CHF 19/month
      const standardPriceId = process.env.STRIPE_LISTING_STANDARD_PRICE_ID;
      if (!standardPriceId) throw new BadRequestException("Standard price not configured");

      checkoutSession = await stripe.checkout.sessions.create({
        ...commonParams,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: standardPriceId, quantity: 1 }],
      });
    } else {
      // One-time payment — CHF 49, listed until sold
      checkoutSession = await stripe.checkout.sessions.create({
        ...commonParams,
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "chf",
              unit_amount: 4900,
              product_data: { name: "AutoVendo Best Value Listing" },
            },
            quantity: 1,
          },
        ],
      });
    }

    await this.prisma.vehicle.update({
      where: { id: body.vehicleId },
      data: { listingPlan: body.planId, stripeSessionId: checkoutSession.id },
    });

    return { data: { url: checkoutSession.url } };
  }

  async handleListingWebhook(rawBody: Buffer, signature: string) {
    const stripe = await getStripe();
    if (!stripe) throw new BadRequestException("Stripe not configured");

    const secret = process.env.STRIPE_LISTING_WEBHOOK_SECRET;
    if (!secret) throw new BadRequestException("Webhook secret not configured");

    let event: any;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, secret);
    } catch (err: any) {
      throw new BadRequestException(`Webhook signature error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const stripeSession = event.data.object;
      const vehicleId = stripeSession.metadata?.vehicleId;
      const planId = stripeSession.metadata?.planId;

      if (!vehicleId) return { received: true };

      const vehicle = await this.prisma.vehicle.findUnique({
        where: { id: vehicleId },
        select: { stripeSessionId: true },
      });

      // Idempotency: skip if already processed
      if (vehicle?.stripeSessionId === stripeSession.id && vehicle?.stripeSessionId) {
        return { received: true };
      }

      const now = new Date();

      if (planId === "standard") {
        // Subscription — no expiry, store subscription ID
        await this.prisma.vehicle.update({
          where: { id: vehicleId },
          data: {
            status: "PUBLISHED",
            listingPlan: planId,
            listingPaidAt: now,
            listingExpiresAt: null,
            stripeSessionId: stripeSession.id,
            stripeSubscriptionId: stripeSession.subscription as string ?? null,
          },
        });
      } else {
        // Best Value one-time payment — no expiry, listed until sold
        await this.prisma.vehicle.update({
          where: { id: vehicleId },
          data: {
            status: "PUBLISHED",
            listingPlan: planId,
            listingPaidAt: now,
            listingExpiresAt: null,
            stripeSessionId: stripeSession.id,
          },
        });
      }
    }

    // Standard plan subscription cancelled — unpublish the vehicle
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const vehicle = await this.prisma.vehicle.findUnique({
        where: { stripeSubscriptionId: subscription.id },
        select: { id: true, status: true },
      });

      if (vehicle) {
        const alreadyTerminal = ["SOLD", "ARCHIVED", "BANNED"].includes(vehicle.status);
        await this.prisma.vehicle.update({
          where: { id: vehicle.id },
          data: {
            // Only move to DRAFT if not already in a terminal state
            ...(alreadyTerminal ? {} : { status: "DRAFT" }),
            stripeSubscriptionId: null,
          },
        });
      }
    }

    return { received: true };
  }

  async createBillingPortalSession(session: UserSession) {
    const stripe = await getStripe();

    if (!stripe) {
      throw new BadRequestException("Stripe is not configured");
    }

    const user = await this.prisma.user.findUnique({
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
