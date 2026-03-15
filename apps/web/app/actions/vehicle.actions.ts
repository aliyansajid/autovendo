"use server";

import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { prisma } from "@repo/db";
import { StorageService } from "@repo/storage";
import { storage } from "@/lib/storage";
import { vehicleFormSchema } from "@/schema/vehicle-form-schema";
import { createId } from "@paralleldrive/cuid2";

/**
 * Phase 0: Prepare a new vehicle listing by generating a unique ID.
 */
export async function prepareVehicleListing() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const dealer = await prisma.dealer.findUnique({
    where: { userId: session.user.id },
  });

  if (!dealer) {
    throw new Error("Dealer profile not found");
  }

  return {
    listingId: createId(),
    country: "ch",
    dealerId: dealer.id,
  };
}

/**
 * Phase 1: Generate presigned URLs for image uploads.
 */
export async function getPresignedUrls(
  listingId: string,
  files: { name: string; type: string }[],
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const dealer = await prisma.dealer.findUnique({
    where: { userId: session.user.id },
  });

  if (!dealer) {
    throw new Error("Dealer profile not found");
  }

  const country = "ch";

  const urls = await Promise.all(
    files.map(async (file) => {
      const key = StorageService.formatDealerPath(
        country,
        dealer.id,
        "listing",
        file.name,
        listingId,
      );

      const url = await storage.getUploadUrl(key, file.type);
      return { url, key };
    }),
  );

  return urls;
}

/**
 * Phase 3: Create the vehicle record in the database.
 */
export async function createVehicle(
  listingId: string,
  formData: any,
  imageKeys: string[],
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const dealer = await prisma.dealer.findUnique({
    where: { userId: session.user.id },
  });

  if (!dealer) {
    throw new Error("Dealer profile not found");
  }

  const validatedData = vehicleFormSchema.parse(formData);

  const vehicle = await prisma.vehicle.create({
    data: {
      id: listingId,
      dealerId: dealer.id,
      vehicleType: validatedData.vehicleType.toUpperCase() as any,
      make: validatedData.make,
      model: validatedData.model || null,
      version: validatedData.version || null,
      bodyType: validatedData.bodyType,
      fuelType: validatedData.fuelType
        ? (validatedData.fuelType.toUpperCase().replace(/-/g, "_") as any)
        : null,
      registrationMonth: validatedData.registrationMonth,
      registrationYear: validatedData.registrationYear,
      kilometer: validatedData.kilometer,
      price: validatedData.price,
      newPrice: validatedData.newPrice || null,
      color: validatedData.color.toUpperCase() as any,
      gearTransmission: validatedData.gearTransmission
        ? (validatedData.gearTransmission.toUpperCase() as any)
        : null,
      transmissionType: validatedData.transmissionType
        ? (validatedData.transmissionType
            .toUpperCase()
            .replace(/-/g, "_") as any)
        : null,
      driveType: validatedData.driveType
        ? (validatedData.driveType.toUpperCase() as any)
        : null,
      interiorColor: validatedData.interiorColor
        ? (validatedData.interiorColor.toUpperCase() as any)
        : null,
      metallic: validatedData.metallic,
      vehicleCondition: validatedData.vehicleCondition
        ? (validatedData.vehicleCondition
            .toUpperCase()
            .replace(/-/g, "_") as any)
        : null,
      lastInspectionDate: validatedData.lastInspectionDate || null,
      inspectionPassed: validatedData.inspectionPassed,
      warranty: validatedData.warranty
        ? (validatedData.warranty.toUpperCase().replace(/-/g, "_") as any)
        : null,
      warrantyStartDate: validatedData.warrantyStartDate || null,
      duration: validatedData.duration || null,
      maxKm: validatedData.maxKm || null,
      doors: validatedData.doors || null,
      seats: validatedData.seats || null,
      hp: validatedData.hp || null,
      kw: validatedData.kw || null,
      energyLabel: validatedData.energyLabel
        ? (validatedData.energyLabel.toUpperCase() as any)
        : null,
      typeApproval: validatedData.typeApproval || null,
      wheelbase: validatedData.wheelbase || null,
      vin: validatedData.vehicleIdentificationNumber || null,
      emptyWeight: validatedData.emptyWeight || null,
      loadCapacity: validatedData.loadCapacity || null,
      serialNumber: validatedData.serialNumber || null,
      height: validatedData.height || null,
      width: validatedData.width || null,
      length: validatedData.length || null,
      towingCapacityBraked: validatedData.towingCapacityBraked || null,
      cubicCapacity: validatedData.cubicCapacity || null,
      co2Emission: validatedData.co2Emission || null,
      cylinders: validatedData.cylinders || null,
      numberOfGears: validatedData.numberOfGears || null,
      emissionStandard: validatedData.emissionStandard
        ? (validatedData.emissionStandard
            .toUpperCase()
            .replace(/-/g, "_") as any)
        : null,
      consumptionCity: validatedData.consumptionCity || null,
      consumptionCountry: validatedData.consumptionCountry || null,
      consumptionTotal: validatedData.consumptionTotal || null,
      range: validatedData.range || null,
      batteryCapacity: validatedData.batteryCapacity || null,
      batteryRentalMonth: validatedData.batteryRentalMonth || null,
      powerConsumption: validatedData.powerConsumption || null,
      batteryOwnership: validatedData.batteryOwnership
        ? (validatedData.batteryOwnership
            .toUpperCase()
            .replace(/-/g, "_") as any)
        : null,
      chargingPlugTypeStandard: validatedData.chargingPlugTypeStandard
        ? (validatedData.chargingPlugTypeStandard
            .toUpperCase()
            .replace(/-/g, "_") as any)
        : null,
      chargingPlugTypeFast: validatedData.chargingPlugTypeFast
        ? (validatedData.chargingPlugTypeFast
            .toUpperCase()
            .replace(/-/g, "_") as any)
        : null,
      chargingPower: validatedData.chargingPower || null,
      combustionEnginePowerHp: validatedData.combustionEnginePowerHp || null,
      electricMotorPowerHp: validatedData.electricMotorPowerHp || null,
      vehicleDescription: validatedData.vehicleDescription || null,
      equipment: validatedData.equipment || {},
      extras: validatedData.extras || {},
      images: imageKeys,
    },
  });

  return listingId;
}

