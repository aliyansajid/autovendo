import { Hono } from "hono";
import { prisma } from "@repo/db";

const vehicle = new Hono();

const R2_DOMAIN = process.env.R2_PUBLIC_DOMAIN ?? "";

function getImageUrl(key: string | undefined | null): string | null {
  if (!key) return null;
  if (key.startsWith("http")) return key;
  const cleanKey = key.startsWith("/") ? key.slice(1) : key;
  return R2_DOMAIN ? `${R2_DOMAIN}/${cleanKey}` : null;
}

const FUEL_LABELS: Record<string, string> = {
  PETROL: "Benzin",
  DIESEL: "Diesel",
  ELECTRIC: "Elektro",
  MHEV_PETROL: "Mild-Hybrid Benzin/Elektro",
  MHEV_DIESEL: "Mild-Hybrid Diesel/Elektro",
  PHEV_PETROL: "Plug-in Hybrid Benzin/Elektro",
  PHEV_DIESEL: "Plug-in Hybrid Diesel/Elektro",
  HEV_PETROL: "Voll-Hybrid Benzin/Elektro",
  HEV_DIESEL: "Voll-Hybrid Diesel/Elektro",
  ETHANOL_PETROL: "Bioethanol",
  CNG_PETROL: "Erdgas (CNG) / Benzin",
  LPG_PETROL: "Flüssiggas (LPG) / Benzin",
  HYDROGEN: "Wasserstoff",
};

vehicle.get("/:id", async (c) => {
  const id = c.req.param("id");

  const v = await prisma.vehicle.findFirst({
    where: { id, status: "PUBLISHED" },
    select: {
      id: true,
      make: true,
      model: true,
      version: true,
      price: true,
      newPrice: true,
      images: true,
      vehicleType: true,
      bodyType: true,
      vehicleCondition: true,
      driveType: true,
      seats: true,
      doors: true,
      kilometer: true,
      registrationMonth: true,
      registrationYear: true,
      lastInspectionDate: true,
      inspectionPassed: true,
      warranty: true,
      warrantyStartDate: true,
      duration: true,
      maxKm: true,
      hp: true,
      kw: true,
      transmissionType: true,
      gearTransmission: true,
      cubicCapacity: true,
      cylinders: true,
      numberOfGears: true,
      emptyWeight: true,
      loadCapacity: true,
      wheelbase: true,
      length: true,
      width: true,
      height: true,
      towingCapacityBraked: true,
      fuelType: true,
      co2Emission: true,
      consumptionCity: true,
      consumptionCountry: true,
      consumptionTotal: true,
      emissionStandard: true,
      energyLabel: true,
      range: true,
      batteryCapacity: true,
      powerConsumption: true,
      chargingPower: true,
      color: true,
      interiorColor: true,
      metallic: true,
      vin: true,
      serialNumber: true,
      typeApproval: true,
      equipment: true,
      extras: true,
      vehicleDescription: true,
      createdAt: true,
      dealer: {
        select: {
          id: true,
          companyName: true,
          streetAddress: true,
          zipCode: true,
          city: true,
          phoneNumber: true,
          businessEmail: true,
          website: true,
          logo: true,
          description: true,
        },
      },
      seller: {
        select: {
          id: true,
          name: true,
          city: true,
          phoneNumber: true,
          email: true,
        },
      },
    },
  });

  if (!v) return c.body(null, 404);

  return c.json({
    id: v.id,
    make: v.make,
    model: v.model ?? "",
    version: v.version ?? null,
    price: v.price,
    newPrice: v.newPrice ?? null,
    images: v.images.map(getImageUrl).filter(Boolean) as string[],
    vehicleType: v.vehicleType ?? null,
    bodyType: v.bodyType ?? null,
    condition: v.vehicleCondition ?? null,
    driveType: v.driveType ?? null,
    seats: v.seats ?? null,
    doors: v.doors ?? null,
    kilometer: v.kilometer,
    registrationMonth: v.registrationMonth ?? null,
    registrationYear: v.registrationYear,
    lastInspectionDate: v.lastInspectionDate?.toISOString() ?? null,
    inspectionPassed: v.inspectionPassed ?? null,
    warranty: v.warranty ?? null,
    warrantyStartDate: v.warrantyStartDate?.toISOString() ?? null,
    warrantyDuration: v.duration ?? null,
    warrantyMaxKm: v.maxKm ?? null,
    hp: v.hp ?? null,
    kw: v.kw ?? null,
    transmission: v.transmissionType ?? v.gearTransmission ?? null,
    cubicCapacity: v.cubicCapacity ?? null,
    cylinders: v.cylinders ?? null,
    numberOfGears: v.numberOfGears ?? null,
    emptyWeight: v.emptyWeight ?? null,
    loadCapacity: v.loadCapacity ?? null,
    wheelbase: v.wheelbase ?? null,
    length: v.length ?? null,
    width: v.width ?? null,
    height: v.height ?? null,
    towingCapacityBraked: v.towingCapacityBraked ?? null,
    fuel: v.fuelType ? (FUEL_LABELS[v.fuelType] ?? v.fuelType) : null,
    co2Emission: v.co2Emission ?? null,
    consumptionCity: v.consumptionCity ? Number(v.consumptionCity) : null,
    consumptionCountry: v.consumptionCountry ? Number(v.consumptionCountry) : null,
    consumptionTotal: v.consumptionTotal ? Number(v.consumptionTotal) : null,
    emissionStandard: v.emissionStandard ?? null,
    energyLabel: v.energyLabel ?? null,
    range: v.range ?? null,
    batteryCapacity: v.batteryCapacity ? Number(v.batteryCapacity) : null,
    powerConsumption: v.powerConsumption ? Number(v.powerConsumption) : null,
    chargingPower: v.chargingPower ? Number(v.chargingPower) : null,
    color: v.color ?? null,
    interiorColor: v.interiorColor ?? null,
    metallic: v.metallic ?? null,
    vin: v.vin ?? null,
    serialNumber: v.serialNumber ?? null,
    typeApproval: v.typeApproval ?? null,
    equipment: (v.equipment as Record<string, boolean> | null) ?? null,
    extras: (v.extras as Record<string, boolean> | null) ?? null,
    description: v.vehicleDescription ?? null,
    dealer: v.dealer
      ? {
          id: v.dealer.id,
          name: v.dealer.companyName,
          address: [v.dealer.streetAddress, v.dealer.zipCode, v.dealer.city]
            .filter(Boolean)
            .join(", "),
          city: v.dealer.city,
          phone: v.dealer.phoneNumber ?? null,
          email: v.dealer.businessEmail ?? null,
          website: v.dealer.website ?? null,
          logo: v.dealer.logo ? getImageUrl(v.dealer.logo) : null,
          description: v.dealer.description ?? null,
        }
      : v.seller
        ? {
            id: v.seller.id,
            name: v.seller.name ?? null,
            address: v.seller.city ?? null,
            city: v.seller.city ?? null,
            phone: v.seller.phoneNumber ?? null,
            email: v.seller.email ?? null,
            website: null,
            logo: null,
            description: null,
          }
        : null,
    createdAt: v.createdAt.toISOString(),
  });
});

export default vehicle;
