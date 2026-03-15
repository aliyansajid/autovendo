import { getVehicleCached } from "@/app/actions/vehicles.actions";
import { notFound } from "next/navigation";
import { formatVehicleName } from "@/lib/helpers/vehicle";
import { formatEnumLabel } from "@/lib/helpers/format";
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
import { prisma } from "@repo/db";

/**
 * Vehicle Detail Page - Pure UI Component
 * All business logic handled in server actions
 */
export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getVehicleCached(id);

  if (!item) {
    notFound();
  }

  const r2Domain = process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN || "";
  const getFullImageUrl = (key: string | undefined) => {
    if (!key) return "/placeholder-car.jpg";
    if (key.startsWith("http")) return key;
    return `${r2Domain}/${key.startsWith("/") ? key.slice(1) : key}`;
  };

  const title = formatVehicleName([item.make, item.model, item.version]);
  const price = item.price;
  const images = item.images.map(getFullImageUrl);

  const na = "Keine Angabe";

  const keyDetails = {
    kilometer: `${item.kilometer.toLocaleString("de-CH")} km`,
    transmission:
      item.transmissionType?.toString() ||
      item.gearTransmission?.toString() ||
      na,
    firstRegistration: `${String(item.registrationMonth).padStart(
      2,
      "0",
    )}/${item.registrationYear}`,
    fuelType: item.fuelType?.toString() || na,
    power:
      item.kw != null || item.hp != null
        ? `${item.kw ?? 0} kW${item.hp != null ? ` (${item.hp} PS)` : ""}`
        : na,
    sellerType: "Händler",
    warranty:
      item.warranty != null
        ? `${item.duration ?? 0} Monate`
        : na,
    mfk: item.inspectionPassed ? "Ja" : "Nein",
  };

  const basicData: Record<string, string> = {
    Karosserie: item.bodyType || na,
    "Fahrzeugtyp": item.vehicleType?.toString() || na,
    Zustand: item.vehicleCondition?.toString() || na,
    Antrieb: item.driveType?.toString() || na,
    Sitzplätze: item.seats?.toString() ?? na,
    Türen: item.doors?.toString() ?? na,
    "Angebots-Nr.": item.id.slice(-8),
  };

  const vehicleHistory: Record<string, string> = {
    Kilometerstand: `${item.kilometer.toLocaleString("de-CH")} km`,
    Erstzulassung: `${String(item.registrationMonth).padStart(2, "0")}/${item.registrationYear}`,
  };

  const technicalData: Record<string, string> = {
    Leistung:
      item.kw != null || item.hp != null
        ? `${item.kw ?? 0} kW${item.hp != null ? ` (${item.hp} PS)` : ""}`
        : na,
    Getriebe: item.gearTransmission?.toString() || item.transmissionType?.toString() || na,
    Hubraum: item.cubicCapacity
      ? `${item.cubicCapacity.toLocaleString("de-CH")} ccm`
      : na,
    Gänge: item.numberOfGears?.toString() ?? na,
    Zylinder: item.cylinders?.toString() ?? na,
    Leergewicht: item.emptyWeight
      ? `${item.emptyWeight.toLocaleString("de-CH")} kg`
      : na,
    Nutzlast: item.loadCapacity
      ? `${item.loadCapacity.toLocaleString("de-CH")} kg`
      : na,
    Radstand: item.wheelbase ? `${item.wheelbase.toLocaleString("de-CH")} mm` : na,
    Länge: item.length ? `${item.length.toLocaleString("de-CH")} mm` : na,
    Breite: item.width ? `${item.width.toLocaleString("de-CH")} mm` : na,
    Höhe: item.height ? `${item.height.toLocaleString("de-CH")} mm` : na,
    "Anhängelast gebremst": item.towingCapacityBraked
      ? `${item.towingCapacityBraked.toLocaleString("de-CH")} kg`
      : na,
  };

  const energyConsumption: Record<string, string | undefined> = {
    "Schadstoffklasse": item.emissionStandard?.toString() || na,
    Treibstoff: item.fuelType?.toString() || na,
    "CO₂-Emissionen (komb.)": item.co2Emission != null ? `${item.co2Emission} g/km` : na,
    "Verbrauch Stadt": item.consumptionCity != null ? `${item.consumptionCity} l/100km` : na,
    "Verbrauch Land": item.consumptionCountry != null ? `${item.consumptionCountry} l/100km` : na,
    "Verbrauch kombiniert": item.consumptionTotal != null ? `${item.consumptionTotal} l/100km` : na,
    efficiencyClass: item.energyLabel ?? undefined,
  };

  const inspectionAndWarranty: Record<string, string> = {
    "Letzte MFK": item.lastInspectionDate
      ? item.lastInspectionDate.toLocaleDateString("de-CH")
      : na,
    "MFK bestanden": item.inspectionPassed ? "Ja" : "Nein",
    Garantieart: item.warranty?.toString() || na,
    "Garantie ab": item.warrantyStartDate
      ? item.warrantyStartDate.toLocaleDateString("de-CH")
      : na,
    "Garantiedauer (Monate)": item.duration?.toString() ?? na,
    "Garantie max. km": item.maxKm != null ? `${item.maxKm.toLocaleString("de-CH")} km` : na,
  };

  const electricData: Record<string, string> = {
    Reichweite: item.range != null ? `${item.range.toLocaleString("de-CH")} km` : na,
    "Batteriekapazität (kWh)": item.batteryCapacity != null
      ? `${item.batteryCapacity} kWh`
      : na,
    "Batteriemiete/Monat": item.batteryRentalMonth != null
      ? `${item.batteryRentalMonth} CHF/Monat`
      : na,
    "Stromverbrauch": item.powerConsumption != null
      ? `${item.powerConsumption} kWh/100km`
      : na,
    Batterieeigentum: item.batteryOwnership?.toString() || na,
    "Ladeanschluss Typ 2": item.chargingPlugTypeStandard?.toString() || na,
    "Schnellladeanschluss": item.chargingPlugTypeFast?.toString() || na,
    Ladeleistung: item.chargingPower != null ? `${item.chargingPower} kW` : na,
    "Verbrennungsmotor (PS)": item.combustionEnginePowerHp != null ? `${item.combustionEnginePowerHp} PS` : na,
    "E-Motor (PS)": item.electricMotorPowerHp != null ? `${item.electricMotorPowerHp} PS` : na,
  };

  const identifiers: Record<string, string> = {
    FIN: item.vin ?? na,
    Seriennummer: item.serialNumber ?? na,
    Typengenehmigung: item.typeApproval ?? na,
  };

  const equipmentList = item.equipment
    ? Object.entries(item.equipment as Record<string, unknown>)
        .filter(([_, v]) => v === true)
        .map(([k]) => k.replace(/([A-Z])/g, " $1").trim())
    : [];

  const colourAndUpholstery: Record<string, string> = {
    Außenfarbe: item.color?.toString() || na,
    Innenfarbe: item.interiorColor?.toString() ?? na,
    Lackierung: item.metallic ? "Metallic" : "Uni",
  };

  const description =
    item.vehicleDescription && item.vehicleDescription.trim().length > 0
      ? item.vehicleDescription
      : "Keine Beschreibung verfügbar.";

  const dayNames: Record<string, string> = {
    MONDAY: "Montag",
    TUESDAY: "Dienstag",
    WEDNESDAY: "Mittwoch",
    THURSDAY: "Donnerstag",
    FRIDAY: "Freitag",
    SATURDAY: "Samstag",
    SUNDAY: "Sonntag",
  };
  const dealerWithHours = item.dealer as typeof item.dealer & {
    openingHours?: Array<{ day: string; openTime: Date | null; closeTime: Date | null; isOpen: boolean }>;
  };
  const openingHours =
    dealerWithHours.openingHours?.map((oh: { day: string; openTime: Date | null; closeTime: Date | null; isOpen: boolean }) => ({
      day: dayNames[oh.day] ?? oh.day,
      hours: oh.isOpen && oh.openTime != null && oh.closeTime != null
        ? `${oh.openTime.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" })} – ${oh.closeTime.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" })}`
        : "Geschlossen",
    })) ?? [];

  const seller = {
    id: item.dealer.id,
    name: item.dealer.companyName,
    address: `${item.dealer.address}, ${item.dealer.zipCode} ${item.dealer.city}`,
    phone: item.dealer.phoneNumber ?? na,
    logo: item.dealer.logo ? getFullImageUrl(item.dealer.logo) : undefined,
    website: item.dealer.website ?? undefined,
    contactPerson: item.dealer.contactPerson ?? undefined,
    businessEmail: item.dealer.businessEmail ?? undefined,
    description: item.dealer.description ?? undefined,
    openingHours: openingHours.length > 0 ? openingHours : undefined,
    rating: 0,
    reviewCount: 0,
  };

  // Fetch some similar listings from same dealer
  const similarItems = await prisma.vehicle.findMany({
    where: {
      dealerId: item.dealerId,
      NOT: { id: item.id },
    },
    take: 5,
    include: { dealer: true },
  });

  const similarListings = similarItems.map((sim) => ({
    id: sim.id,
    title: `${sim.make} ${sim.model || ""}`.trim(),
    price: `CHF ${sim.price.toLocaleString()}`,
    details: [
      `${String(sim.registrationMonth).padStart(2, "0")}/${sim.registrationYear}`,
      `${sim.kilometer.toLocaleString()} km`,
      sim.fuelType?.toString().toLowerCase().replace(/_/g, " ") || "N/A",
    ],
    garageName: sim.dealer.companyName,
    garageId: sim.dealerId,
    garageLocation: `${sim.dealer.city}, CH`,
    badge: sim.vehicleCondition === "NEW" ? "NEU" : "Gebraucht",
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
              CHF {price.toLocaleString()}
            </div>
          </div>

          <ImageGallery images={images} title={title} />

          <Card>
            <CardContent className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              <KeyDetailCard
                icon={
                  <Gauge className="text-muted-foreground" strokeWidth={1.5} />
                }
                label="Kilometerstand"
                value={keyDetails.kilometer}
              />
              <KeyDetailCard
                icon={
                  <Zap className="text-muted-foreground" strokeWidth={1.5} />
                }
                label="Leistung"
                value={keyDetails.power}
              />
              <KeyDetailCard
                icon={
                  <Fuel className="text-muted-foreground" strokeWidth={1.5} />
                }
                label="Treibstoff"
                value={keyDetails.fuelType}
              />
              <KeyDetailCard
                icon={
                  <Disc className="text-muted-foreground" strokeWidth={1.5} />
                }
                label="Getriebe"
                value={keyDetails.transmission}
              />
              <KeyDetailCard
                icon={
                  <Calendar
                    className="text-muted-foreground"
                    strokeWidth={1.5}
                  />
                }
                label="Erstzulassung"
                value={keyDetails.firstRegistration}
              />
              <KeyDetailCard
                icon={
                  <Store className="text-muted-foreground" strokeWidth={1.5} />
                }
                label="Verkäufer"
                value={keyDetails.sellerType}
              />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Section title="Basisdaten">
              <DataGrid data={basicData} />
            </Section>

            <Section title="Fahrzeughistorie">
              <DataGrid data={vehicleHistory} />
            </Section>

            <Section title="Inspektion & Garantie">
              <DataGrid data={inspectionAndWarranty} />
            </Section>

            <Section title="Technische Daten">
              <DataGrid data={technicalData} />
            </Section>

            <Section title="Energieverbrauch">
              <DataGrid
                data={Object.fromEntries(
                  Object.entries(energyConsumption).filter(
                    ([key]) => key !== "efficiencyClass",
                  ) as [string, string][],
                )}
              />
              {energyConsumption.efficiencyClass != null && energyConsumption.efficiencyClass !== "" && (
                <>
                  <Separator />
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-4">
                      Energieeffizienzklasse
                    </h3>
                    <EnergyLabel
                      efficiencyClass={energyConsumption.efficiencyClass}
                    />
                  </div>
                </>
              )}
            </Section>

            <Section title="Elektrische Daten">
              <DataGrid data={electricData} />
            </Section>

            <Section title="Farbe und Polsterung">
              <DataGrid data={colourAndUpholstery} />
            </Section>

            <Section title="Identifikationsnummern">
              <DataGrid data={identifiers} />
            </Section>

            <Section title="Ausstattung">
              <EquipmentCategory items={equipmentList} />
            </Section>

            {item.extras != null &&
              typeof item.extras === "object" &&
              Object.keys(item.extras as object).length > 0 && (
                <Section title="Extras">
                  <EquipmentCategory
                    items={Object.entries(item.extras as Record<string, unknown>)
                      .filter(([_, v]) => v === true)
                      .map(([k]) => k.replace(/([A-Z])/g, " $1").trim())}
                  />
                </Section>
              )}

            <Section title="Fahrzeugbeschreibung">
              <p className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </Section>

            <SellerSection seller={seller} />

            <ReviewSection
              rating={seller.rating}
              count={seller.reviewCount}
              reviews={[]}
              dealerId={seller.id}
            />

            <Separator className="my-12" />

            <SimilarListings listings={similarListings as any} />
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
                <div className="flex items-center gap-2">
                  <BadgeCheck className="size-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    Verifizierter Händler
                  </span>
                </div>
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
              </div>

              <div className="space-y-3">
                <Button className="w-full">
                  <Phone />
                  Telefon
                </Button>
                <Button variant="outline" className="w-full">
                  <Mail />
                  Kontaktieren
                </Button>
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
      <StickyActionBar price={price} sellerPhone={seller.phone} />
    </div>
  );
}

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
        <p className="font-bold text-sm truncate">
          {typeof value === "string" ? formatEnumLabel(value) : value}
        </p>
      </div>
    </div>
  );
}

function DataGrid({
  data,
}: {
  data: Record<string, string | number | undefined>;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
      {Object.entries(data).map(([label, value]) => (
        <div
          key={label}
          className="flex items-center justify-between pb-3 border-b last:border-0"
        >
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="text-sm font-medium text-right">
            {typeof value === "string" ? formatEnumLabel(value) : value}
          </span>
        </div>
      ))}
    </div>
  );
}

function EquipmentCategory({ items }: { items: string[] }) {
  if (!items.length) {
    return (
      <p className="text-sm text-muted-foreground italic">
        Keine Ausstattung angegeben.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <CheckCircle2 className="size-4 text-green-500 shrink-0" />
          <span>{formatEnumLabel(item)}</span>
        </div>
      ))}
    </div>
  );
}
