import { getVehicleById } from "@/app/actions/vehicles";
import { notFound } from "next/navigation";
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
import { formatVehicleName } from "@/lib/text-format";

function formatLabel(value: string | null | undefined) {
  if (!value) return "N/A";
  const normalized = value.toLowerCase().replace(/_/g, " ");
  return normalized
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getVehicleById(id);

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

  const keyDetails = {
    kilometer: `${item.kilometer.toLocaleString()} km`,
    transmission:
      item.transmissionType?.toString() ||
      item.gearTransmission?.toString() ||
      "N/A",
    firstRegistration: `${String(item.registrationMonth).padStart(
      2,
      "0",
    )}/${item.registrationYear}`,
    fuelType: item.fuelType?.toString() || "N/A",
    power:
      item.kw || item.hp
        ? `${item.kw || 0} kW${item.hp ? ` (${item.hp} PS)` : ""}`
        : "N/A",
    sellerType: "Händler",
    warranty: item.warranty ? `${item.duration || 0} Monate` : "Keine Angabe",
    mfk: item.inspectionPassed ? "Ja" : "Nein",
  };

  const basicData = {
    bodyType: item.bodyType || "N/A",
    vehicleType: item.vehicleType?.toString() || "N/A",
    vehicleCondition: item.vehicleCondition?.toString() || "N/A",
    drivetrain: item.driveType?.toString() || "N/A",
    seats: item.seats?.toString() || "N/A",
    doors: item.doors?.toString() || "N/A",
    offerNumber: item.id.slice(-8),
  };

  const vehicleHistory = {
    kilometer: `${item.kilometer.toLocaleString()} km`,
    firstRegistration: `${String(item.registrationMonth).padStart(2, "0")}/${item.registrationYear}`,
  };

  const technicalData = {
    power:
      item.kw || item.hp
        ? `${item.kw || 0} kW${item.hp ? ` (${item.hp} PS)` : ""}`
        : "N/A",
    gearbox: item.gearTransmission?.toString() || "N/A",
    engineSize: item.cubicCapacity
      ? `${item.cubicCapacity.toLocaleString()} ccm`
      : "N/A",
    gears: item.numberOfGears?.toString() || "N/A",
    cylinders: item.cylinders?.toString() || "N/A",
    emptyWeight: item.emptyWeight
      ? `${item.emptyWeight.toLocaleString()} kg`
      : "N/A",
    loadCapacity: item.loadCapacity
      ? `${item.loadCapacity.toLocaleString()} kg`
      : "N/A",
    wheelbase: item.wheelbase ? `${item.wheelbase.toLocaleString()} mm` : "N/A",
    length: item.length ? `${item.length.toLocaleString()} mm` : "N/A",
    width: item.width ? `${item.width.toLocaleString()} mm` : "N/A",
    height: item.height ? `${item.height.toLocaleString()} mm` : "N/A",
    towingCapacityBraked: item.towingCapacityBraked
      ? `${item.towingCapacityBraked.toLocaleString()} kg`
      : "N/A",
  };

  const energyConsumption = {
    emissionClass: item.emissionStandard?.toString() || "N/A",
    fuelType: item.fuelType?.toString() || "N/A",
    co2Emissions: item.co2Emission ? `${item.co2Emission} g/km (komb.)` : "N/A",
    efficiencyClass: item.energyLabel || undefined,
  };

  const inspectionAndWarranty = {
    lastInspectionDate: item.lastInspectionDate
      ? item.lastInspectionDate.toLocaleDateString("de-CH")
      : "N/A",
    inspectionPassed: item.inspectionPassed ? "Ja" : "Nein",
    warrantyType: item.warranty?.toString() || "N/A",
    warrantyStartDate: item.warrantyStartDate
      ? item.warrantyStartDate.toLocaleDateString("de-CH")
      : "N/A",
    warrantyDurationMonths: item.duration?.toString() || "N/A",
    warrantyMaxKm: item.maxKm ? `${item.maxKm.toLocaleString()} km` : "N/A",
  };

  const electricData = {
    range: item.range ? `${item.range.toLocaleString()} km` : "N/A",
    batteryCapacity: item.batteryCapacity
      ? `${item.batteryCapacity.toLocaleString()} kWh`
      : "N/A",
    batteryRentalMonth: item.batteryRentalMonth
      ? `${item.batteryRentalMonth.toLocaleString()} CHF/Monat`
      : "N/A",
    powerConsumption: item.powerConsumption
      ? `${item.powerConsumption.toLocaleString()} kWh/100km`
      : "N/A",
    batteryOwnership: item.batteryOwnership?.toString() || "N/A",
    chargingPlugTypeStandard:
      item.chargingPlugTypeStandard?.toString() || "N/A",
    chargingPlugTypeFast: item.chargingPlugTypeFast?.toString() || "N/A",
    chargingPower: item.chargingPower
      ? `${item.chargingPower.toLocaleString()} kW`
      : "N/A",
    combustionEnginePowerHp: item.combustionEnginePowerHp
      ? `${item.combustionEnginePowerHp} PS`
      : "N/A",
    electricMotorPowerHp: item.electricMotorPowerHp
      ? `${item.electricMotorPowerHp} PS`
      : "N/A",
  };

  const identifiers = {
    vin: item.vin || "N/A",
    serialNumber: item.serialNumber || "N/A",
    typeApproval: item.typeApproval || "N/A",
  };

  const equipment = {
    comfort: item.equipment
      ? Object.entries(item.equipment as Record<string, unknown>)
          .filter(([_, v]) => v === true)
          .map(([k]) => k.replace(/([A-Z])/g, " $1").trim())
      : [],
  };

  const colourAndUpholstery = {
    exteriorColour: item.color?.toString() || "N/A",
    interiorColour: item.interiorColor?.toString() || "N/A",
    paint: item.metallic ? "Metallic" : "Uni",
  };

  const description =
    item.vehicleDescription && item.vehicleDescription.trim().length > 0
      ? item.vehicleDescription
      : "Keine Beschreibung verfügbar.";

  const seller = {
    id: item.dealer.id,
    name: item.dealer.companyName,
    address: `${item.dealer.address}, ${item.dealer.zipCode} ${item.dealer.city}`,
    phone: item.dealer.phoneNumber,
    logo: item.dealer.logo ? getFullImageUrl(item.dealer.logo) : undefined,
    website: item.dealer.website || "",
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
                  ),
                )}
              />
              {energyConsumption.efficiencyClass && (
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
              <EquipmentCategory items={equipment.comfort} />
            </Section>

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
          {typeof value === "string" ? formatLabel(value) : value}
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
  const noBorderKeys = [
    "doors",
    "kilometer",
    "height",
    "warrantydurationmonths",
    "combustionenginepowerhp",
    "electricmotorpowerhp",
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
      {Object.entries(data).map(([key, value]) => {
        const shouldHideBorder = noBorderKeys.includes(key.toLowerCase());
        return (
          <div
            key={key}
            className={`flex items-center justify-between pb-3 ${
              shouldHideBorder ? "border-b sm:border-b-0" : "border-b"
            } last:border-0`}
          >
            <span className="text-sm text-muted-foreground capitalize">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </span>
            <span className="text-sm font-medium text-right">
              {typeof value === "string" ? formatLabel(value) : value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function EquipmentCategory({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <CheckCircle2 className="size-4 text-green-500" />
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}