/**
 * Fetch all vehicles for the current dealer.
 */
export async function getDealerVehicles() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const dealer = await prisma.dealer.findUnique({
    where: { userId: session.user.id },
  });

  if (!dealer) {
    throw new Error("Dealer profile not found");
  }

  const vehicles = await prisma.vehicle.findMany({
    where: { dealerId: dealer.id },
    orderBy: { createdAt: "desc" },
  });

  return vehicles;
}

/**
 * Fetch a specific vehicle by ID.
 */
export async function getVehicleById(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const dealer = await prisma.dealer.findUnique({
    where: { userId: session.user.id },
  });

  if (!dealer) {
    throw new Error("Dealer profile not found");
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: {
      id,
      dealerId: dealer.id,
    },
  });

  return vehicle;
}

/**
 * Update an existing vehicle record.
 */
export async function updateVehicle(
  vehicleId: string,
  formData: any,
  imageKeys: string[],
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const dealer = await prisma.dealer.findUnique({
    where: { userId: session.user.id },
  });

  if (!dealer) {
    throw new Error("Dealer profile not found");
  }

  const validatedData = vehicleFormSchema.parse(formData);

  await prisma.vehicle.update({
    where: {
      id: vehicleId,
      dealerId: dealer.id,
    },
    data: {
      vehicleType: validatedData.vehicleType.toUpperCase() as any,
      make: validatedData.make,
      model: validatedData.model || null,
      version: validatedData.version || null,
      bodyType: validatedData.bodyType,
      fuelType: validatedData.fuelType
        ? (validatedData.fuelType.toUpperCase().replace(/-/g, "_") as any)
        : null,
      registrationMonth: validatedData.registrationMonth,
      registrationYear: validatedData.registrationYear,
      kilometer: validatedData.kilometer,
      price: validatedData.price,
      newPrice: validatedData.newPrice || null,
      color: validatedData.color.toUpperCase() as any,
      gearTransmission: validatedData.gearTransmission
        ? (validatedData.gearTransmission.toUpperCase() as any)
        : null,
      transmissionType: validatedData.transmissionType
        ? (validatedData.transmissionType
            .toUpperCase()
            .replace(/-/g, "_") as any)
        : null,
      driveType: validatedData.driveType
        ? (validatedData.driveType.toUpperCase() as any)
        : null,
      interiorColor: validatedData.interiorColor
        ? (validatedData.interiorColor.toUpperCase() as any)
        : null,
      metallic: validatedData.metallic,
      vehicleCondition: validatedData.vehicleCondition
        ? (validatedData.vehicleCondition
            .toUpperCase()
            .replace(/-/g, "_") as any)
        : null,
      lastInspectionDate: validatedData.lastInspectionDate || null,
      inspectionPassed: validatedData.inspectionPassed,
      warranty: validatedData.warranty
        ? (validatedData.warranty.toUpperCase().replace("-", "_") as any)
        : null,
      warrantyStartDate: validatedData.warrantyStartDate || null,
      duration: validatedData.duration || null,
      maxKm: validatedData.maxKm || null,
      doors: validatedData.doors || null,
      seats: validatedData.seats || null,
      hp: validatedData.hp || null,
      kw: validatedData.kw || null,
      energyLabel: validatedData.energyLabel
        ? (validatedData.energyLabel.toUpperCase() as any)
        : null,
      typeApproval: validatedData.typeApproval || null,
      wheelbase: validatedData.wheelbase || null,
      vin: validatedData.vehicleIdentificationNumber || null,
      emptyWeight: validatedData.emptyWeight || null,
      loadCapacity: validatedData.loadCapacity || null,
      serialNumber: validatedData.serialNumber || null,
      height: validatedData.height || null,
      width: validatedData.width || null,
      length: validatedData.length || null,
      towingCapacityBraked: validatedData.towingCapacityBraked || null,
      cubicCapacity: validatedData.cubicCapacity || null,
      co2Emission: validatedData.co2Emission || null,
      cylinders: validatedData.cylinders || null,
      numberOfGears: validatedData.numberOfGears || null,
      emissionStandard: validatedData.emissionStandard
        ? (validatedData.emissionStandard
            .toUpperCase()
            .replace(/-/g, "_") as any)
        : null,
      consumptionCity: validatedData.consumptionCity || null,
      consumptionCountry: validatedData.consumptionCountry || null,
      consumptionTotal: validatedData.consumptionTotal || null,
      range: validatedData.range || null,
      batteryCapacity: validatedData.batteryCapacity || null,
      batteryRentalMonth: validatedData.batteryRentalMonth || null,
      powerConsumption: validatedData.powerConsumption || null,
      batteryOwnership: validatedData.batteryOwnership
        ? (validatedData.batteryOwnership
            .toUpperCase()
            .replace(/-/g, "_") as any)
        : null,
      chargingPlugTypeStandard: validatedData.chargingPlugTypeStandard
        ? (validatedData.chargingPlugTypeStandard
            .toUpperCase()
            .replace(/-/g, "_") as any)
        : null,
      chargingPlugTypeFast: validatedData.chargingPlugTypeFast
        ? (validatedData.chargingPlugTypeFast
            .toUpperCase()
            .replace(/-/g, "_") as any)
        : null,
      chargingPower: validatedData.chargingPower || null,
      combustionEnginePowerHp: validatedData.combustionEnginePowerHp || null,
      electricMotorPowerHp: validatedData.electricMotorPowerHp || null,
      vehicleDescription: validatedData.vehicleDescription || null,
      equipment: validatedData.equipment || {},
      extras: validatedData.extras || {},
      images: imageKeys,
    },
  });

  return vehicleId;
}

/**
 * Delete a vehicle record.
 */
export async function deleteVehicle(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const dealer = await prisma.dealer.findUnique({
    where: { userId: session.user.id },
  });

  if (!dealer) {
    throw new Error("Dealer profile not found");
  }

  await prisma.vehicle.delete({
    where: {
      id,
      dealerId: dealer.id,
    },
  });

  return { success: true };
}
