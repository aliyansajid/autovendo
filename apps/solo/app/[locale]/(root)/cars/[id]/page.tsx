import type { Metadata } from "next";
import { buildAlternates } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { getTranslations } from "next-intl/server";
import {
  getSellerVehicleFromApi,
  getSimilarSellerVehiclesFromApi,
} from "@/lib/api/vehicles";
import { notFound } from "next/navigation";
import { formatVehicleName } from "@repo/ui/lib/helpers/vehicle";
import { getImageUrl } from "@repo/ui/lib/helpers/image";
import { Button } from "@repo/ui/components/button";
import { Separator } from "@repo/ui/components/separator";
import { ImageGallery } from "../_components/image-gallery";
import {
  MapPin,
  Phone,
  Mail,
  Calendar,
  Fuel,
  Gauge,
  Zap,
  Store,
  Disc,
  BadgeCheck,
  Star,
} from "lucide-react";
import { SimilarListings } from "../_components/similar-listings";
import { ListingHeader } from "../_components/listing-header";
import { SellerSection } from "../_components/seller-section";
import { ReviewSection } from "../_components/review-section";
import { Card, CardContent } from "@repo/ui/components/card";
import { Link } from "@/i18n/routing";
import { StickyActionBar } from "../_components/sticky-action-bar";
import { EnergyLabel } from "../_components/energy-label";
import {
  formatNumber,
  formatPrice,
  formatKilometers,
  formatDateTime,
} from "@repo/ui/lib/helpers/format";
import type { ListingProps } from "@/types/vehicle";
import { KeyDetailCard } from "../_components/key-detail-card";
import { ListingSection } from "../_components/listing-section";
import { ListingDataGrid } from "../_components/listing-data-grid";
import { EquipmentList } from "../_components/equipment-list";

// ─── Data building helpers ────────────────────────────────────────────────────

/** Returns the value only if it's not null/undefined/empty. */
function f(value: string | null | undefined): string | undefined {
  return value != null && value !== "" ? value : undefined;
}

/** Format an integer with locale-aware thousands separator + suffix. */
function n(value: number | null | undefined, suffix = ""): string | undefined {
  if (value == null) return undefined;
  const formatted = formatNumber(value);
  return suffix ? `${formatted} ${suffix}` : formatted;
}

/** Format a float with locale-aware formatting + suffix. */
function fl(value: number | null | undefined, suffix = ""): string | undefined {
  if (value == null) return undefined;
  const formatted = new Intl.NumberFormat("de-CH", {
    maximumFractionDigits: 2,
  }).format(value);
  return suffix ? `${formatted} ${suffix}` : formatted;
}

/** Remove undefined entries from a Record. */
function filterObj(
  obj: Record<string, string | undefined>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(obj).filter((e): e is [string, string] => e[1] != null),
  );
}

