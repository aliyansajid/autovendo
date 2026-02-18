import { z } from "zod";
import {
  BatteryOwnershipEnum,
  BodyTypeEnum,
  ChargingPlugTypeFastEnum,
  ChargingPlugTypeStandardEnum,
  ColorEnum,
  DriveTypeEnum,
  EmissionStandardEnum,
  EnergyLabelEnum,
  FuelTypeEnum,
  GearTransmissionEnum,
  TransmissionTypeEnum,
  VehicleConditionEnum,
  WarrantyEnum,
} from "@/constants";

export const vehicleFormSchema = z.object({
  // Vehicle Features
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  gearTransmission: z.enum(
    GearTransmissionEnum.map((item) => item.value) as [string, ...string[]],
  ),
  transmissionType: z
    .enum(
      TransmissionTypeEnum.map((item) => item.value) as [string, ...string[]],
    )
    .optional(), // Dependent on gearTransmission
  version: z.string().optional(), // If Manual
  driveType: z.enum(
    DriveTypeEnum.map((item) => item.value) as [string, ...string[]],
  ),
  bodyType: z.enum(
    BodyTypeEnum.map((item) => item.value) as [string, ...string[]],
    {
      error: "Please select a body type",
    },
  ),
  fuelType: z.enum(
    FuelTypeEnum.map((item) => item.value) as [string, ...string[]],
  ),
  color: z.enum(ColorEnum.map((item) => item.value) as [string, ...string[]], {
    error: "Please select a color",
  }),
  interiorColor: z.enum(
    ColorEnum.map((item) => item.value) as [string, ...string[]],
  ),
  metallic: z.boolean().default(false),

  // State
  vehicleCondition: z.enum(
    VehicleConditionEnum.map((item) => item.value) as [string, ...string[]],
  ),
  lastInspectionDate: z.date().optional(),
  registrationMonth: z.coerce.number().min(1).max(12).optional(),
  registrationYear: z.coerce
    .number()
    .min(1900)
    .max(new Date().getFullYear())
    .optional(),
  inspectionPassed: z.boolean().default(false),
  mileage: z.coerce.number().min(0, "Mileage must be positive"),
  warranty: z
    .enum(WarrantyEnum.map((item) => item.value) as [string, ...string[]])
    .optional(),
  firstDate: z.date().optional(),

  // Price
  priceChf: z.coerce.number().min(0),
  newPriceChf: z.coerce.number().optional(),

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
  doors: z.coerce.number().optional(),
  seats: z.coerce.number().optional(),
  energyLabel: z
    .enum(EnergyLabelEnum.map((item) => item.value) as [string, ...string[]])
    .optional(),
  hp: z.coerce.number().optional(),
  kw: z.coerce.number().optional(),
  typeApproval: z.string().optional(),
  wheelbase: z.coerce.number().optional(),
  vehicleIdentificationNumber: z.string().optional(),
  emptyWeight: z.coerce.number().optional(),
  loadCapacity: z.coerce.number().optional(),
  serialNumber: z.string().optional(),
  height: z.coerce.number().optional(),
  width: z.coerce.number().optional(),
  length: z.coerce.number().optional(),
  towingCapacityBraked: z.coerce.number().optional(),

  // Combustion / Hybrid specific
  consumptionCity: z.coerce.number().optional(),
  consumptionCountry: z.coerce.number().optional(),
  consumptionTotal: z.coerce.number().optional(),
  cubicCapacity: z.coerce.number().optional(),
  co2Emission: z.coerce.number().optional(),
  emissionStandard: z
    .enum(
      EmissionStandardEnum.map((item) => item.value) as [string, ...string[]],
    )
    .optional(),
  cylinders: z.coerce.number().optional(),
  numberOfGears: z.coerce.number().optional(),

  // Electric / Hybrid specific
  range: z.coerce.number().optional(),
  batteryOwnership: z
    .enum(
      BatteryOwnershipEnum.map((item) => item.value) as [string, ...string[]],
    )
    .optional(),
  batteryCapacity: z.coerce.number().optional(),
  batteryRentalMonth: z.coerce.number().optional(),
  powerConsumption: z.coerce.number().optional(),
  batterySoh: z.coerce.number().min(0).max(100).optional(),
  chargingPlugTypeStandard: z
    .enum(
      ChargingPlugTypeStandardEnum.map((item) => item.value) as [
        string,
        ...string[],
      ],
    )
    .optional(),
  chargingPlugTypeFast: z
    .enum(
      ChargingPlugTypeFastEnum.map((item) => item.value) as [
        string,
        ...string[],
      ],
    )
    .optional(),
  chargingPower: z.coerce.number().optional(), // kW
  chargingTime80: z.coerce.number().optional(), // minutes
  fastChargingTime80: z.coerce.number().optional(), // minutes
  chargingTime100: z.coerce.number().optional(),
  fastChargingTime100: z.coerce.number().optional(),
  electricMotorPowerHp: z.coerce.number().optional(),
  combustionEnginePowerHp: z.coerce.number().optional(),
  images: z.any().optional(),
});
