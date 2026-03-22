export const dynamic = "force-dynamic";

import {
  getVehicleCached,
  getSimilarVehicles,
} from "@/app/actions/vehicles.actions";
import { notFound } from "next/navigation";
import { formatVehicleName } from "@/lib/helpers/vehicle";
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
import { Card, CardContent } from "@repo/ui/src/components/card";
import Link from "next/link";
import { StickyActionBar } from "../_components/sticky-action-bar";
import { EnergyLabel } from "../_components/energy-label";
import {
  DAY_LABELS,
  formatNumber,
  formatPrice,
  formatKilometers,
} from "@/lib/helpers/format";
import type { ListingProps } from "@/types/vehicle";
import {
  FUEL_LABELS,
  TRANSMISSION_LABELS,
  DRIVE_LABELS,
  CONDITION_LABELS,
  VEHICLE_TYPE_LABELS,
  COLOR_LABELS,
  BATTERY_OWNERSHIP_LABELS,
  CHARGING_STANDARD_LABELS,
  CHARGING_FAST_LABELS,
  WARRANTY_LABELS,
  EMISSION_LABELS,
} from "@/lib/constants/vehicle-constants";
import { KeyDetailCard } from "../_components/key-detail-card";
import { ListingSection } from "../_components/listing-section";
import { ListingDataGrid } from "../_components/listing-data-grid";
import { EquipmentList } from "../_components/equipment-list";

// ─── Data building helpers ────────────────────────────────────────────────────

/** Returns the value only if it's not null/undefined/empty. */
function f(value: string | null | undefined): string | undefined {
  return value != null && value !== "" ? value : undefined;
}

/** Format an integer with de-CH thousands separator + suffix. */
function n(value: number | null | undefined, suffix = ""): string | undefined {
  if (value == null) return undefined;
  const formatted = formatNumber(value);
  return suffix ? `${formatted} ${suffix}` : formatted;
}

