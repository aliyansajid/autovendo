export const dynamic = "force-dynamic";

import { getVehicleCached } from "@/app/actions/vehicles.actions";
import { notFound } from "next/navigation";
import { formatVehicleName } from "@/lib/helpers/vehicle";
import { Button } from "@repo/ui/components/button";
import { Separator } from "@repo/ui/components/separator";
import { ImageGallery } from "../_components/image-gallery";
import {
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/src/components/card";
import Link from "next/link";
import { StickyActionBar } from "../_components/sticky-action-bar";
import { EnergyLabel } from "../_components/energy-label";
import { getSimilarVehicles } from "@/app/actions/vehicles.actions";
import { DAY_LABELS } from "@/lib/helpers/format";
import type { ListingProps } from "@/types";

// ─── German label maps ────────────────────────────────────────────────────────

const FUEL_LABELS: Record<string, string> = {
  PETROL: "Benzin",
  DIESEL: "Diesel",
  ELECTRIC: "Elektro",
  ETHANOL_PETROL: "Ethanol/Benzin",
  CNG_PETROL: "Erdgas/Benzin",
  LPG_PETROL: "Flüssiggas/Benzin",
  MHEV_DIESEL: "Mild-Hybrid Diesel",
  MHEV_PETROL: "Mild-Hybrid Benzin",
  PHEV_DIESEL: "Plug-in-Hybrid Diesel",
  PHEV_PETROL: "Plug-in-Hybrid Benzin",
  HEV_DIESEL: "Hybrid Diesel",
  HEV_PETROL: "Hybrid Benzin",
  HYDROGEN: "Wasserstoff",
};

const TRANSMISSION_LABELS: Record<string, string> = {
  AUTOMATIC: "Automatik",
  MANUAL: "Manuell",
  AUTOMATIC_STEPLESS: "Stufenautomatik",
  SEMI_AUTOMATIC: "Halbautomatik",
};

const DRIVE_LABELS: Record<string, string> = {
  ALL: "Allrad",
  FRONT: "Frontantrieb",
  REAR: "Hinterradantrieb",
};

const CONDITION_LABELS: Record<string, string> = {
  NEW: "Neu",
  DEMONSTRATION: "Vorführfahrzeug",
  PRE_REGISTERED: "Neuimmatrikuliert",
  USED: "Occasion",
  OLDTIMER: "Oldtimer",
};

const VEHICLE_TYPE_LABELS: Record<string, string> = {
  CAR: "Personenwagen",
  UTILITY: "Nutzfahrzeug",
  TRUCK: "Lastwagen",
  CAMPER: "Wohnmobil",
};

const COLOR_LABELS: Record<string, string> = {
  ANTHRACITE: "Anthrazit",
  BEIGE: "Beige",
  BLACK: "Schwarz",
  BLUE: "Blau",
  BORDEAUX: "Bordeaux",
  BROWN: "Braun",
  GOLD: "Gold",
  GRAY: "Grau",
  GREEN: "Grün",
  MULTICOLOURED: "Mehrfarbig",
  ORANGE: "Orange",
  PINK: "Pink",
  RED: "Rot",
  SILVER: "Silber",
  TURQUOISE: "Türkis",
  VIOLET: "Violett",
  WHITE: "Weiss",
  YELLOW: "Gelb",
  OTHER: "Andere",
};

const BATTERY_OWNERSHIP_LABELS: Record<string, string> = {
  BATTERY_INCLUDED: "Batterie inklusive",
  BATTERY_RENT_REQUIRED: "Batteriemiete erforderlich",
};

const CHARGING_STANDARD_LABELS: Record<string, string> = {
  TYPE_1: "Typ 1",
  TYPE_2: "Typ 2",
};

const CHARGING_FAST_LABELS: Record<string, string> = {
  CCS: "CCS",
  CSS_2: "CCS 2",
  CHADEMO: "CHAdeMO",
  SUPERCHARGER: "Supercharger",
};

const WARRANTY_LABELS: Record<string, string> = {
  FROM_DELIVERY: "Ab Lieferung",
  FROM_FIRST_REGISTRATION: "Ab Erstzulassung",
  FROM_DATE: "Ab Datum",
};

const EMISSION_LABELS: Record<string, string> = {
  EURO_1: "Euro 1",
  EURO_2: "Euro 2",
  EURO_3: "Euro 3",
  EURO_4: "Euro 4",
  EURO_5: "Euro 5",
  EURO_5_PLUS: "Euro 5+",
  EURO_6: "Euro 6",
  EURO_6A: "Euro 6a",
  EURO_6B: "Euro 6b",
  EURO_6C: "Euro 6c",
  EURO_6D: "Euro 6d",
  EURO_6D_ISC: "Euro 6d ISC",
  EURO_6D_ISC_FCM: "Euro 6d ISC FCM",
  EURO_6D_TEMP: "Euro 6d-temp",
  EURO_6D_TEMP_EVAP: "Euro 6d-temp EVAP",
  EURO_6D_TEMP_EVAP_ISC: "Euro 6d-temp EVAP ISC",
  EURO_6D_TEMP_ISC: "Euro 6d-temp ISC",
  EURO_6E: "Euro 6e",
};

// ─── Data building helpers ────────────────────────────────────────────────────

/** Returns the value only if it's not null/undefined/empty. */
function f(value: string | null | undefined): string | undefined {
  return value != null && value !== "" ? value : undefined;
}

/** Format an integer with de-CH thousands separator + suffix. */
function n(value: number | null | undefined, suffix = ""): string | undefined {
  if (value == null) return undefined;
  const formatted = value.toLocaleString("de-CH");
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
  const fuelLabel = item.fuelType ? (FUEL_LABELS[item.fuelType] ?? item.fuelType) : undefined;
  const transmissionLabel =
    item.transmissionType
      ? (TRANSMISSION_LABELS[item.transmissionType] ?? item.transmissionType)
      : item.gearTransmission
        ? (TRANSMISSION_LABELS[item.gearTransmission] ?? item.gearTransmission)
        : undefined;
  const powerLabel =
    item.kw != null || item.hp != null
      ? [
          item.kw != null ? `${item.kw.toLocaleString("de-CH")} kW` : null,
          item.hp != null ? `(${item.hp.toLocaleString("de-CH")} PS)` : null,
        ]
          .filter(Boolean)
          .join(" ")
      : undefined;

  // ── Data sections ──
  const basicData = filterObj({
    Karosserie: f(item.bodyType),
    Ausführung: f(item.version),
    Fahrzeugtyp: item.vehicleType ? (VEHICLE_TYPE_LABELS[item.vehicleType] ?? item.vehicleType) : undefined,
    Zustand: item.vehicleCondition ? (CONDITION_LABELS[item.vehicleCondition] ?? item.vehicleCondition) : undefined,
    Antrieb: item.driveType ? (DRIVE_LABELS[item.driveType] ?? item.driveType) : undefined,
    Sitzplätze: n(item.seats),
    Türen: n(item.doors),
    "Angebots-Nr.": item.id.slice(-8),
  });

  const vehicleHistory = filterObj({
    Kilometerstand: `${item.kilometer.toLocaleString("de-CH")} km`,
    Erstzulassung: `${String(item.registrationMonth).padStart(2, "0")}/${item.registrationYear}`,
  });

  const lastInspectionDate = toDate(item.lastInspectionDate);
  const warrantyStartDate = toDate(item.warrantyStartDate);

  const inspectionAndWarranty = filterObj({
    "Letzte MFK": lastInspectionDate
      ? lastInspectionDate.toLocaleDateString("de-CH")
      : undefined,
    "MFK bestanden": lastInspectionDate != null
      ? item.inspectionPassed ? "Ja" : "Nein"
      : undefined,
    Garantieart: item.warranty ? (WARRANTY_LABELS[item.warranty] ?? item.warranty) : undefined,
    "Garantie ab": warrantyStartDate
      ? warrantyStartDate.toLocaleDateString("de-CH")
      : undefined,
    "Garantiedauer": item.duration != null ? `${item.duration} Monate` : undefined,
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
    Schadstoffklasse: item.emissionStandard ? (EMISSION_LABELS[item.emissionStandard] ?? item.emissionStandard) : undefined,
    Treibstoff: fuelLabel,
    "CO₂-Emissionen (komb.)": n(item.co2Emission, "g/km"),
    "Verbrauch Stadt": fl(item.consumptionCity, "l/100km"),
    "Verbrauch Land": fl(item.consumptionCountry, "l/100km"),
    "Verbrauch kombiniert": fl(item.consumptionTotal, "l/100km"),
  });

  const electricData = filterObj({
    Reichweite: n(item.range, "km"),
    "Batteriekapazität": fl(item.batteryCapacity, "kWh"),
    "Batteriemiete": item.batteryRentalMonth != null ? `${item.batteryRentalMonth} CHF/Monat` : undefined,
    Stromverbrauch: fl(item.powerConsumption, "kWh/100km"),
    Batterieeigentum: item.batteryOwnership ? (BATTERY_OWNERSHIP_LABELS[item.batteryOwnership] ?? item.batteryOwnership) : undefined,
    "Ladeanschluss (Standard)": item.chargingPlugTypeStandard ? (CHARGING_STANDARD_LABELS[item.chargingPlugTypeStandard] ?? item.chargingPlugTypeStandard) : undefined,
    "Schnellladeanschluss": item.chargingPlugTypeFast ? (CHARGING_FAST_LABELS[item.chargingPlugTypeFast] ?? item.chargingPlugTypeFast) : undefined,
    Ladeleistung: fl(item.chargingPower, "kW"),
    "Verbrennungsmotor": item.combustionEnginePowerHp != null ? `${item.combustionEnginePowerHp.toLocaleString("de-CH")} PS` : undefined,
    "E-Motor": item.electricMotorPowerHp != null ? `${item.electricMotorPowerHp.toLocaleString("de-CH")} PS` : undefined,
  });

  const colourAndUpholstery = filterObj({
    Außenfarbe: item.color ? (COLOR_LABELS[item.color] ?? item.color) : undefined,
    Innenfarbe: item.interiorColor ? (COLOR_LABELS[item.interiorColor] ?? item.interiorColor) : undefined,
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
    price: `CHF ${sim.price.toLocaleString("de-CH")}`,
    details: [
      `${String(sim.registrationMonth).padStart(2, "0")}/${sim.registrationYear}`,
      `${sim.kilometer.toLocaleString("de-CH")} km`,
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
              CHF {price.toLocaleString("de-CH")}
            </div>
          </div>

          <ImageGallery images={images} title={title} />

          {/* Key detail cards */}
          <Card>
            <CardContent className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              <KeyDetailCard
                icon={<Gauge className="text-muted-foreground" strokeWidth={1.5} />}
                label="Kilometerstand"
                value={`${item.kilometer.toLocaleString("de-CH")} km`}
              />
              {powerLabel && (
                <KeyDetailCard
                  icon={<Zap className="text-muted-foreground" strokeWidth={1.5} />}
                  label="Leistung"
                  value={powerLabel}
                />
              )}
              {fuelLabel && (
                <KeyDetailCard
                  icon={<Fuel className="text-muted-foreground" strokeWidth={1.5} />}
                  label="Treibstoff"
                  value={fuelLabel}
                />
              )}
              {transmissionLabel && (
                <KeyDetailCard
                  icon={<Disc className="text-muted-foreground" strokeWidth={1.5} />}
                  label="Getriebe"
                  value={transmissionLabel}
                />
              )}
              <KeyDetailCard
                icon={<Calendar className="text-muted-foreground" strokeWidth={1.5} />}
                label="Erstzulassung"
                value={`${String(item.registrationMonth).padStart(2, "0")}/${item.registrationYear}`}
              />
              <KeyDetailCard
                icon={<Store className="text-muted-foreground" strokeWidth={1.5} />}
                label="Verkäufer"
                value="Händler"
              />
            </CardContent>
          </Card>

          <div className="space-y-6">
            {Object.keys(basicData).length > 0 && (
              <Section title="Basisdaten">
                <DataGrid data={basicData} />
              </Section>
            )}

            <Section title="Fahrzeughistorie">
              <DataGrid data={vehicleHistory} />
            </Section>

            {Object.keys(inspectionAndWarranty).length > 0 && (
              <Section title="Inspektion & Garantie">
                <DataGrid data={inspectionAndWarranty} />
              </Section>
            )}

            {Object.keys(technicalData).length > 0 && (
              <Section title="Technische Daten">
                <DataGrid data={technicalData} />
              </Section>
            )}

            {(Object.keys(energyData).length > 0 || item.energyLabel) && (
              <Section title="Energieverbrauch">
                {Object.keys(energyData).length > 0 && (
                  <DataGrid data={energyData} />
                )}
                {item.energyLabel && (
                  <>
                    {Object.keys(energyData).length > 0 && <Separator className="my-4" />}
                    <div>
                      <h3 className="text-sm font-medium mb-4">
                        Energieeffizienzklasse
                      </h3>
                      <EnergyLabel efficiencyClass={item.energyLabel} />
                    </div>
                  </>
                )}
              </Section>
            )}

            {Object.keys(electricData).length > 0 && (
              <Section title="Elektrische Daten">
                <DataGrid data={electricData} />
              </Section>
            )}

            {Object.keys(colourAndUpholstery).length > 0 && (
              <Section title="Farbe und Polsterung">
                <DataGrid data={colourAndUpholstery} />
              </Section>
            )}

            {Object.keys(identifiers).length > 0 && (
              <Section title="Identifikationsnummern">
                <DataGrid data={identifiers} />
              </Section>
            )}

            {equipmentList.length > 0 && (
              <Section title="Ausstattung">
                <EquipmentList items={equipmentList} />
              </Section>
            )}

            {extrasList.length > 0 && (
              <Section title="Extras">
                <EquipmentList items={extrasList} />
              </Section>
            )}

            {description && (
              <Section title="Fahrzeugbeschreibung">
                <p className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </Section>
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
                CHF {price.toLocaleString("de-CH")}
              </h2>
              {item.newPrice != null && item.newPrice > 0 && (
                <p className="text-sm text-muted-foreground">
                  Neupreis: CHF {item.newPrice.toLocaleString("de-CH")}
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="border-b gap-0">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function KeyDetailCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="shrink-0 flex items-center justify-center">{icon}</div>
      <div className="flex flex-col min-w-0">
        <p className="text-xs text-muted-foreground font-medium truncate">
          {label}
        </p>
        <p className="font-bold text-sm truncate">{value}</p>
      </div>
    </div>
  );
}

function DataGrid({ data }: { data: Record<string, string> }) {
  const entries = Object.entries(data);
  const rows = Array.from({ length: Math.ceil(entries.length / 2) }, (_, i) =>
    entries.slice(i * 2, i * 2 + 2),
  );
  return (
    <div>
      {rows.map((row, rowIdx) => {
        const isLastRow = rowIdx === rows.length - 1;
        return (
          <div key={rowIdx} className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            {row.map(([label, value]) => (
              <div
                key={label}
                className={`flex items-center justify-between py-3 ${!isLastRow ? "border-b" : ""}`}
              >
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="text-sm font-medium text-right">{value}</span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function EquipmentList({ items }: { items: string[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <CheckCircle2 className="size-4 text-green-500 shrink-0" />
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}