// ─── SEO ──────────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}): Promise<Metadata> {
  const { id, locale } = await params;
  const item = await getSellerVehicleFromApi(id);
  if (!item) return {};

  const name = [item.make, item.model, item.version].filter(Boolean).join(" ");
  const priceFormatted = item.price
    ? `CHF ${item.price.toLocaleString("de-CH")}`
    : null;
  const kmFormatted = item.kilometer
    ? `${item.kilometer.toLocaleString("de-CH")} km`
    : null;

  const title = [name, priceFormatted, item.registrationYear]
    .filter(Boolean)
    .join(" – ");
  const description = [
    item.seller
      ? `${name} kaufen bei ${(item.seller as any).user?.name ?? ""}`
      : name,
    kmFormatted,
    item.fuelType,
    item.seller?.city ? `in ${item.seller.city}` : null,
    "auf autosolo.ch.",
  ]
    .filter(Boolean)
    .join(", ");

  const ogImage = item.images[0] ? getImageUrl(item.images[0]) : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImage
        ? [{ url: ogImage, alt: name }]
        : [{ url: "/web-app-manifest-512x512.png", width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    alternates: buildAlternates(locale, `/cars/${id}`),
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const t = await getTranslations("VehicleDetail");
  const tVehicle = await getTranslations("Vehicle");
  const { id, locale } = await params;
  const item = await getSellerVehicleFromApi(id);

  if (!item) notFound();

  const getLabel = (namespace: string, key: string | null | undefined) => {
    if (!key) return undefined;
    const normalizedKey = key
      .replace(/([a-z])([A-Z])/g, "$1_$2")
      .toUpperCase()
      .replace(/[-]/g, "_");
    const formattedKey = `${namespace}.${normalizedKey}`;
    // @ts-ignore
    return tVehicle.has(formattedKey) ? tVehicle(formattedKey) : key;
  };

  const title = formatVehicleName([item.make, item.model, item.version]);
  const price = item.price;
  const images = item.images.map((img: any) => getImageUrl(img));

  // unstable_cache serializes Date objects to strings — must re-wrap
  const toDate = (v: Date | string | null | undefined): Date | null =>
    v == null ? null : v instanceof Date ? v : new Date(v as string);

  // ── Derived formatted values ──
  const fuelLabel = item.fuelType
    ? getLabel("fuelTypes", item.fuelType)
    : undefined;
  const transmissionLabel = item.transmissionType
    ? getLabel("transmissionTypes", item.transmissionType)
    : item.gearTransmission
      ? getLabel("transmissionTypes", item.gearTransmission)
      : undefined;
  const powerLabel =
    item.kw != null || item.hp != null
      ? [
          item.kw != null ? `${formatNumber(item.kw)} kW` : null,
          item.hp != null ? `(${formatNumber(item.hp)} PS)` : null,
        ]
          .filter(Boolean)
          .join(" ")
      : undefined;

  // ── Data sections ──
  const basicData = filterObj({
    [t("basicDataKeys.bodyType")]: f(item.bodyType),
    [t("basicDataKeys.version")]: f(item.version),
    [t("basicDataKeys.vehicleType")]: item.vehicleType
      ? getLabel("types", item.vehicleType)
      : undefined,
    [t("basicDataKeys.condition")]: item.vehicleCondition
      ? getLabel("conditions", item.vehicleCondition)
      : undefined,
    [t("basicDataKeys.driveType")]: item.driveType
      ? getLabel("driveTypes", item.driveType)
      : undefined,
    [t("basicDataKeys.seats")]: n(item.seats),
    [t("basicDataKeys.doors")]: n(item.doors),
  });

  const vehicleHistory = filterObj({
    [t("vehicleHistoryKeys.kilometer")]: formatKilometers(item.kilometer),
    [t("vehicleHistoryKeys.firstRegistration")]:
      `${String(item.registrationMonth).padStart(2, "0")}/${item.registrationYear}`,
  });

  const lastInspectionDate = toDate(item.lastInspectionDate);
  const warrantyStartDate = toDate(item.warrantyStartDate);

  const inspectionAndWarranty = filterObj({
    [t("inspectionWarrantyKeys.lastInspection")]: lastInspectionDate
      ? formatDateTime(lastInspectionDate)
      : undefined,
    [t("inspectionWarrantyKeys.inspectionPassed")]:
      lastInspectionDate != null
        ? item.inspectionPassed
          ? t("yes")
          : t("no")
        : undefined,
    [t("inspectionWarrantyKeys.warrantyType")]: item.warranty
      ? getLabel("warranty", item.warranty)
      : undefined,
    [t("inspectionWarrantyKeys.warrantyFrom")]: warrantyStartDate
      ? formatDateTime(warrantyStartDate)
      : undefined,
    [t("inspectionWarrantyKeys.warrantyDuration")]:
      item.duration != null ? `${item.duration} ${t("months")}` : undefined,
    [t("inspectionWarrantyKeys.warrantyMaxKm")]: n(item.maxKm, "km"),
  });

  const technicalData = filterObj({
    [t("technicalDataKeys.power")]: powerLabel,
    [t("technicalDataKeys.transmission")]: transmissionLabel,
    [t("technicalDataKeys.cubicCapacity")]: n(item.cubicCapacity, "ccm"),
    [t("technicalDataKeys.gears")]: n(item.numberOfGears),
    [t("technicalDataKeys.cylinders")]: n(item.cylinders),
    [t("technicalDataKeys.emptyWeight")]: n(item.emptyWeight, "kg"),
    [t("technicalDataKeys.loadCapacity")]: n(item.loadCapacity, "kg"),
    [t("technicalDataKeys.wheelbase")]: n(item.wheelbase, "mm"),
    [t("technicalDataKeys.length")]: n(item.length, "mm"),
    [t("technicalDataKeys.width")]: n(item.width, "mm"),
    [t("technicalDataKeys.height")]: n(item.height, "mm"),
    [t("technicalDataKeys.towingCapacityBraked")]: n(
      item.towingCapacityBraked,
      "kg",
    ),
  });

  const energyData = filterObj({
    [t("energyConsumptionKeys.emissionStandard")]: item.emissionStandard
      ? getLabel("emissions", item.emissionStandard)
      : undefined,
    [t("energyConsumptionKeys.fuelType")]: fuelLabel,
    [t("energyConsumptionKeys.co2Emission")]: n(item.co2Emission, "g/km"),
    [t("energyConsumptionKeys.consumptionCity")]: fl(
      item.consumptionCity,
      "l/100km",
    ),
    [t("energyConsumptionKeys.consumptionCountry")]: fl(
      item.consumptionCountry,
      "l/100km",
    ),
    [t("energyConsumptionKeys.consumptionTotal")]: fl(
      item.consumptionTotal,
      "l/100km",
    ),
  });

  const electricData = filterObj({
    [t("electricDataKeys.range")]: n(item.range, "km"),
    [t("electricDataKeys.batteryCapacity")]: fl(item.batteryCapacity, "kWh"),
    [t("electricDataKeys.batteryRental")]:
      item.batteryRentalMonth != null
        ? `${formatNumber(item.batteryRentalMonth)} CHF/${t("months")}`
        : undefined,
    [t("electricDataKeys.powerConsumption")]: fl(
      item.powerConsumption,
      "kWh/100km",
    ),
    [t("electricDataKeys.batteryOwnership")]: item.batteryOwnership
      ? getLabel("batteryOwnership", item.batteryOwnership)
      : undefined,
    [t("electricDataKeys.chargingStandard")]: item.chargingPlugTypeStandard
      ? getLabel("chargingStandardAC", item.chargingPlugTypeStandard)
      : undefined,
    [t("electricDataKeys.chargingFast")]: item.chargingPlugTypeFast
      ? getLabel("chargingStandardDC", item.chargingPlugTypeFast)
      : undefined,
    [t("electricDataKeys.chargingPower")]: fl(item.chargingPower, "kW"),
    [t("electricDataKeys.combustionEngine")]:
      item.combustionEnginePowerHp != null
        ? `${formatNumber(item.combustionEnginePowerHp)} PS`
        : undefined,
    [t("electricDataKeys.electricMotor")]:
      item.electricMotorPowerHp != null
        ? `${formatNumber(item.electricMotorPowerHp)} PS`
        : undefined,
  });

  const colourAndUpholstery = filterObj({
    [t("colourUpholsteryKeys.exteriorColor")]: item.color
      ? getLabel("colors", item.color)
      : undefined,
    [t("colourUpholsteryKeys.interiorColor")]: item.interiorColor
      ? getLabel("colors", item.interiorColor)
      : undefined,
    [t("colourUpholsteryKeys.paint")]: item.metallic ? t("metallic") : t("uni"),
  });

  const identifiers = filterObj({
    [t("identifierKeys.vin")]: f(item.vin),
    [t("identifierKeys.serialNumber")]: f(item.serialNumber),
    [t("identifierKeys.typeApproval")]: f(item.typeApproval),
  });

  const equipmentList = item.equipment
    ? Object.entries(item.equipment as Record<string, unknown>)
        .filter(([_, v]) => v === true)
        .map(([k]) => getLabel("equipment", k) || k)
    : [];

  const extrasList =
    item.extras != null && typeof item.extras === "object"
      ? Object.entries(item.extras as Record<string, unknown>)
          .filter(([_, v]) => v === true)
          .map(([k]) => getLabel("extras", k) || k)
      : [];

  const description =
    item.description && item.description.trim().length > 0
      ? item.description
      : null;

  const sellerUser = (item.seller as any)?.user;

  const seller = {
    id: item.seller?.id ?? "",
    name: (item.seller as any)?.user?.name ?? "",
    address: item.seller
      ? `${item.seller.streetAddress}, ${item.seller.zipCode} ${item.seller.city}`
      : "",
    phone: item.seller?.phoneNumber ?? undefined,
    logo: (item.seller as any)?.user?.image ? getImageUrl((item.seller as any).user.image) : undefined,
    website: undefined as string | undefined,
    businessEmail: (item.seller as any)?.user?.email ?? undefined,
    description: undefined as string | undefined,
    openingHours: undefined as { day: string; hours: string }[] | undefined,
    isVerified: sellerUser?.emailVerified === true,
    rating: null as number | null,
    reviewCount: null as number | null,
  };

  const { vehicles: similarItems } = await getSimilarSellerVehiclesFromApi(item.id);

  const similarListings: ListingProps[] = similarItems.map((sim: any) => ({
    id: sim.id,
    title: `${sim.make} ${sim.model || ""}`.trim(),
    price: formatPrice(sim.price),
    details: [
      `${String(sim.registrationMonth).padStart(2, "0")}/${sim.registrationYear}`,
      formatKilometers(sim.kilometer),
      sim.fuelType ? getLabel("fuelTypes", sim.fuelType) : undefined,
    ].filter((d): d is string => d != null && d !== ""),
    garageName: sim.seller?.user?.name ?? "",
    garageId: sim.seller?.id ?? sim.id,
    garageLocation: sim.seller ? `${sim.seller.city}, CH` : "",
    badge: sim.vehicleCondition
      ? getLabel("conditions", sim.vehicleCondition)
      : undefined,
    image: getImageUrl(sim.images[0]),
  }));

  const vehicleSchema = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: title,
    brand: item.make ? { "@type": "Brand", name: item.make } : undefined,
    model: item.model ?? undefined,
    vehicleModelDate: item.registrationYear?.toString() ?? undefined,
    mileageFromOdometer: item.kilometer
      ? { "@type": "QuantitativeValue", value: item.kilometer, unitCode: "KMT" }
      : undefined,
    fuelType: fuelLabel ?? undefined,
    driveWheelConfiguration: item.driveType ?? undefined,
    vehicleTransmission: transmissionLabel ?? undefined,
    color: item.color ?? undefined,
    vehicleIdentificationNumber: item.vin ?? undefined,
    offers: {
      "@type": "Offer",
      price: item.price,
      priceCurrency: "CHF",
      availability: "https://schema.org/InStock",
      url: `https://autosolo.ch/${locale}/cars/${item.id}`,
      seller: {
        "@type": "Person",
        name: seller.name,
        address: {
          "@type": "PostalAddress",
          streetAddress: item.seller?.streetAddress ?? undefined,
          postalCode: item.seller?.zipCode ?? undefined,
          addressLocality: item.seller?.city ?? undefined,
          addressCountry: "CH",
        },
      },
    },
    image: images[0] ?? undefined,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "AutoSolo",
        item: `https://autosolo.ch/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name:
          locale === "fr" ? "Voitures" : locale === "it" ? "Auto" : "Fahrzeuge",
        item: `https://autosolo.ch/${locale}/cars`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: `https://autosolo.ch/${locale}/cars/${item.id}`,
      },
    ],
  };

  return (
    <div className="max-w-285 mx-auto px-4 py-12">
      <JsonLd data={vehicleSchema} />
      <JsonLd data={breadcrumbSchema} />
      <ListingHeader
        make={item.make}
        model={item.model || ""}
        trim={item.version || ""}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="lg:hidden space-y-3">
            <h1 className="text-2xl font-bold leading-tight">{title}</h1>
            <div className="text-3xl font-bold text-primary">
              {formatPrice(price)}
            </div>
          </div>

          <ImageGallery images={images} title={title} />

          {/* Key detail cards */}
          <Card>
            <CardContent className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              <KeyDetailCard
                icon={
                  <Gauge className="text-muted-foreground" strokeWidth={1.5} />
                }
                label={t("vehicleHistoryKeys.kilometer")}
                value={formatKilometers(item.kilometer)}
              />
              {powerLabel && (
                <KeyDetailCard
                  icon={
                    <Zap className="text-muted-foreground" strokeWidth={1.5} />
                  }
                  label={t("technicalDataKeys.power")}
                  value={powerLabel}
                />
              )}
              {fuelLabel && (
                <KeyDetailCard
                  icon={
                    <Fuel className="text-muted-foreground" strokeWidth={1.5} />
                  }
                  label={t("energyConsumptionKeys.fuelType")}
                  value={fuelLabel}
                />
              )}
              {transmissionLabel && (
                <KeyDetailCard
                  icon={
                    <Disc className="text-muted-foreground" strokeWidth={1.5} />
                  }
                  label={t("transmission")}
                  value={transmissionLabel}
                />
              )}
              <KeyDetailCard
                icon={
                  <Calendar
                    className="text-muted-foreground"
                    strokeWidth={1.5}
                  />
                }
                label={t("firstRegistration")}
                value={`${String(item.registrationMonth).padStart(2, "0")}/${item.registrationYear}`}
              />
              <KeyDetailCard
                icon={
                  <Store className="text-muted-foreground" strokeWidth={1.5} />
                }
                label={t("sellerType")}
                value={t("privateSeller")}
              />
            </CardContent>
          </Card>

          <div className="space-y-6">
            {Object.keys(basicData).length > 0 && (
              <ListingSection title={t("basicData")}>
                <ListingDataGrid data={basicData} />
              </ListingSection>
            )}

            <ListingSection title={t("vehicleHistory")}>
              <ListingDataGrid data={vehicleHistory} />
            </ListingSection>

            {Object.keys(inspectionAndWarranty).length > 0 && (
              <ListingSection title={t("inspectionWarranty")}>
                <ListingDataGrid data={inspectionAndWarranty} />
              </ListingSection>
            )}

            {Object.keys(technicalData).length > 0 && (
              <ListingSection title={t("technicalData")}>
                <ListingDataGrid data={technicalData} />
              </ListingSection>
            )}

            {(Object.keys(energyData).length > 0 || item.energyLabel) && (
              <ListingSection title={t("energyConsumption")}>
                {Object.keys(energyData).length > 0 && (
                  <ListingDataGrid data={energyData} />
                )}
                {item.energyLabel && (
                  <>
                    {Object.keys(energyData).length > 0 && (
                      <Separator className="my-4" />
                    )}
                    <div>
                      <h3 className="text-sm font-medium mb-4">
                        {t("energyEfficiency")}
                      </h3>
                      <EnergyLabel efficiencyClass={item.energyLabel} />
                    </div>
                  </>
                )}
              </ListingSection>
            )}

            {Object.keys(electricData).length > 0 && (
              <ListingSection title={t("electricData")}>
                <ListingDataGrid data={electricData} />
              </ListingSection>
            )}

            {Object.keys(colourAndUpholstery).length > 0 && (
              <ListingSection title={t("colourUpholstery")}>
                <ListingDataGrid data={colourAndUpholstery} />
              </ListingSection>
            )}

            {Object.keys(identifiers).length > 0 && (
              <ListingSection title={t("identifiers")}>
                <ListingDataGrid data={identifiers} />
              </ListingSection>
            )}

            {equipmentList.length > 0 && (
              <ListingSection title={t("equipment")}>
                <EquipmentList items={equipmentList} />
              </ListingSection>
            )}

            {extrasList.length > 0 && (
              <ListingSection title={t("extras")}>
                <EquipmentList items={extrasList} />
              </ListingSection>
            )}

            {description && (
              <ListingSection title={t("description")}>
                <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                  {(() => {
                    const norm = description
                      .replace(/\r\n/g, "\n")
                      .replace(/\r/g, "\n");
                    const parts = norm
                      .split(/\n\n+/.test(norm) ? /\n\n+/ : /\n/)
                      .map((p: string) => p.trim())
                      .filter(Boolean);
                    return parts.map((para: string, i: number) => (
                      <p key={i} className="whitespace-pre-line">
                        {para}
                      </p>
                    ));
                  })()}
                </div>
              </ListingSection>
            )}

            <SellerSection seller={seller} />

            {seller.rating != null && (
              <ReviewSection
                rating={seller.rating}
                count={seller.reviewCount ?? 0}
                reviews={[]}
                sellerId={seller.id}
              />
            )}

            <Separator className="my-12" />

            <SimilarListings listings={similarListings} />
          </div>
        </div>

        <div className="space-y-6 sticky top-20 self-start">
          <Card className="hidden lg:block">
            <CardContent className="space-y-3">
              <h1 className="text-xl font-bold">{title}</h1>
              <h2 className="text-2xl font-bold text-primary">
                {formatPrice(price)}
              </h2>
              {item.newPrice != null && item.newPrice > 0 && (
                <p className="text-sm text-muted-foreground">
                  {t("newPrice")} {formatPrice(item.newPrice)}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-bold">{seller.name}</h3>
                {seller.isVerified && (
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="size-4 text-primary" />
                    <span className="text-sm font-medium text-primary">
                      {t("verifiedSeller")}
                    </span>
                  </div>
                )}
                {seller.rating != null && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <div className="flex text-rating">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-4 ${i < Math.round(seller.rating!) ? "fill-rating text-rating" : "text-muted-foreground opacity-30 fill-current"}`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold">
                      {seller.rating.toFixed(1)}
                    </span>
                    {seller.reviewCount != null && (
                      <span className="text-muted-foreground">
                        {t("reviewCount", { count: seller.reviewCount })}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-muted p-2.5 rounded-lg">
                    <MapPin className="size-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {seller.address}
                  </p>
                </div>

                {seller.phone && (
                  <div className="flex items-center gap-3">
                    <div className="bg-muted p-2.5 rounded-lg">
                      <Phone className="size-4 text-muted-foreground" />
                    </div>
                    <Link
                      href={`tel:${seller.phone}`}
                      className="text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
                    >
                      {seller.phone}
                    </Link>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {seller.phone && (
                  <Button className="w-full" asChild>
                    <Link href={`tel:${seller.phone}`}>
                      <Phone />
                      {t("phone")}
                    </Link>
                  </Button>
                )}
                {seller.businessEmail && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`mailto:${seller.businessEmail}`}>
                      <Mail />
                      {t("contact")}
                    </Link>
                  </Button>
                )}
                <Button variant="link" className="w-full" asChild>
                  <Link href={`/cars?seller=${seller.id}`}>
                    {t("allVehicles")}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <StickyActionBar price={price} sellerPhone={seller.phone ?? ""} />
    </div>
  );
}