/** Format a float with de-CH locale + suffix. */
function fl(value: number | null | undefined, suffix = ""): string | undefined {
  if (value == null) return undefined;
  const formatted = value.toLocaleString("de-CH", { maximumFractionDigits: 2 });
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getVehicleCached(id);

  if (!item) notFound();

  const r2Domain = process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN || "";
  const getFullImageUrl = (key: string | undefined) => {
    if (!key) return "/placeholder-car.jpg";
    if (key.startsWith("http")) return key;
    return `${r2Domain}/${key.startsWith("/") ? key.slice(1) : key}`;
  };

  const title = formatVehicleName([item.make, item.model, item.version]);
  const price = item.price;
  const images = item.images.map(getFullImageUrl);

  // unstable_cache serializes Date objects to strings — must re-wrap
  const toDate = (v: Date | string | null | undefined): Date | null =>
    v == null ? null : v instanceof Date ? v : new Date(v as string);

  // ── Derived formatted values ──
  const fuelLabel = item.fuelType
    ? (FUEL_LABELS[item.fuelType] ?? item.fuelType)
    : undefined;
  const transmissionLabel = item.transmissionType
    ? (TRANSMISSION_LABELS[item.transmissionType] ?? item.transmissionType)
    : item.gearTransmission
      ? (TRANSMISSION_LABELS[item.gearTransmission] ?? item.gearTransmission)
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
    Karosserie: f(item.bodyType),
    Ausführung: f(item.version),
    Fahrzeugtyp: item.vehicleType
      ? (VEHICLE_TYPE_LABELS[item.vehicleType] ?? item.vehicleType)
      : undefined,
    Zustand: item.vehicleCondition
      ? (CONDITION_LABELS[item.vehicleCondition] ?? item.vehicleCondition)
      : undefined,
    Antrieb: item.driveType
      ? (DRIVE_LABELS[item.driveType] ?? item.driveType)
      : undefined,
    Sitzplätze: n(item.seats),
    Türen: n(item.doors),
    "Angebots-Nr.": item.id.slice(-8),
  });

  const vehicleHistory = filterObj({
    Kilometerstand: formatKilometers(item.kilometer),
    Erstzulassung: `${String(item.registrationMonth).padStart(2, "0")}/${item.registrationYear}`,
  });

  const lastInspectionDate = toDate(item.lastInspectionDate);
  const warrantyStartDate = toDate(item.warrantyStartDate);

  const inspectionAndWarranty = filterObj({
    "Letzte MFK": lastInspectionDate
      ? lastInspectionDate.toLocaleDateString("de-CH")
      : undefined,
    "MFK bestanden":
      lastInspectionDate != null
        ? item.inspectionPassed
          ? "Ja"
          : "Nein"
        : undefined,
    Garantieart: item.warranty
      ? (WARRANTY_LABELS[item.warranty] ?? item.warranty)
      : undefined,
    "Garantie ab": warrantyStartDate
      ? warrantyStartDate.toLocaleDateString("de-CH")
      : undefined,
    Garantiedauer:
      item.duration != null ? `${item.duration} Monate` : undefined,
    "Garantie max. km": n(item.maxKm, "km"),
  });

  const technicalData = filterObj({
    Leistung: powerLabel,
    Getriebe: transmissionLabel,
    Hubraum: n(item.cubicCapacity, "ccm"),
    Gänge: n(item.numberOfGears),
    Zylinder: n(item.cylinders),
    Leergewicht: n(item.emptyWeight, "kg"),
    Nutzlast: n(item.loadCapacity, "kg"),
    Radstand: n(item.wheelbase, "mm"),
    Länge: n(item.length, "mm"),
    Breite: n(item.width, "mm"),
    Höhe: n(item.height, "mm"),
    "Anhängelast gebremst": n(item.towingCapacityBraked, "kg"),
  });

  const energyData = filterObj({
    Schadstoffklasse: item.emissionStandard
      ? (EMISSION_LABELS[item.emissionStandard] ?? item.emissionStandard)
      : undefined,
    Treibstoff: fuelLabel,
    "CO₂-Emissionen (komb.)": n(item.co2Emission, "g/km"),
    "Verbrauch Stadt": fl(item.consumptionCity, "l/100km"),
    "Verbrauch Land": fl(item.consumptionCountry, "l/100km"),
    "Verbrauch kombiniert": fl(item.consumptionTotal, "l/100km"),
  });

  const electricData = filterObj({
    Reichweite: n(item.range, "km"),
    Batteriekapazität: fl(item.batteryCapacity, "kWh"),
    Batteriemiete:
      item.batteryRentalMonth != null
        ? `${formatNumber(item.batteryRentalMonth)} CHF/Monat`
        : undefined,
    Stromverbrauch: fl(item.powerConsumption, "kWh/100km"),
    Batterieeigentum: item.batteryOwnership
      ? (BATTERY_OWNERSHIP_LABELS[item.batteryOwnership] ??
        item.batteryOwnership)
      : undefined,
    "Ladeanschluss (Standard)": item.chargingPlugTypeStandard
      ? (CHARGING_STANDARD_LABELS[item.chargingPlugTypeStandard] ??
        item.chargingPlugTypeStandard)
      : undefined,
    Schnellladeanschluss: item.chargingPlugTypeFast
      ? (CHARGING_FAST_LABELS[item.chargingPlugTypeFast] ??
        item.chargingPlugTypeFast)
      : undefined,
    Ladeleistung: fl(item.chargingPower, "kW"),
    Verbrennungsmotor:
      item.combustionEnginePowerHp != null
        ? `${formatNumber(item.combustionEnginePowerHp)} PS`
        : undefined,
    "E-Motor":
      item.electricMotorPowerHp != null
        ? `${formatNumber(item.electricMotorPowerHp)} PS`
        : undefined,
  });

  const colourAndUpholstery = filterObj({
    Außenfarbe: item.color
      ? (COLOR_LABELS[item.color] ?? item.color)
      : undefined,
    Innenfarbe: item.interiorColor
      ? (COLOR_LABELS[item.interiorColor] ?? item.interiorColor)
      : undefined,
    Lackierung: item.metallic ? "Metallic" : "Uni",
  });

  const identifiers = filterObj({
    FIN: f(item.vin),
    Seriennummer: f(item.serialNumber),
    Typengenehmigung: f(item.typeApproval),
  });

  const equipmentList = item.equipment
    ? Object.entries(item.equipment as Record<string, unknown>)
        .filter(([_, v]) => v === true)
        .map(([k]) => k.replace(/([A-Z])/g, " $1").trim())
    : [];

  const extrasList =
    item.extras != null && typeof item.extras === "object"
      ? Object.entries(item.extras as Record<string, unknown>)
          .filter(([_, v]) => v === true)
          .map(([k]) => k.replace(/([A-Z])/g, " $1").trim())
      : [];

  const description =
    item.vehicleDescription && item.vehicleDescription.trim().length > 0
      ? item.vehicleDescription
      : null;

  const dealerWithHours = item.dealer as typeof item.dealer & {
    openingHours?: Array<{
      day: string;
      openTime: Date | string | null;
      closeTime: Date | string | null;
      isOpen: boolean;
    }>;
  };
  const openingHours =
    dealerWithHours.openingHours?.map((oh) => {
      const open = toDate(oh.openTime);
      const close = toDate(oh.closeTime);
      return {
        day: DAY_LABELS[oh.day] ?? oh.day,
        hours:
          oh.isOpen && open != null && close != null
            ? `${open.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" })} – ${close.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" })}`
            : "Geschlossen",
      };
    }) ?? [];

  const dealerUser = (
    item.dealer as typeof item.dealer & { user?: { emailVerified: boolean } }
  ).user;

  const seller = {
    id: item.dealer.id,
    name: item.dealer.companyName,
    address: `${item.dealer.streetAddress}, ${item.dealer.zipCode} ${item.dealer.city}`,
    phone: item.dealer.phoneNumber ?? undefined,
    logo: item.dealer.logo ? getFullImageUrl(item.dealer.logo) : undefined,
    website: item.dealer.website ?? undefined,
    contactPerson: item.dealer.contactPerson ?? undefined,
    businessEmail: item.dealer.businessEmail ?? undefined,
    description: item.dealer.description ?? undefined,
    openingHours: openingHours.length > 0 ? openingHours : undefined,
    isVerified: dealerUser?.emailVerified === true,
    rating: 0,
    reviewCount: 0,
  };

  const similarItems = await getSimilarVehicles(item.dealerId, item.id);

  const similarListings: ListingProps[] = similarItems.map((sim) => ({
    id: sim.id,
    title: `${sim.make} ${sim.model || ""}`.trim(),
    price: formatPrice(sim.price),
    details: [
      `${String(sim.registrationMonth).padStart(2, "0")}/${sim.registrationYear}`,
      formatKilometers(sim.kilometer),
      sim.fuelType ? (FUEL_LABELS[sim.fuelType] ?? sim.fuelType) : undefined,
    ].filter((d): d is string => d != null && d !== ""),
    garageName: sim.dealer.companyName,
    garageId: sim.dealer.id,
    garageLocation: `${sim.dealer.city}, CH`,
    badge: sim.vehicleCondition
      ? (CONDITION_LABELS[sim.vehicleCondition] ?? sim.vehicleCondition)
      : undefined,
    image: getFullImageUrl(sim.images[0]),
  }));

  return (
    <div className="max-w-285 mx-auto px-4 py-12">
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
                label="Kilometerstand"
                value={formatKilometers(item.kilometer)}
              />
              {powerLabel && (
                <KeyDetailCard
                  icon={
                    <Zap className="text-muted-foreground" strokeWidth={1.5} />
                  }
                  label="Leistung"
                  value={powerLabel}
                />
              )}
              {fuelLabel && (
                <KeyDetailCard
                  icon={
                    <Fuel className="text-muted-foreground" strokeWidth={1.5} />
                  }
                  label="Treibstoff"
                  value={fuelLabel}
                />
              )}
              {transmissionLabel && (
                <KeyDetailCard
                  icon={
                    <Disc className="text-muted-foreground" strokeWidth={1.5} />
                  }
                  label="Getriebe"
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
                label="Erstzulassung"
                value={`${String(item.registrationMonth).padStart(2, "0")}/${item.registrationYear}`}
              />
              <KeyDetailCard
                icon={
                  <Store className="text-muted-foreground" strokeWidth={1.5} />
                }
                label="Verkäufer"
                value="Händler"
              />
            </CardContent>
          </Card>

          <div className="space-y-6">
            {Object.keys(basicData).length > 0 && (
              <ListingSection title="Basisdaten">
                <ListingDataGrid data={basicData} />
              </ListingSection>
            )}

            <ListingSection title="Fahrzeughistorie">
              <ListingDataGrid data={vehicleHistory} />
            </ListingSection>

            {Object.keys(inspectionAndWarranty).length > 0 && (
              <ListingSection title="Inspektion & Garantie">
                <ListingDataGrid data={inspectionAndWarranty} />
              </ListingSection>
            )}

            {Object.keys(technicalData).length > 0 && (
              <ListingSection title="Technische Daten">
                <ListingDataGrid data={technicalData} />
              </ListingSection>
            )}

            {(Object.keys(energyData).length > 0 || item.energyLabel) && (
              <ListingSection title="Energieverbrauch">
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
                        Energieeffizienzklasse
                      </h3>
                      <EnergyLabel efficiencyClass={item.energyLabel} />
                    </div>
                  </>
                )}
              </ListingSection>
            )}

            {Object.keys(electricData).length > 0 && (
              <ListingSection title="Elektrische Daten">
                <ListingDataGrid data={electricData} />
              </ListingSection>
            )}

            {Object.keys(colourAndUpholstery).length > 0 && (
              <ListingSection title="Farbe und Polsterung">
                <ListingDataGrid data={colourAndUpholstery} />
              </ListingSection>
            )}

            {Object.keys(identifiers).length > 0 && (
              <ListingSection title="Identifikationsnummern">
                <ListingDataGrid data={identifiers} />
              </ListingSection>
            )}

            {equipmentList.length > 0 && (
              <ListingSection title="Ausstattung">
                <EquipmentList items={equipmentList} />
              </ListingSection>
            )}

            {extrasList.length > 0 && (
              <ListingSection title="Extras">
                <EquipmentList items={extrasList} />
              </ListingSection>
            )}

            {description && (
              <ListingSection title="Fahrzeugbeschreibung">
                <p className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </ListingSection>
            )}

            <SellerSection seller={seller} />

            <ReviewSection
              rating={seller.rating}
              count={seller.reviewCount}
              reviews={[]}
              dealerId={seller.id}
            />

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
                  Neupreis: {formatPrice(item.newPrice)}
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
                      Verifizierter Händler
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-sm">
                  <div className="flex text-rating">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`size-4 ${i < Math.round(seller.rating) ? "fill-rating text-rating" : "text-muted-foreground opacity-30 fill-current"}`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold">{seller.rating}</span>
                  <span className="text-muted-foreground">
                    ({seller.reviewCount} Bewertungen)
                  </span>
                </div>
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
                      Telefon
                    </Link>
                  </Button>
                )}
                {seller.businessEmail && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`mailto:${seller.businessEmail}`}>
                      <Mail />
                      Kontaktieren
                    </Link>
                  </Button>
                )}
                <Button variant="link" className="w-full" asChild>
                  <Link href={`/dealers/${seller.id}`}>
                    Alle Fahrzeuge dieses Händlers
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
