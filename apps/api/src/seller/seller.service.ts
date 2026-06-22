import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { sellerProfileSchema } from "../validation/profile.validation";
import {
  createVehicleSchema,
  updateVehicleSchema,
} from "../validation/vehicle.validation";
import { uploadImages, deleteImages } from "../storage/r2";
import { auth } from "../auth";

// The vehicle data is a JSON `data` field (multipart, alongside image files) or a
// plain JSON body (e.g. a status-only update). Returns the parsed object.
function parseVehicleBody(
  body: Record<string, unknown>,
): Record<string, unknown> {
  if (typeof body?.data === "string") {
    try {
      return JSON.parse(body.data) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return body ?? {};
}

export class SellerVehiclesQueryDto {
  page?: string;
  pageSize?: string;
  sort?: string;
}

// Fields a seller is allowed to write directly.
// NOTE: `status` and all payment/listing fields (listingPlan, listingPaidAt,
// listingExpiresAt, stripeSessionId, stripeSubscriptionId) are deliberately
// EXCLUDED — they are managed server-side only (status via validated
// transitions, payment fields exclusively by the Stripe webhook). This is the
// core defense against publishing a listing without paying.
const VEHICLE_FIELDS = new Set([
  "vehicleType",
  "make",
  "model",
  "version",
  "bodyType",
  "fuelType",
  "registrationMonth",
  "registrationYear",
  "kilometer",
  "price",
  "newPrice",
  "color",
  "gearTransmission",
  "transmissionType",
  "driveType",
  "interiorColor",
  "metallic",
  "vehicleCondition",
  "lastInspectionDate",
  "inspectionPassed",
  "warranty",
  "warrantyStartDate",
  "duration",
  "maxKm",
  "doors",
  "seats",
  "hp",
  "kw",
  "energyLabel",
  "typeApproval",
  "wheelbase",
  "vin",
  "emptyWeight",
  "loadCapacity",
  "serialNumber",
  "height",
  "width",
  "length",
  "towingCapacityBraked",
  "cubicCapacity",
  "co2Emission",
  "cylinders",
  "numberOfGears",
  "emissionStandard",
  "consumptionCity",
  "consumptionCountry",
  "consumptionTotal",
  "range",
  "batteryCapacity",
  "batteryRentalMonth",
  "powerConsumption",
  "batteryOwnership",
  "chargingPlugTypeStandard",
  "chargingPlugTypeFast",
  "chargingPower",
  "combustionEnginePowerHp",
  "electricMotorPowerHp",
  "vehicleDescription",
  "equipment",
  "extras",
  "images",
]);

function sanitizeVehicleData(body: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(body)
      .filter(([k]) => VEHICLE_FIELDS.has(k))
      .map(([k, v]) => [k, v === "" ? undefined : v]),
  );
}

// Statuses a seller may set directly. PUBLISHED is gated on a valid paid listing
// (see resolveSellerStatus); the webhook is the only other way to reach it.
const SELLER_SETTABLE_STATUS = new Set(["DRAFT", "PUBLISHED", "SOLD"]);

/**
 * Validates a seller-requested status transition and returns the status to
 * persist. Throws if the transition is not allowed.
 *
 * A seller can only PUBLISH a listing that has actually been paid for:
 *  - any plan: `listingPaidAt` must be set (only the webhook sets it),
 *  - "standard" (CHF 19/mo): the Stripe subscription must still be active
 *    (the webhook nulls `stripeSubscriptionId` when it is cancelled),
 *  - "best_value" (CHF 49 until sold): a sold listing is consumed and cannot
 *    be re-published without a new purchase.
 */
function resolveSellerStatus(
  vehicle: {
    status: string;
    listingPaidAt: Date | null;
    listingPlan: string | null;
    stripeSubscriptionId: string | null;
  },
  next: string,
): string {
  if (!SELLER_SETTABLE_STATUS.has(next)) {
    throw new ForbiddenException(`Status "${next}" cannot be set`);
  }

  if (next === "PUBLISHED") {
    if (!vehicle.listingPaidAt) {
      throw new ForbiddenException(
        "This listing must be paid for before it can be published",
      );
    }
    if (vehicle.listingPlan === "standard" && !vehicle.stripeSubscriptionId) {
      throw new ForbiddenException(
        "The subscription for this listing is no longer active; please renew to publish",
      );
    }
    if (vehicle.listingPlan === "best_value" && vehicle.status === "SOLD") {
      throw new ForbiddenException(
        "This one-time listing has already been sold; purchase a new listing to republish",
      );
    }
  }

  return next;
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

  /**
   * Updates the seller profile. The API does the whole job in one call: the
   * contact fields go to the Seller table (Prisma upsert), `name`/avatar to the
   * User table, and an `email` change is proxied to Better Auth (confirmation
   * flow). Seller has no images, so this stays JSON.
   */
  async updateProfile(session: UserSession, body: Record<string, unknown>) {
    // Validate everything the client may send (schema is .partial()). `name` and
    // `email` belong to the User table; the rest are Seller contact fields.
    const candidate: Record<string, unknown> = {};
    for (const k of [
      "name",
      "email",
      "phoneNumber",
      "streetAddress",
      "zipCode",
      "city",
    ]) {
      if (typeof body[k] === "string") candidate[k] = body[k];
    }
    const result = sellerProfileSchema.safeParse(candidate);
    if (!result.success) {
      throw new BadRequestException(
        result.error.issues[0]?.message ?? "Invalid profile data",
      );
    }
    const { name, email, ...sellerUpdateData } = result.data;

    if (Object.keys(sellerUpdateData).length > 0) {
      await this.prisma.seller.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          phoneNumber: sellerUpdateData.phoneNumber ?? "",
          streetAddress: sellerUpdateData.streetAddress ?? "",
          zipCode: sellerUpdateData.zipCode ?? "",
          city: sellerUpdateData.city ?? "",
        },
        update: sellerUpdateData,
      });
    }

    // The User table is Better Auth's — name goes through auth.api.updateUser and
    // email through auth.api.changeEmail, never a direct Prisma write. Each is
    // called only when the value actually changed.
    const token =
      (session as { session?: { token?: string } }).session?.token ?? "";
    const authHeaders = new Headers({
      cookie: `better-auth.session_token=${token}`,
    });

    if (name && name !== session.user.name) {
      await auth.api.updateUser({ body: { name }, headers: authHeaders });
    }
    if (email && email !== session.user.email) {
      await auth.api.changeEmail({
        body: {
          newEmail: email,
          callbackURL:
            process.env.NEXT_PUBLIC_APP_URL ?? "https://autovendo.ch",
        },
        headers: authHeaders,
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

  async createVehicle(
    session: UserSession,
    body: Record<string, unknown>,
    files: Express.Multer.File[],
  ) {
    const seller = await this.getSellerByUserId(session.user.id);

    // Validate the vehicle data (ranges/enums mirror the DB CHECK constraints).
    const result = createVehicleSchema.safeParse(parseVehicleBody(body));
    if (!result.success) {
      throw new BadRequestException(
        result.error.issues[0]?.message ?? "Invalid vehicle data",
      );
    }
    const raw = result.data as Record<string, unknown>;

    // 5–25 images total (kept keys + newly uploaded files).
    const existing = (raw.existingImages as string[] | undefined) ?? [];
    const total = existing.length + files.length;
    if (total < 5 || total > 25) {
      throw new BadRequestException("A listing needs between 5 and 25 images");
    }
    const uploaded = await uploadImages(files, "vehicles");

    // Allowlist strips non-vehicle fields; we set the final image keys ourselves.
    const data = sanitizeVehicleData(raw);
    data.images = [...existing, ...uploaded.map((u) => u.key)];

    const sellerUpdate: Record<string, unknown> = {};
    if (raw.phoneNumber) sellerUpdate.phoneNumber = raw.phoneNumber;
    if (raw.address) sellerUpdate.streetAddress = raw.address;
    if (raw.zipCode) sellerUpdate.zipCode = raw.zipCode;
    if (raw.city) sellerUpdate.city = raw.city;

    const [vehicle] = await this.prisma.$transaction([
      this.prisma.vehicle.create({
        data: {
          ...data,
          // Always created as a draft. Publishing happens only after payment is
          // confirmed by the Stripe webhook — a client-supplied status/paid
          // field is ignored entirely (it is not in the writable allowlist).
          status: "DRAFT",
          sellerId: seller.id,
          dealerId: undefined,
        } as any,
      }),
      ...(Object.keys(sellerUpdate).length
        ? [
            this.prisma.seller.update({
              where: { id: seller.id },
              data: sellerUpdate,
            }),
          ]
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
    body: Record<string, unknown>,
    files: Express.Multer.File[],
  ) {
    const seller = await this.getSellerByUserId(session.user.id);

    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      select: {
        id: true,
        sellerId: true,
        listingPaidAt: true,
        listingPlan: true,
        stripeSubscriptionId: true,
        status: true,
        images: true,
      },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with id "${id}" not found`);
    }

    if (vehicle.sellerId !== seller.id) {
      throw new ForbiddenException("This vehicle does not belong to you");
    }

    const result = updateVehicleSchema.safeParse(parseVehicleBody(body));
    if (!result.success) {
      throw new BadRequestException(
        result.error.issues[0]?.message ?? "Invalid vehicle data",
      );
    }
    const raw = result.data as Record<string, unknown>;

    // VIN is locked once the listing has been paid — prevents swapping vehicles under one plan
    if (vehicle.listingPaidAt && "vin" in raw && raw.vin !== undefined) {
      throw new ForbiddenException(
        "VIN cannot be changed after the listing has been published",
      );
    }

    // Allowlist strips non-vehicle fields.
    const sanitized = sanitizeVehicleData(raw);

    // Images are only recomputed when the client sent the intended set
    // (`existingImages`) or new files — a status-only update leaves them untouched.
    let removedImages: string[] = [];
    if (Array.isArray(raw.existingImages) || files.length > 0) {
      const existing = (raw.existingImages as string[] | undefined) ?? [];
      const total = existing.length + files.length;
      if (total < 5 || total > 25) {
        throw new BadRequestException("A listing needs between 5 and 25 images");
      }
      const uploaded = await uploadImages(files, "vehicles");
      sanitized.images = [...existing, ...uploaded.map((u) => u.key)];
      removedImages = (vehicle.images ?? []).filter((k) => !existing.includes(k));
    }

    // Status is never taken from the data allowlist — it goes through an explicit,
    // validated transition so a listing can't be published without payment.
    if (raw.status !== undefined && raw.status !== vehicle.status) {
      sanitized.status = resolveSellerStatus(vehicle, String(raw.status));
    }

    // Update DB first so the webhook sees the correct status if it fires before we return
    const updated = await this.prisma.vehicle.update({
      where: { id },
      data: sanitized as never,
    });

    // The DB row is updated — now drop the images it no longer references.
    if (removedImages.length) await deleteImages(removedImages);

    // Cancel Stripe subscription immediately when seller marks vehicle as sold
    if (sanitized.status === "SOLD" && vehicle.stripeSubscriptionId) {
      try {
        const stripe = await getStripe();
        if (stripe)
          await stripe.subscriptions.cancel(vehicle.stripeSubscriptionId);
      } catch {
        /* subscription may already be cancelled */
      }
    }

    return { data: updated };
  }

  async deleteVehicle(session: UserSession, id: string) {
    const seller = await this.getSellerByUserId(session.user.id);

    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      select: { id: true, sellerId: true, stripeSubscriptionId: true, images: true },
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
        if (stripe)
          await stripe.subscriptions.cancel(vehicle.stripeSubscriptionId);
      } catch {
        /* subscription may already be cancelled */
      }
    }

    await this.prisma.vehicle.delete({ where: { id } });

    // Clean up the listing's images from R2.
    await deleteImages(vehicle.images ?? []);

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

    let checkoutSession: Awaited<
      ReturnType<typeof stripe.checkout.sessions.create>
    >;

    if (body.planId === "standard") {
      // Recurring monthly subscription — CHF 19/month
      const standardPriceId = process.env.STRIPE_LISTING_STANDARD_PRICE_ID;
      if (!standardPriceId)
        throw new BadRequestException("Standard price not configured");

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
      if (
        vehicle?.stripeSessionId === stripeSession.id &&
        vehicle?.stripeSessionId
      ) {
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
            stripeSubscriptionId:
              (stripeSession.subscription as string) ?? null,
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
        const alreadyTerminal = ["SOLD", "ARCHIVED", "BANNED"].includes(
          vehicle.status,
        );
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
