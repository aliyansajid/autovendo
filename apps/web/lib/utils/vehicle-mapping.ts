import { Vehicle } from "@repo/db";
import { z } from "zod";
import { vehicleFormSchema } from "../../schema/vehicle-form-schema";

export function mapVehicleToForm(
  vehicle: any,
): z.infer<typeof vehicleFormSchema> {
  const mapEnum = (val: string | null | undefined) => {
    if (!val) return undefined;
    return val.toLowerCase().replace(/_/g, "-");
  };

  return {
    vehicleType: vehicle.vehicleType.toLowerCase(),
    make: vehicle.make,
    model: vehicle.model ?? undefined,
    version: vehicle.version ?? "",
    bodyType: vehicle.bodyType, // bodyType is already lowercase in form constants? No, it's lowercase-hyphen
    fuelType: mapEnum(vehicle.fuelType),
    registrationMonth: vehicle.registrationMonth,
    registrationYear: vehicle.registrationYear,
    kilometer: vehicle.kilometer,
    price: vehicle.price,
    newPrice: vehicle.newPrice ?? undefined,
    color: mapEnum(vehicle.color) as any,
    gearTransmission: mapEnum(vehicle.gearTransmission) as any,
    transmissionType: mapEnum(vehicle.transmissionType) as any,
    driveType: mapEnum(vehicle.driveType) as any,
    interiorColor: mapEnum(vehicle.interiorColor) as any,
    metallic: vehicle.metallic,
    vehicleCondition: mapEnum(vehicle.vehicleCondition) as any,
    lastInspectionDate: vehicle.lastInspectionDate
      ? new Date(vehicle.lastInspectionDate)
      : undefined,
    inspectionPassed: vehicle.inspectionPassed,
    warranty: mapEnum(vehicle.warranty) as any,
    warrantyStartDate: vehicle.warrantyStartDate
      ? new Date(vehicle.warrantyStartDate)
      : undefined,
    duration: vehicle.duration ?? undefined,
    maxKm: vehicle.maxKm ?? undefined,
    doors: vehicle.doors ?? undefined,
    seats: vehicle.seats ?? undefined,
    hp: vehicle.hp ?? undefined,
    kw: vehicle.kw ?? undefined,
    energyLabel: vehicle.energyLabel?.toLowerCase() as any,
    typeApproval: vehicle.typeApproval ?? "",
    wheelbase: vehicle.wheelbase ?? undefined,
    vehicleIdentificationNumber: vehicle.vin ?? "",
    emptyWeight: vehicle.emptyWeight ?? undefined,
    loadCapacity: vehicle.loadCapacity ?? undefined,
    serialNumber: vehicle.serialNumber ?? "",
    height: vehicle.height ?? undefined,
    width: vehicle.width ?? undefined,
    length: vehicle.length ?? undefined,
    towingCapacityBraked: vehicle.towingCapacityBraked ?? undefined,
    cubicCapacity: vehicle.cubicCapacity ?? undefined,
    co2Emission: vehicle.co2Emission ?? undefined,
    cylinders: vehicle.cylinders ?? undefined,
    numberOfGears: vehicle.numberOfGears ?? undefined,
    emissionStandard: mapEnum(vehicle.emissionStandard) as any,
    consumptionCity: vehicle.consumptionCity ?? undefined,
    consumptionCountry: vehicle.consumptionCountry ?? undefined,
    consumptionTotal: vehicle.consumptionTotal ?? undefined,
    range: vehicle.range ?? undefined,
    batteryCapacity: vehicle.batteryCapacity ?? undefined,
    batteryRentalMonth: vehicle.batteryRentalMonth ?? undefined,
    powerConsumption: vehicle.powerConsumption ?? undefined,
    batteryOwnership: mapEnum(vehicle.batteryOwnership) as any,
    chargingPlugTypeStandard: mapEnum(vehicle.chargingPlugTypeStandard) as any,
    chargingPlugTypeFast: mapEnum(vehicle.chargingPlugTypeFast) as any,
    chargingPower: vehicle.chargingPower ?? undefined,
    combustionEnginePowerHp: vehicle.combustionEnginePowerHp ?? undefined,
    electricMotorPowerHp: vehicle.electricMotorPowerHp ?? undefined,
    vehicleDescription: vehicle.vehicleDescription ?? "",
    equipment: (vehicle.equipment as any) ?? {},
    extras: (vehicle.extras as any) ?? {},
    images: vehicle.images ?? [],
  };
}
