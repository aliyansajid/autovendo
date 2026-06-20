import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import type { DealerProfileInput } from "../validation/profile.validation";
import type {
  VehicleCreateInput,
  VehicleUpdateInput,
} from "../validation/vehicle.validation";
import { uploadImage } from "../storage/r2";

export class DealerVehiclesQueryDto {
  page?: string;
  pageSize?: string;
  sort?: string;
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

// `status` is intentionally excluded — it is set via a validated transition that
// enforces the dealer's subscription and listing quota (see resolveDealerStatus
// / getEntitlement). Everything else is plain listing data.
const VEHICLE_FIELDS = new Set([
  "vehicleType", "make", "model", "version", "bodyType", "fuelType",
  "registrationMonth", "registrationYear", "kilometer", "price", "newPrice",
  "color", "gearTransmission", "transmissionType", "driveType", "interiorColor",
  "metallic", "vehicleCondition", "lastInspectionDate", "inspectionPassed",
  "warranty", "warrantyStartDate", "duration", "maxKm", "doors", "seats",
  "hp", "kw", "energyLabel", "typeApproval", "wheelbase", "vin", "emptyWeight",
  "loadCapacity", "serialNumber", "height", "width", "length",
  "towingCapacityBraked", "cubicCapacity", "co2Emission", "cylinders",
  "numberOfGears", "emissionStandard", "consumptionCity", "consumptionCountry",
  "consumptionTotal", "range", "batteryCapacity", "batteryRentalMonth",
  "powerConsumption", "batteryOwnership", "chargingPlugTypeStandard",
  "chargingPlugTypeFast", "chargingPower", "combustionEnginePowerHp",
  "electricMotorPowerHp", "vehicleDescription", "equipment", "extras", "images",
]);

const ENUM_FIELDS = new Set([
  "fuelType", "gearTransmission", "transmissionType", "driveType",
  "interiorColor", "vehicleCondition", "bodyType", "color",
  "vehicleType", "status", "warranty", "energyLabel", "emissionStandard",
  "batteryOwnership", "chargingPlugTypeStandard", "chargingPlugTypeFast",
]);

const OPTIONAL_STRING_FIELDS = new Set([
  "vin", "vehicleDescription", "version", "typeApproval", "serialNumber",
]);

function sanitizeVehicleData(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (!VEHICLE_FIELDS.has(key)) continue;
    if ((ENUM_FIELDS.has(key) || OPTIONAL_STRING_FIELDS.has(key)) && (value === "" || value === null)) {
      result[key] = undefined;
    } else {
      result[key] = value;
    }
  }
  return result;
}

// Statuses a dealer may set. ARCHIVED/BANNED are reserved for admins/moderation.
const DEALER_SETTABLE_STATUS = new Set(["DRAFT", "PUBLISHED", "SOLD", "PAUSED"]);

function resolveDealerStatus(next: string): string {
  if (!DEALER_SETTABLE_STATUS.has(next)) {
    throw new ForbiddenException(`Status "${next}" cannot be set`);
  }
  return next;
}

async function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  const { default: Stripe } = await import("stripe");
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

