-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('CAR', 'UTILITY', 'TRUCK', 'CAMPER');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('PETROL', 'ETHANOL_PETROL', 'DIESEL', 'ELECTRIC', 'CNG_PETROL', 'LPG_PETROL', 'MHEV_DIESEL', 'MHEV_PETROL', 'PHEV_DIESEL', 'PHEV_PETROL', 'HEV_DIESEL', 'HEV_PETROL', 'HYDROGEN');

-- CreateEnum
CREATE TYPE "GearTransmission" AS ENUM ('AUTOMATIC', 'MANUAL');

-- CreateEnum
CREATE TYPE "TransmissionType" AS ENUM ('AUTOMATIC', 'AUTOMATIC_STEPLESS', 'SEMI_AUTOMATIC', 'MANUAL');

-- CreateEnum
CREATE TYPE "DriveType" AS ENUM ('ALL', 'FRONT', 'REAR');

-- CreateEnum
CREATE TYPE "Color" AS ENUM ('ANTHRACITE', 'BEIGE', 'BLACK', 'BLUE', 'BORDEAUX', 'BROWN', 'GOLD', 'GRAY', 'GREEN', 'MULTICOLOURED', 'ORANGE', 'PINK', 'RED', 'SILVER', 'TURQUOISE', 'VIOLET', 'WHITE', 'YELLOW', 'OTHER');

-- CreateEnum
CREATE TYPE "VehicleCondition" AS ENUM ('NEW', 'DEMONSTRATION', 'PRE_REGISTERED', 'USED', 'OLDTIMER');

-- CreateEnum
CREATE TYPE "Warranty" AS ENUM ('FROM_DELIVERY', 'FROM_FIRST_REGISTRATION', 'FROM_DATE');

-- CreateEnum
CREATE TYPE "EnergyLabel" AS ENUM ('A', 'B', 'C', 'D', 'E', 'F', 'G');

-- CreateEnum
CREATE TYPE "BatteryOwnership" AS ENUM ('BATTERY_INCLUDED', 'BATTERY_RENT_REQUIRED');

-- CreateEnum
CREATE TYPE "ChargingPlugTypeStandard" AS ENUM ('TYPE_1', 'TYPE_2');

-- CreateEnum
CREATE TYPE "ChargingPlugTypeFast" AS ENUM ('CCS', 'CSS_2', 'CHADEMO', 'SUPERCHARGER');

-- CreateEnum
CREATE TYPE "EmissionStandard" AS ENUM ('EURO_1', 'EURO_2', 'EURO_3', 'EURO_4', 'EURO_5', 'EURO_5_PLUS', 'EURO_6', 'EURO_6A', 'EURO_6B', 'EURO_6C', 'EURO_6D', 'EURO_6D_ISC', 'EURO_6D_ISC_FCM', 'EURO_6D_TEMP', 'EURO_6D_TEMP_EVAP', 'EURO_6D_TEMP_EVAP_ISC', 'EURO_6D_TEMP_ISC', 'EURO_6E');

-- CreateTable
CREATE TABLE "vehicle" (
    "id" TEXT NOT NULL,
    "dealerId" TEXT NOT NULL,
    "vehicleType" "VehicleType" NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT,
    "version" TEXT,
    "bodyType" TEXT NOT NULL,
    "fuelType" "FuelType",
    "registrationMonth" INTEGER NOT NULL,
    "registrationYear" INTEGER NOT NULL,
    "kilometer" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "newPrice" INTEGER,
    "color" "Color" NOT NULL,
    "gearTransmission" "GearTransmission",
    "transmissionType" "TransmissionType",
    "driveType" "DriveType",
    "interiorColor" "Color",
    "metallic" BOOLEAN NOT NULL DEFAULT false,
    "vehicleCondition" "VehicleCondition",
    "lastInspectionDate" DATE,
    "inspectionPassed" BOOLEAN NOT NULL DEFAULT false,
    "warranty" "Warranty",
    "warrantyStartDate" DATE,
    "duration" INTEGER,
    "maxKm" INTEGER,
    "doors" INTEGER,
    "seats" INTEGER,
    "hp" INTEGER,
    "kw" INTEGER,
    "energyLabel" "EnergyLabel",
    "typeApproval" TEXT,
    "wheelbase" INTEGER,
    "vehicleIdentificationNumber" TEXT,
    "emptyWeight" INTEGER,
    "loadCapacity" INTEGER,
    "serialNumber" TEXT,
    "height" INTEGER,
    "width" INTEGER,
    "length" INTEGER,
    "towingCapacityBraked" INTEGER,
    "cubicCapacity" INTEGER,
    "co2Emission" INTEGER,
    "cylinders" INTEGER,
    "numberOfGears" INTEGER,
    "emissionStandard" "EmissionStandard",
    "consumptionCity" DOUBLE PRECISION,
    "consumptionCountry" DOUBLE PRECISION,
    "consumptionTotal" DOUBLE PRECISION,
    "range" INTEGER,
    "batteryCapacity" DOUBLE PRECISION,
    "batteryRentalMonth" INTEGER,
    "powerConsumption" DOUBLE PRECISION,
    "batteryOwnership" "BatteryOwnership",
    "chargingPlugTypeStandard" "ChargingPlugTypeStandard",
    "chargingPlugTypeFast" "ChargingPlugTypeFast",
    "chargingPower" DOUBLE PRECISION,
    "combustionEnginePowerHp" INTEGER,
    "electricMotorPowerHp" INTEGER,
    "vehicleDescription" TEXT,
    "equipment" JSONB,
    "extras" JSONB,
    "images" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "vehicle" ADD CONSTRAINT "vehicle_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "dealer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
