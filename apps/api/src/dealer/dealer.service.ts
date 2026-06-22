import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { dealerProfileSchema } from "../validation/profile.validation";
import type {
  VehicleCreateInput,
  VehicleUpdateInput,
} from "../validation/vehicle.validation";
import { uploadImage, deleteImage } from "../storage/r2";
import { auth } from "../auth";

export class DealerVehiclesQueryDto {
  page?: string;
  pageSize?: string;
  sort?: string;
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
      image: true,
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

const ENUM_FIELDS = new Set([
  "fuelType",
  "gearTransmission",
  "transmissionType",
  "driveType",
  "interiorColor",
  "vehicleCondition",
  "bodyType",
  "color",
  "vehicleType",
  "status",
  "warranty",
  "energyLabel",
  "emissionStandard",
  "batteryOwnership",
  "chargingPlugTypeStandard",
  "chargingPlugTypeFast",
]);

const OPTIONAL_STRING_FIELDS = new Set([
  "vin",
  "vehicleDescription",
  "version",
  "typeApproval",
  "serialNumber",
]);

function sanitizeVehicleData(
  data: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (!VEHICLE_FIELDS.has(key)) continue;
    if (
      (ENUM_FIELDS.has(key) || OPTIONAL_STRING_FIELDS.has(key)) &&
      (value === "" || value === null)
    ) {
      result[key] = undefined;
    } else {
      result[key] = value;
    }
  }
  return result;
}

// Statuses a dealer may set. ARCHIVED/BANNED are reserved for admins/moderation.
const DEALER_SETTABLE_STATUS = new Set([
  "DRAFT",
  "PUBLISHED",
  "SOLD",
  "PAUSED",
]);

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
    const limit = Number(
      (plan?.limits as { vehicles?: number })?.vehicles ?? 0,
    );

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

  /**
   * Updates the dealer profile. Accepts JSON (web — image URLs already in body)
   * or multipart/form-data (mobile — `files` carries logo/cover/avatar and the
   * body may carry `name`/`email`). In the multipart case the API does the whole
   * job: uploads the images to R2, writes the Dealer + User rows via Prisma, and
   * proxies the email change to Better Auth — so the client makes one call.
   */
  async updateProfile(
    session: UserSession,
    body: Record<string, unknown>,
    files?: {
      logo?: Express.Multer.File[];
      coverImage?: Express.Multer.File[];
      avatar?: Express.Multer.File[];
    },
  ) {
    // Also pull the current image URLs so replaced files can be cleaned from R2.
    const dealer = await this.prisma.dealer.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        logo: true,
        coverImage: true,
        user: { select: { image: true } },
      },
    });
    if (!dealer) {
      throw new NotFoundException("Dealer profile not found for this user");
    }

    // openingHours arrives as an array (JSON) or a JSON string (multipart).
    let openingHours: unknown;
    const rawHours = body.openingHours;
    if (Array.isArray(rawHours)) openingHours = rawHours;
    else if (typeof rawHours === "string" && rawHours) {
      try {
        openingHours = JSON.parse(rawHours);
      } catch {
        openingHours = undefined;
      }
    }

    // Validate every client-sent field FIRST — before any R2 upload or DB write.
    // `name`/`email` belong to the User table; the rest are Dealer business
    // fields. Image URLs sent as strings (web/JSON path) are kept as-is; uploaded
    // files (multipart path) are handled only after validation passes.
    const candidate: Record<string, unknown> = {};
    for (const k of [
      "name",
      "email",
      "companyName",
      "description",
      "website",
      "streetAddress",
      "zipCode",
      "city",
      "uidNumber",
      "contactPerson",
      "phoneNumber",
      "businessEmail",
      "country",
    ]) {
      if (typeof body[k] === "string") candidate[k] = body[k];
    }
    if (typeof body.logo === "string") candidate.logo = body.logo;
    if (typeof body.coverImage === "string")
      candidate.coverImage = body.coverImage;
    if (openingHours !== undefined) candidate.openingHours = openingHours;

    const result = dealerProfileSchema.safeParse(candidate);
    if (!result.success) {
      throw new BadRequestException(
        result.error.issues[0]?.message ?? "Invalid profile data",
      );
    }
    const {
      name,
      email,
      openingHours: validatedHours,
      ...profileFields
    } = result.data;

    // Validation passed — now upload any new image files and delete the ones they
    // replace. Bytes were already type/size-checked by multer and are re-checked
    // (magic bytes) inside uploadImage.
    if (files?.logo?.[0]) {
      profileFields.logo = (
        await uploadImage(files.logo[0], `dealers/${dealer.id}/branding`)
      ).publicUrl;
      await deleteImage(dealer.logo);
    }
    if (files?.coverImage?.[0]) {
      profileFields.coverImage = (
        await uploadImage(files.coverImage[0], `dealers/${dealer.id}/branding`)
      ).publicUrl;
      await deleteImage(dealer.coverImage);
    }
    let avatarUrl: string | undefined;
    if (files?.avatar?.[0]) {
      avatarUrl = (
        await uploadImage(files.avatar[0], `dealers/${dealer.id}/profiles`)
      ).publicUrl;
    }

    const updated = await this.prisma.dealer.update({
      where: { id: dealer.id },
      data: {
        ...profileFields,
        ...(validatedHours
          ? {
              openingHours: {
                upsert: validatedHours.map((oh) => ({
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

    // The User table is Better Auth's — name/avatar go through auth.api.updateUser
    // and email through auth.api.changeEmail, never a direct Prisma write. (The
    // avatar file was uploaded to R2 above; Better Auth only stores the URL.)
    const token =
      (session as { session?: { token?: string } }).session?.token ?? "";
    const authHeaders = new Headers({
      cookie: `better-auth.session_token=${token}`,
    });

    const userData: { name?: string; image?: string } = {};
    if (name && name !== session.user.name) userData.name = name;
    if (avatarUrl) userData.image = avatarUrl;
    if (Object.keys(userData).length > 0) {
      await auth.api.updateUser({ body: userData, headers: authHeaders });
      // The new avatar is now stored — drop the one it replaced.
      if (avatarUrl) await deleteImage(dealer.user?.image);
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
}
