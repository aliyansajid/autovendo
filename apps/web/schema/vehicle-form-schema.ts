import { z } from "zod";
import {
  BatteryOwnershipEnum,
  ChargingPlugTypeFastEnum,
  ChargingPlugTypeStandardEnum,
  ColorEnum,
  DriveTypeEnum,
  EmissionStandardEnum,
  EnergyLabelEnum,
  GearTransmissionEnum,
  TransmissionTypeEnum,
  VehicleConditionEnum,
  WarrantyEnum,
} from "@/constants";
import { carBodyTypeEnum, carFuelTypeEnum } from "@/constants/cars";
import { utilityBodyTypeEnum } from "@/constants/commercial-vehicles";
import { truckBodyTypeEnum, truckFuelTypeEnum } from "@/constants/truck";
import { camperBodyTypeEnum, camperFuelTypeEnum } from "@/constants/camper";

export const vehicleFormSchema = z
  .object({
    // Vehicle Type
    vehicleType: z.enum(["car", "utility", "truck", "camper"], {
      error: "Bitte wählen Sie einen Fahrzeugtyp.",
    }),

    // Vehicle Features
    make: z
      .string({ error: "Bitte wählen Sie eine Marke." })
      .min(1, "Bitte wählen Sie eine Marke."),
    model: z.string().optional(),
    gearTransmission: z
      .enum(
        GearTransmissionEnum.map((item) => item.value) as [string, ...string[]],
      )
      .optional()
      .or(z.literal("")),
    transmissionType: z
      .enum(
        TransmissionTypeEnum.map((item) => item.value) as [string, ...string[]],
      )
      .optional()
      .or(z.literal("")), // Dependent on gearTransmission
    version: z.string().optional(), // If Manual
    driveType: z.enum(
      DriveTypeEnum.map((item) => item.value) as [string, ...string[]],
    ),
    bodyType: z.enum(
      [
        ...carBodyTypeEnum.map((item) => item.value),
        ...utilityBodyTypeEnum.map((item) => item.value),
        ...truckBodyTypeEnum.map((item) => item.value),
        ...camperBodyTypeEnum.map((item) => item.value),
      ] as [string, ...string[]],
      {
        error: "Bitte wählen Sie eine Karosserie.",
      },
    ),
    fuelType: z
      .enum([
        ...new Set([
          ...carFuelTypeEnum.map((item) => item.value),
          ...truckFuelTypeEnum.map((item) => item.value),
          ...camperFuelTypeEnum.map((item) => item.value),
        ]),
      ] as [string, ...string[]])
      .optional()
      .or(z.literal("")),
    color: z.enum(
      ColorEnum.map((item) => item.value) as [string, ...string[]],
      {
        error: "Bitte wählen Sie eine Farbe.",
      },
    ),
    interiorColor: z
      .enum(ColorEnum.map((item) => item.value) as [string, ...string[]])
      .optional()
      .or(z.literal("")),
    metallic: z.boolean().default(false),

    // State
    vehicleCondition: z.enum(
      VehicleConditionEnum.map((item) => item.value) as [string, ...string[]],
      {
        error: "Bitte wählen Sie einen Zustand.",
      },
    ),
    lastInspectionDate: z.date().optional(),
    registrationMonth: z.coerce
      .number({
        error: "Monat ist erforderlich",
      })
      .min(1, "Monat ist erforderlich")
      .max(12),
    registrationYear: z.coerce
      .number({
        error: "Jahr ist erforderlich",
      })
      .min(1900, "Jahr ist erforderlich")
      .max(new Date().getFullYear()),
    inspectionPassed: z.boolean().default(false),
    mileage: z.preprocess(
      (val) => (val === "" || val === undefined ? undefined : Number(val)),
      z
        .number({
          error: "Kilometerstand ist erforderlich",
        })
        .min(0, "Kilometerstand darf nicht negativ sein"),
    ),
    warranty: z
      .enum(WarrantyEnum.map((item) => item.value) as [string, ...string[]])
      .optional()
      .or(z.literal("")),
    firstDate: z.date().optional(),

    // Price
    priceChf: z.preprocess(
      (val) => (val === "" || val === undefined ? undefined : Number(val)),
      z
        .number({
          error: "Preis ist erforderlich",
        })
        .min(0, "Preis darf nicht negativ sein"),
    ),
    newPriceChf: z.coerce
      .number()
      .min(0, "Neupreis darf nicht negativ sein")
      .optional(),

    // Equipment (Booleans)
    equipment: z.object({
      camera360: z.boolean().default(false),
      abs: z.boolean().default(false),
      adaptiveCruiseControl: z.boolean().default(false),
      adaptiveForwardLighting: z.boolean().default(false),
      additionalInstrumentation: z.boolean().default(false),
      airSuspension: z.boolean().default(false),
      alarmSystem: z.boolean().default(false),
      alcantaraSeats: z.boolean().default(false),
      alloyWheels: z.boolean().default(false),
      androidAuto: z.boolean().default(false),
      antiTheftDevice: z.boolean().default(false),
      appleCarplay: z.boolean().default(false),
      automaticAirConditioning: z.boolean().default(false),
      backrestProtection: z.boolean().default(false),
      blindSpotAssist: z.boolean().default(false),
      bluetoothInterface: z.boolean().default(false),
      brakeAssist: z.boolean().default(false),
      cargoBox: z.boolean().default(false),
      chromeParts: z.boolean().default(false),
      clothSeats: z.boolean().default(false),
      cruiseControl: z.boolean().default(false),
      dabRadio: z.boolean().default(false),
      detachableTowBar: z.boolean().default(false),
      differentialLocking: z.boolean().default(false),
      electricTailgate: z.boolean().default(false),
      electricWindows: z.boolean().default(false),
      electricallyAdjustableSeat: z.boolean().default(false),
      esp: z.boolean().default(false),
      fastCharge: z.boolean().default(false),
      fixedTowBar: z.boolean().default(false),
      flooring: z.boolean().default(false),
      handsFreeKit: z.boolean().default(false),
      hardtop: z.boolean().default(false),
      headUpDisplay: z.boolean().default(false),
      heatedSeats: z.boolean().default(false),
      isofix: z.boolean().default(false),
      keylessAccess: z.boolean().default(false),
      laneKeepingAssist: z.boolean().default(false),
      laserHeadlights: z.boolean().default(false),
      leatherSeats: z.boolean().default(false),
      ledHeadlights: z.boolean().default(false),
      luggageRack: z.boolean().default(false),
      manualAirConditioning: z.boolean().default(false),
      navigationSystem: z.boolean().default(false),
      panoramicRoof: z.boolean().default(false),
      parkAssist: z.boolean().default(false),
      parkingSensorFront: z.boolean().default(false),
      parkingSensorRear: z.boolean().default(false),
      partialLeatherSeats: z.boolean().default(false),
      portableNavigationSystem: z.boolean().default(false),
      rearViewCamera: z.boolean().default(false),
      reinforcedSuspension: z.boolean().default(false),
      slidingDoor: z.boolean().default(false),
      speaker: z.boolean().default(false),
      specialPaint: z.boolean().default(false),
      sportExhaust: z.boolean().default(false),
      sportSeats: z.boolean().default(false),
      startStopSystem: z.boolean().default(false),
      stationaryHeating: z.boolean().default(false),
      sunroof: z.boolean().default(false),
      swivellingTowBar: z.boolean().default(false),
      ventilatedSeats: z.boolean().default(false),
      wingDoors: z.boolean().default(false),
      xenonHeadlights: z.boolean().default(false),
      extras8tyres: z.boolean().default(false), // From Detailed Information
    }),

    // Detailed Information
    accessibleForDisabledPeople: z.boolean().default(false),
    accidentVehicle: z.boolean().default(false),
    directParallelImport: z.boolean().default(false),
    raceCar: z.boolean().default(false),
    tuning: z.boolean().default(false),
    vehicleDescription: z.string().optional(),

    // Technical Data (Shared & Specific)
    doors: z.coerce.number().min(0, "Wert darf nicht negativ sein").optional(),
    seats: z.coerce.number().min(0, "Wert darf nicht negativ sein").optional(),
    energyLabel: z
      .enum(EnergyLabelEnum.map((item) => item.value) as [string, ...string[]])
      .optional()
      .or(z.literal("")),
    hp: z.coerce.number().optional(),
    kw: z.coerce.number().optional(),
    typeApproval: z.string().optional(),
    wheelbase: z.coerce.number().optional(),
    vehicleIdentificationNumber: z.string().optional(),
    emptyWeight: z.coerce.number().min(0).optional(),
    loadCapacity: z.coerce.number().min(0).optional(),
    serialNumber: z.string().optional(),
    height: z.coerce.number().optional(),
    width: z.coerce.number().optional(),
    length: z.coerce.number().optional(),
    towingCapacityBraked: z.coerce.number().min(0).optional(),

    // Combustion / Hybrid specific
    consumptionCity: z.coerce.number().min(0).optional(),
    consumptionCountry: z.coerce.number().min(0).optional(),
    consumptionTotal: z.coerce.number().min(0).optional(),
    cubicCapacity: z.coerce.number().min(0).optional(),
    co2Emission: z.coerce.number().min(0).optional(),
    emissionStandard: z
      .enum(
        EmissionStandardEnum.map((item) => item.value) as [string, ...string[]],
      )
      .optional(),
    cylinders: z.coerce.number().min(0).optional(),
    numberOfGears: z.coerce.number().min(0).optional(),

    // Electric / Hybrid specific
    range: z.coerce.number().min(0).optional(),
    batteryOwnership: z
      .enum(
        BatteryOwnershipEnum.map((item) => item.value) as [string, ...string[]],
      )
      .optional(),
    batteryCapacity: z.coerce.number().min(0).optional(),
    batteryRentalMonth: z.coerce.number().min(0).optional(),
    powerConsumption: z.coerce.number().min(0).optional(),
    batterySoh: z.coerce.number().min(0).max(100).optional(),
    chargingPlugTypeStandard: z
      .enum(
        ChargingPlugTypeStandardEnum.map((item) => item.value) as [
          string,
          ...string[],
        ],
      )
      .optional()
      .or(z.literal("")),
    chargingPlugTypeFast: z
      .enum(
        ChargingPlugTypeFastEnum.map((item) => item.value) as [
          string,
          ...string[],
        ],
      )
      .optional()
      .or(z.literal("")),
    chargingPower: z.coerce.number().min(0).optional(), // kW
    chargingTime80: z.coerce.number().min(0).optional(), // minutes
    fastChargingTime80: z.coerce.number().min(0).optional(), // minutes
    chargingTime100: z.coerce.number().min(0).optional(),
    fastChargingTime100: z.coerce.number().min(0).optional(),
    electricMotorPowerHp: z.coerce.number().min(0).optional(),
    combustionEnginePowerHp: z.coerce.number().min(0).optional(),
    images: z.any().optional(),

    // Contact Details
    // Billing Address
    billingFirstName: z.string().min(1, "Bitte geben Sie Ihren Vornamen ein."),
    billingLastName: z.string().min(1, "Bitte geben Sie Ihren Nachnamen ein."),
    billingStreet: z
      .string()
      .min(1, "Bitte geben Sie Strasse und Hausnummer ein."),
    billingZip: z.string().min(1, "Bitte geben Sie die PLZ ein."),
    billingCity: z.string().min(1, "Bitte geben Sie den Ort ein."),
    billingCountry: z
      .literal("Switzerland", {
        message: "Land muss Schweiz sein.",
      })
      .optional(),
    billingPhone: z
      .string()
      .min(1, "Bitte geben Sie Ihre Telefonnummer ein.")
      .regex(/^\+41/, "Telefonnummer muss mit +41 beginnen."),

    // Owner Address
    sameAsBilling: z.boolean().default(false),
    ownerFirstName: z.string().optional(),
    ownerLastName: z.string().optional(),
    ownerStreet: z.string().optional(),
    ownerZip: z.string().optional(),
    ownerCity: z.string().optional(),
    ownerCountry: z.literal("Switzerland").optional(),
    ownerPhone: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.sameAsBilling) {
      if (!data.ownerFirstName) {
        ctx.addIssue({
          code: "custom",
          message: "Bitte geben Sie den Vornamen des Halters ein.",
          path: ["ownerFirstName"],
        });
      }
      if (!data.ownerLastName) {
        ctx.addIssue({
          code: "custom",
          message: "Bitte geben Sie den Nachnamen des Halters ein.",
          path: ["ownerLastName"],
        });
      }
      if (!data.ownerStreet) {
        ctx.addIssue({
          code: "custom",
          message: "Bitte geben Sie Strasse und Nr. des Halters ein.",
          path: ["ownerStreet"],
        });
      }
      if (!data.ownerZip) {
        ctx.addIssue({
          code: "custom",
          message: "Bitte geben Sie die PLZ des Halters ein.",
          path: ["ownerZip"],
        });
      }
      if (!data.ownerCity) {
        ctx.addIssue({
          code: "custom",
          message: "Bitte geben Sie den Ort des Halters ein.",
          path: ["ownerCity"],
        });
      }
      if (data.ownerCountry !== "Switzerland") {
        ctx.addIssue({
          code: "custom",
          message: "Land muss Schweiz sein.",
          path: ["ownerCountry"],
        });
      }
      if (!data.ownerPhone) {
        ctx.addIssue({
          code: "custom",
          message: "Bitte geben Sie die Telefonnummer des Halters ein.",
          path: ["ownerPhone"],
        });
      } else if (!data.ownerPhone.startsWith("+41")) {
        ctx.addIssue({
          code: "custom",
          message: "Telefonnummer muss mit +41 beginnen.",
          path: ["ownerPhone"],
        });
      }
    }
  });