@Injectable()
export class DealerService {
  constructor(private prisma: PrismaService) {}
  private async getDealerByUserId(userId: string) {
    const dealer = await this.prisma.dealer.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!dealer) {
      throw new NotFoundException("Dealer profile not found for this user");
    }
    return dealer;
  }

  /**
   * Resolves the dealer's current entitlement from their active subscription.
   * `limit` is the number of PUBLISHED listings their plan allows.
   */
  private async getEntitlement(
    userId: string,
  ): Promise<{ active: boolean; limit: number }> {
    const sub = await this.prisma.subscription.findFirst({
      where: {
        referenceId: userId,
        status: { in: ["active", "trialing"] },
      },
      orderBy: { periodEnd: "desc" },
    });

    if (!sub) return { active: false, limit: 0 };

    const plans = await this.prisma.plan.findMany();
    const plan = plans.find(
      (p) => p.name.toLowerCase() === sub.plan.toLowerCase(),
    );
    const limit = Number((plan?.limits as { vehicles?: number })?.vehicles ?? 0);

    return { active: true, limit };
  }

  /**
   * Throws unless the dealer has an active subscription with quota left to
   * publish one more listing. `excludeVehicleId` skips the vehicle being updated
   * so re-publishing it doesn't count against itself.
   */
  private async assertCanPublish(
    userId: string,
    dealerId: string,
    excludeVehicleId?: string,
  ) {
    const { active, limit } = await this.getEntitlement(userId);
    if (!active) {
      throw new ForbiddenException(
        "An active subscription is required to publish listings",
      );
    }
    const publishedCount = await this.prisma.vehicle.count({
      where: {
        dealerId,
        status: "PUBLISHED",
        ...(excludeVehicleId ? { id: { not: excludeVehicleId } } : {}),
      },
    });
    if (publishedCount >= limit) {
      throw new ForbiddenException(
        "You have reached the listing quota for your plan. Upgrade your plan to publish more vehicles.",
      );
    }
  }

  async getProfile(session: UserSession) {
    const dealer = await this.prisma.dealer.findUnique({
      where: { userId: session.user.id },
      select: DEALER_PROFILE_SELECT,
    });

    if (!dealer) {
      throw new NotFoundException("Dealer profile not found");
    }

    return { data: dealer };
  }

  async updateProfile(session: UserSession, body: DealerProfileInput) {
    const dealer = await this.getDealerByUserId(session.user.id);

    const { openingHours, ...profileFields } = body;
    // Body is already validated by ZodValidationPipe at the controller boundary
    // (which also strips `image`, saved separately via Better Auth).

    const updated = await this.prisma.dealer.update({
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

  /**
   * Uploads a dealer branding/profile image through the API to R2, scoped to the
   * dealer's own key prefix. `type` is "branding" (logo/cover) or "profiles"
   * (avatar). Returns the public CDN URL to store on the profile.
   */
  async uploadProfileImage(
    session: UserSession,
    type: string,
    file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }
    if (type !== "branding" && type !== "profiles") {
      throw new BadRequestException("Invalid image type");
    }
    const dealer = await this.getDealerByUserId(session.user.id);
    const { publicUrl } = await uploadImage(
      file,
      `dealers/${dealer.id}/${type}`,
    );
    return { data: { publicUrl } };
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

  async createVehicle(session: UserSession, body: VehicleCreateInput) {
    const dealer = await this.getDealerByUserId(session.user.id);
    const raw = body as Record<string, unknown>;

    // Body validated by ZodValidationPipe; allowlist strips non-vehicle fields.
    const validated = sanitizeVehicleData(raw);

    // Status comes through a validated transition, never the data allowlist.
    // Default to DRAFT so an omitted/forged status can never auto-publish.
    const status = resolveDealerStatus(
      raw.status !== undefined ? String(raw.status) : "DRAFT",
    );

    // Publishing requires an active subscription with remaining quota — enforced
    // here so a direct API call can't exceed the plan limit.
    if (status === "PUBLISHED") {
      await this.assertCanPublish(session.user.id, dealer.id);
    }

    const vehicle = await this.prisma.vehicle.create({
      data: {
        ...validated,
        status,
        dealerId: dealer.id,
        sellerId: undefined,
      } as any,
    });

    return { data: vehicle };
  }

  async getVehicle(session: UserSession, id: string) {
    const dealer = await this.getDealerByUserId(session.user.id);

    const vehicle = await this.prisma.vehicle.findUnique({
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
    body: VehicleUpdateInput,
  ) {
    const dealer = await this.getDealerByUserId(session.user.id);

    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      select: { id: true, dealerId: true, status: true },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with id "${id}" not found`);
    }

    if (vehicle.dealerId !== dealer.id) {
      throw new ForbiddenException("This vehicle does not belong to you");
    }

    const raw = body as Record<string, unknown>;
    // Body validated by ZodValidationPipe; allowlist strips non-vehicle fields.
    const data = sanitizeVehicleData(raw);

    // Validate any status change; enforce subscription + quota when (re)publishing.
    if (raw.status !== undefined && raw.status !== vehicle.status) {
      const next = resolveDealerStatus(String(raw.status));
      if (next === "PUBLISHED") {
        await this.assertCanPublish(session.user.id, dealer.id, id);
      }
      data.status = next;
    }

    const updated = await this.prisma.vehicle.update({
      where: { id },
      data: data as never,
    });

    return { data: updated };
  }

  async deleteVehicle(session: UserSession, id: string) {
    const dealer = await this.getDealerByUserId(session.user.id);

    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      select: { id: true, dealerId: true },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with id "${id}" not found`);
    }

    if (vehicle.dealerId !== dealer.id) {
      throw new ForbiddenException("This vehicle does not belong to you");
    }

    await this.prisma.vehicle.delete({ where: { id } });

    return { data: { success: true } };
  }

  async getSubscription(session: UserSession): Promise<any> {
    const stripe = await getStripe();

    const user = await this.prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });

    if (!stripe || !user?.stripeCustomerId) {
      // Return mock/empty data when Stripe is not configured
      const subscriptions = await this.prisma.subscription.findMany({
        where: { referenceId: session.user.id },
      });

      const plans = await this.prisma.plan.findMany({
        orderBy: { price: "asc" },
      });

      const dealer = await this.getDealerByUserId(session.user.id);
      // Quota is consumed by PUBLISHED (visible) listings — matches enforcement.
      const vehicleCount = await this.prisma.vehicle.count({
        where: { dealerId: dealer.id, status: "PUBLISHED" },
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
      this.prisma.subscription.findMany({
        where: { referenceId: session.user.id },
      }),
      this.prisma.plan.findMany({ orderBy: { price: "asc" } }),
    ]);

    const dealer = await this.getDealerByUserId(session.user.id);
    const vehicleCount = await this.prisma.vehicle.count({
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

    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException(`Plan with id "${planId}" not found`);
    }

    const user = await this.prisma.user.findUnique({
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
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription`,
    });

    return { data: { url: portalSession.url } };
  }
}
