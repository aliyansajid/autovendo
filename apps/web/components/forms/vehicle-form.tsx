"use client";

import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@repo/ui/components/form";
import { Button } from "@repo/ui/components/button";
import {
  SelectGroup,
  SelectItem,
  SelectLabel,
} from "@repo/ui/components/select";
import { Separator } from "@repo/ui/components/separator";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/components/custom-form-field";
import {
  makes,
  models,
  GearTransmissionEnum,
  TransmissionTypeEnum,
  DriveTypeEnum,
  BodyTypeEnum,
  FuelTypeEnum,
  ColorEnum,
  VehicleConditionEnum,
  EnergyLabelEnum,
  EmissionStandardEnum,
  ChargingPlugTypeStandardEnum,
  ChargingPlugTypeFastEnum,
  BatteryOwnershipEnum,
  WarrantyEnum,
} from "@/constants";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@repo/ui/src/components/accordion";
import { vehicleFormSchema } from "@/schema/vehicle-form-schema";

export function VehicleForm() {
  const form = useForm<z.infer<typeof vehicleFormSchema>>({
    resolver: zodResolver(vehicleFormSchema) as any,
    defaultValues: {
      make: "",
      model: "",
      metallic: false,
      inspectionPassed: false,
      equipment: {
        camera360: false,
        abs: false,
        adaptiveCruiseControl: false,
        adaptiveForwardLighting: false,
        additionalInstrumentation: false,
        airSuspension: false,
        alarmSystem: false,
        alcantaraSeats: false,
        alloyWheels: false,
        androidAuto: false,
        antiTheftDevice: false,
        appleCarplay: false,
        automaticAirConditioning: false,
        backrestProtection: false,
        blindSpotAssist: false,
        bluetoothInterface: false,
        brakeAssist: false,
        cargoBox: false,
        chromeParts: false,
        clothSeats: false,
        cruiseControl: false,
        dabRadio: false,
        detachableTowBar: false,
        differentialLocking: false,
        electricTailgate: false,
        electricWindows: false,
        electricallyAdjustableSeat: false,
        esp: false,
        fastCharge: false,
        fixedTowBar: false,
        flooring: false,
        handsFreeKit: false,
        hardtop: false,
        headUpDisplay: false,
        heatedSeats: false,
        isofix: false,
        keylessAccess: false,
        laneKeepingAssist: false,
        laserHeadlights: false,
        leatherSeats: false,
        ledHeadlights: false,
        luggageRack: false,
        manualAirConditioning: false,
        navigationSystem: false,
        panoramicRoof: false,
        parkAssist: false,
        parkingSensorFront: false,
        parkingSensorRear: false,
        partialLeatherSeats: false,
        portableNavigationSystem: false,
        rearViewCamera: false,
        reinforcedSuspension: false,
        slidingDoor: false,
        speaker: false,
        specialPaint: false,
        sportExhaust: false,
        sportSeats: false,
        startStopSystem: false,
        stationaryHeating: false,
        sunroof: false,
        swivellingTowBar: false,
        ventilatedSeats: false,
        wingDoors: false,
        xenonHeadlights: false,
        extras8tyres: false,
      },
      accessibleForDisabledPeople: false,
      accidentVehicle: false,
      directParallelImport: false,
      raceCar: false,
      tuning: false,
      version: "",
      vehicleDescription: "",
      typeApproval: "",
      vehicleIdentificationNumber: "",
      serialNumber: "",
      warranty: "",
      registrationMonth: undefined,
      registrationYear: undefined,
    },
  });

  const { control, handleSubmit } = form;
  const selectedMake = form.watch("make");

  const gearTransmission = useWatch({ control, name: "gearTransmission" });
  const fuelType = useWatch({ control, name: "fuelType" });
  const batteryOwnership = useWatch({ control, name: "batteryOwnership" });

  const onSubmit = (data: z.infer<typeof vehicleFormSchema>) => {
    console.log("Form Submitted:", data);
    alert(JSON.stringify(data, null, 2));
  };

  const showCombustion = [
    "Bioethanol/petrol",
    "Diesel",
    "Hybrid (diesel/electric)",
    "Hybrid (petrol/electric)",
    "Liquefied petroleum gas (LPG)/petrol",
    "Mild hybrid (diesel/electric)",
    "Mild hybrid (petrol/electric)",
    "Natural gas (CNG)/petrol",
    "Petrol",
    "Plug-in hybrid (diesel/electric)",
    "Plug-in hybrid (petrol/electric)",
  ].includes(fuelType || "");

  const showElectric = [
    "Electric",
    "Hybrid (diesel/electric)",
    "Hybrid (petrol/electric)",
    "Mild hybrid (diesel/electric)",
    "Mild hybrid (petrol/electric)",
    "Plug-in hybrid (diesel/electric)",
    "Plug-in hybrid (petrol/electric)",
  ].includes(fuelType || "");

  const showHydrogen = fuelType === "Hydrogen";

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) =>
    (currentYear - i).toString(),
  );
  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger className="flex items-center text-xl text-primary font-bold cursor-pointer hover:no-underline">
              Vehicle Features
            </AccordionTrigger>
            <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.SELECT}
                name="make"
                label="Make"
                placeholder="Select an option"
                className="w-full"
              >
                {makes.map((group) => (
                  <SelectGroup key={group.label}>
                    <SelectLabel>{group.label}</SelectLabel>
                    {group.items.map((make) => (
                      <SelectItem
                        key={`${group.label}-${make.value}`}
                        value={make.value}
                      >
                        {make.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </CustomFormField>

              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.SELECT}
                name="model"
                label="Model"
                placeholder="Select an option"
                className="w-full"
                disabled={!selectedMake}
              >
                {selectedMake &&
                  models[selectedMake as keyof typeof models]?.map(
                    (model: { value: string; label: string }) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ),
                  )}
              </CustomFormField>

              <CustomFormField
                fieldType={FormFieldType.SELECT}
                control={control}
                name="gearTransmission"
                label="Gear Transmission"
                placeholder="Select an option"
                className="w-full"
              >
                {GearTransmissionEnum.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </CustomFormField>

              <CustomFormField
                fieldType={FormFieldType.SELECT}
                control={control}
                name="transmissionType"
                label="Transmission Type"
                placeholder="Select an option"
                className="w-full"
                disabled={!gearTransmission}
              >
                {TransmissionTypeEnum.filter((t) => {
                  if (!gearTransmission) return true;
                  if (gearTransmission === "automatic") {
                    return [
                      "automatic",
                      "automatic-stepless",
                      "semi-automatic",
                    ].includes(t.value);
                  }
                  if (gearTransmission === "manual") {
                    return t.value === "manual";
                  }
                  return true;
                }).map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </CustomFormField>

              <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={control}
                name="version"
                label="Version"
                placeholder="Enter a version"
                className="w-full"
              />

              <CustomFormField
                fieldType={FormFieldType.SELECT}
                control={control}
                name="driveType"
                label="Drive Type"
                placeholder="Select an option"
                className="w-full"
              >
                {DriveTypeEnum.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </CustomFormField>

              <CustomFormField
                fieldType={FormFieldType.SELECT}
                control={control}
                name="bodyType"
                label="Body Type"
                placeholder="Select an option"
                className="w-full"
              >
                {BodyTypeEnum.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </CustomFormField>

              <CustomFormField
                fieldType={FormFieldType.SELECT}
                control={control}
                name="fuelType"
                label="Fuel Type"
                placeholder="Select an option"
                className="w-full"
              >
                {FuelTypeEnum.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </CustomFormField>

              <CustomFormField
                fieldType={FormFieldType.SELECT}
                control={control}
                name="interiorColor"
                label="Interior Color"
                placeholder="Select an option"
                className="w-full"
              >
                {ColorEnum.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    {color.label}
                  </SelectItem>
                ))}
              </CustomFormField>

              <CustomFormField
                fieldType={FormFieldType.SELECT}
                control={control}
                name="exteriorColor"
                label="Exterior Color"
                placeholder="Select an option"
                className="w-full"
              >
                {ColorEnum.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    {color.label}
                  </SelectItem>
                ))}
              </CustomFormField>

              <CustomFormField
                fieldType={FormFieldType.CHECKBOX}
                control={control}
                name="metallic"
                label="Metallic"
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Separator />

        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger className="flex items-center text-xl text-primary font-bold cursor-pointer hover:no-underline">
              State
            </AccordionTrigger>
            <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <CustomFormField
                fieldType={FormFieldType.SELECT}
                control={control}
                name="vehicleCondition"
                label="Vehicle Condition"
                placeholder="Select an option"
                className="w-full"
              >
                {VehicleConditionEnum.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </CustomFormField>

              <CustomFormField
                fieldType={FormFieldType.DATE_PICKER}
                control={control}
                name="lastInspectionDate"
                label="Last inspection at MFK"
                placeholder="Select Date"
                className="w-full"
              />

              <div className="grid grid-cols-2 gap-6">
                <CustomFormField
                  fieldType={FormFieldType.SELECT}
                  control={control}
                  name="registrationMonth"
                  label="Registration Month"
                  placeholder="Month"
                  className="w-full"
                >
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </CustomFormField>
                <CustomFormField
                  fieldType={FormFieldType.SELECT}
                  control={control}
                  name="registrationYear"
                  label="Registration Year"
                  placeholder="Year"
                  className="w-full"
                >
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </CustomFormField>
              </div>

              <CustomFormField
                fieldType={FormFieldType.INPUT}
                inputType="number"
                control={control}
                name="mileage"
                label="Mileage"
                placeholder="0"
                className="w-full"
              />

              <CustomFormField
                fieldType={FormFieldType.SELECT}
                control={control}
                name="warranty"
                label="Warranty"
                placeholder="Select an option"
                className="w-full"
              >
                {WarrantyEnum.map((warranty) => (
                  <SelectItem key={warranty.value} value={warranty.value}>
                    {warranty.label}
                  </SelectItem>
                ))}
              </CustomFormField>

              <CustomFormField
                fieldType={FormFieldType.DATE_PICKER}
                control={control}
                name="firstDate"
                label="First Date"
                placeholder="Select Date"
              />

              <CustomFormField
                fieldType={FormFieldType.CHECKBOX}
                control={control}
                name="inspectionPassed"
                label="Inspection at MFK passed"
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Separator />

        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger className="flex items-center text-xl text-primary font-bold cursor-pointer hover:no-underline">
              Price
            </AccordionTrigger>
            <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <CustomFormField
                fieldType={FormFieldType.INPUT}
                inputType="number"
                control={control}
                name="priceChf"
                label="Price (CHF)"
                placeholder="0"
              />
              <CustomFormField
                fieldType={FormFieldType.INPUT}
                inputType="number"
                control={control}
                name="newPriceChf"
                label="New Price (CHF)"
                placeholder="0"
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Separator />

        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger className="flex items-center text-xl text-primary font-bold cursor-pointer hover:no-underline">
              Equipment
            </AccordionTrigger>
            <AccordionContent className="grid grid-cols-1 md:grid-cols-3 gap-y-2 pt-4">
              {Object.keys(form.getValues().equipment).map((key) => {
                if (key === "extras8tyres") return null;
                const label = key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase());
                return (
                  <CustomFormField
                    key={key}
                    fieldType={FormFieldType.CHECKBOX}
                    control={control}
                    name={`equipment.${key}`}
                    label={label}
                  />
                );
              })}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Separator />

        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger className="flex items-center text-xl text-primary font-bold cursor-pointer hover:no-underline">
              Technical Data
            </AccordionTrigger>
            <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="grid grid-cols-2 gap-6">
                <CustomFormField
                  fieldType={FormFieldType.INPUT}
                  inputType="number"
                  control={control}
                  name="doors"
                  label="Doors"
                  placeholder="0"
                />

                <CustomFormField
                  fieldType={FormFieldType.INPUT}
                  inputType="number"
                  control={control}
                  name="seats"
                  label="Seats"
                  placeholder="0"
                />
              </div>

              <CustomFormField
                fieldType={FormFieldType.SELECT}
                control={control}
                name="energyLabel"
                label="Energy Label"
                placeholder="Select an option"
                className="w-full"
              >
                {EnergyLabelEnum.map((e) => (
                  <SelectItem key={e.value} value={e.value}>
                    {e.label}
                  </SelectItem>
                ))}
              </CustomFormField>

              <div className="grid grid-cols-2 gap-6">
                <CustomFormField
                  fieldType={FormFieldType.INPUT}
                  inputType="number"
                  control={control}
                  name="hp"
                  label="HP"
                  placeholder="0"
                />

                <CustomFormField
                  fieldType={FormFieldType.INPUT}
                  inputType="number"
                  control={control}
                  name="kw"
                  label="kW"
                  placeholder="0"
                />
              </div>

              <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={control}
                name="typeApproval"
                label="Type Approval"
                placeholder="Enter type approval"
                className="w-full"
              />

              <CustomFormField
                fieldType={FormFieldType.INPUT}
                inputType="number"
                control={control}
                name="wheelbase"
                label="Wheelbase"
                placeholder="0"
                className="w-full"
              />

              <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={control}
                name="vehicleIdentificationNumber"
                label="Vehicle identification number"
                placeholder="Enter vehicle identification number"
                className="w-full"
              />

              <div className="grid grid-cols-2 gap-6">
                <CustomFormField
                  fieldType={FormFieldType.INPUT}
                  inputType="number"
                  control={control}
                  name="emptyWeight"
                  label="Empty Weight"
                  placeholder="0"
                />

                <CustomFormField
                  fieldType={FormFieldType.INPUT}
                  inputType="number"
                  control={control}
                  name="loadCapacity"
                  label="Load Capacity"
                  placeholder="0"
                />
              </div>

              <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={control}
                name="serialNumber"
                label="Serial Number"
                placeholder="Enter serial number"
                className="w-full"
              />

              <div className="grid grid-cols-2 gap-6">
                <CustomFormField
                  fieldType={FormFieldType.INPUT}
                  inputType="number"
                  control={control}
                  name="height"
                  label="Height"
                  placeholder="0"
                />

                <CustomFormField
                  fieldType={FormFieldType.INPUT}
                  inputType="number"
                  control={control}
                  name="width"
                  label="Width"
                  placeholder="0"
                />
              </div>

              <CustomFormField
                fieldType={FormFieldType.INPUT}
                inputType="number"
                control={control}
                name="length"
                label="Length"
                placeholder="0"
              />

              <CustomFormField
                fieldType={FormFieldType.INPUT}
                inputType="number"
                control={control}
                name="towingCapacityBraked"
                label="Towing capacity"
                placeholder="0"
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {fuelType && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Technical Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CustomFormField
                fieldType={FormFieldType.INPUT}
                inputType="number"
                control={control}
                name="doors"
                label="Doors"
              />
              <CustomFormField
                fieldType={FormFieldType.INPUT}
                inputType="number"
                control={control}
                name="seats"
                label="Seats"
              />

              {(showCombustion || showHydrogen) && (
                <>
                  <CustomFormField
                    fieldType={FormFieldType.INPUT}
                    inputType="number"
                    control={control}
                    name="consumptionCity"
                    label="Consumption City (l/100 km)"
                  />
                  <CustomFormField
                    fieldType={FormFieldType.INPUT}
                    inputType="number"
                    control={control}
                    name="consumptionCountry"
                    label="Consumption Country (l/100 km)"
                  />
                  <CustomFormField
                    fieldType={FormFieldType.INPUT}
                    inputType="number"
                    control={control}
                    name="consumptionTotal"
                    label="Consumption Total (l/100 km)"
                  />
                  <CustomFormField
                    fieldType={FormFieldType.INPUT}
                    inputType="number"
                    control={control}
                    name="cubicCapacity"
                    label="Cubic Capacity (cm3)"
                  />
                  <CustomFormField
                    fieldType={FormFieldType.INPUT}
                    inputType="number"
                    control={control}
                    name="co2Emission"
                    label="CO2 Emission (g/km)"
                  />
                  <CustomFormField
                    fieldType={FormFieldType.SELECT}
                    control={control}
                    name="emissionStandard"
                    label="Emission Standard"
                  >
                    {EmissionStandardEnum.map((e) => (
                      <SelectItem key={e.value} value={e.value}>
                        {e.label}
                      </SelectItem>
                    ))}
                  </CustomFormField>
                  <CustomFormField
                    fieldType={FormFieldType.INPUT}
                    inputType="number"
                    control={control}
                    name="cylinders"
                    label="Cylinders"
                  />
                  <CustomFormField
                    fieldType={FormFieldType.INPUT}
                    inputType="number"
                    control={control}
                    name="numberOfGears"
                    label="Number of Gears"
                  />
                </>
              )}

              <CustomFormField
                fieldType={FormFieldType.SELECT}
                control={control}
                name="energyLabel"
                label="Energy Label"
              >
                {EnergyLabelEnum.map((e) => (
                  <SelectItem key={e.value} value={e.value}>
                    {e.label}
                  </SelectItem>
                ))}
              </CustomFormField>

              <CustomFormField
                fieldType={FormFieldType.INPUT}
                inputType="number"
                control={control}
                name="hp"
                label="HP"
              />
              <CustomFormField
                fieldType={FormFieldType.INPUT}
                inputType="number"
                control={control}
                name="kw"
                label="kW"
              />
              <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={control}
                name="typeApproval"
                label="Type Approval"
              />
              <CustomFormField
                fieldType={FormFieldType.INPUT}
                inputType="number"
                control={control}
                name="wheelbase"
                label="Wheelbase (mm)"
              />
              <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={control}
                name="vehicleIdentificationNumber"
                label="VIN"
              />
              <CustomFormField
                fieldType={FormFieldType.INPUT}
                inputType="number"
                control={control}
                name="emptyWeight"
                label="Empty Weight (kg)"
              />
              <CustomFormField
                fieldType={FormFieldType.INPUT}
                inputType="number"
                control={control}
                name="loadCapacity"
                label="Load Capacity (kg)"
              />
              <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={control}
                name="serialNumber"
                label="Serial Number"
              />
              <CustomFormField
                fieldType={FormFieldType.INPUT}
                inputType="number"
                control={control}
                name="height"
                label="Height (mm)"
              />
              <CustomFormField
                fieldType={FormFieldType.INPUT}
                inputType="number"
                control={control}
                name="width"
                label="Width (mm)"
              />
              <CustomFormField
                fieldType={FormFieldType.INPUT}
                inputType="number"
                control={control}
                name="length"
                label="Length (mm)"
              />
              <CustomFormField
                fieldType={FormFieldType.INPUT}
                inputType="number"
                control={control}
                name="towingCapacityBraked"
                label="Towing Capacity (kg)"
              />

              {showElectric && (
                <>
                  <CustomFormField
                    fieldType={FormFieldType.INPUT}
                    inputType="number"
                    control={control}
                    name="range"
                    label="Range (km)"
                  />
                  <CustomFormField
                    fieldType={FormFieldType.SELECT}
                    control={control}
                    name="batteryOwnership"
                    label="Battery Ownership"
                  >
                    {BatteryOwnershipEnum.map((e) => (
                      <SelectItem key={e.value} value={e.value}>
                        {e.label}
                      </SelectItem>
                    ))}
                  </CustomFormField>

                  {batteryOwnership === "battery_rent_required" && (
                    <CustomFormField
                      fieldType={FormFieldType.INPUT}
                      inputType="number"
                      control={control}
                      name="batteryRentalMonth"
                      label="Battery Rental (CHF/month)"
                    />
                  )}

                  <CustomFormField
                    fieldType={FormFieldType.INPUT}
                    inputType="number"
                    control={control}
                    name="batteryCapacity"
                    label="Battery Capacity (kWh)"
                  />
                  <CustomFormField
                    fieldType={FormFieldType.INPUT}
                    inputType="number"
                    control={control}
                    name="powerConsumption"
                    label="Power Consumption (kWh/100 km)"
                  />
                  <CustomFormField
                    fieldType={FormFieldType.INPUT}
                    inputType="number"
                    control={control}
                    name="batterySoh"
                    label="Battery SoH (%)"
                  />
                  <CustomFormField
                    fieldType={FormFieldType.SELECT}
                    control={control}
                    name="chargingPlugTypeStandard"
                    label="Charging Plug (AC)"
                  >
                    {ChargingPlugTypeStandardEnum.map((e) => (
                      <SelectItem key={e.value} value={e.value}>
                        {e.label}
                      </SelectItem>
                    ))}
                  </CustomFormField>
                  <CustomFormField
                    fieldType={FormFieldType.SELECT}
                    control={control}
                    name="chargingPlugTypeFast"
                    label="Charging Plug (DC)"
                  >
                    {ChargingPlugTypeFastEnum.map((e) => (
                      <SelectItem key={e.value} value={e.value}>
                        {e.label}
                      </SelectItem>
                    ))}
                  </CustomFormField>
                  <CustomFormField
                    fieldType={FormFieldType.INPUT}
                    inputType="number"
                    control={control}
                    name="chargingPower"
                    label="Charging Power (kW)"
                  />
                  <CustomFormField
                    fieldType={FormFieldType.INPUT}
                    inputType="number"
                    control={control}
                    name="chargingTime80"
                    label="Charging Time 0-80% (min)"
                  />
                  <CustomFormField
                    fieldType={FormFieldType.INPUT}
                    inputType="number"
                    control={control}
                    name="fastChargingTime80"
                    label="Fast Charging Time 0-80% (min)"
                  />
                  <CustomFormField
                    fieldType={FormFieldType.INPUT}
                    inputType="number"
                    control={control}
                    name="chargingTime100"
                    label="Charging Time 0-100% (min)"
                  />
                  <CustomFormField
                    fieldType={FormFieldType.INPUT}
                    inputType="number"
                    control={control}
                    name="fastChargingTime100"
                    label="Fast Charging Time 0-100% (min)"
                  />
                  <CustomFormField
                    fieldType={FormFieldType.INPUT}
                    inputType="number"
                    control={control}
                    name="electricMotorPowerHp"
                    label="Electric Motor Power (HP)"
                  />
                </>
              )}

              {[
                "Hybrid (diesel/electric)",
                "Hybrid (petrol/electric)",
                "Plug-in hybrid (diesel/electric)",
                "Plug-in hybrid (petrol/electric)",
              ].includes(fuelType || "") && (
                <CustomFormField
                  fieldType={FormFieldType.INPUT}
                  inputType="number"
                  control={control}
                  name="combustionEnginePowerHp"
                  label="Combustion Engine Power (HP)"
                />
              )}
            </div>
          </div>
        )}

        <Separator />

        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger className="flex items-center text-xl text-primary font-bold cursor-pointer hover:no-underline">
              Detailed Information
            </AccordionTrigger>
            <AccordionContent className="grid grid-cols-1 gap-6 pt-4">
              <div className="grid grid-cols-3 gap-6">
                <CustomFormField
                  fieldType={FormFieldType.CHECKBOX}
                  control={control}
                  name="accessibleForDisabledPeople"
                  label="Accessible for disabled people"
                />
                <CustomFormField
                  fieldType={FormFieldType.CHECKBOX}
                  control={control}
                  name="accidentVehicle"
                  label="html accidentVehicle"
                />
                <CustomFormField
                  fieldType={FormFieldType.CHECKBOX}
                  control={control}
                  name="directParallelImport"
                  label="Direct/parallel import"
                />
                <CustomFormField
                  fieldType={FormFieldType.CHECKBOX}
                  control={control}
                  name="raceCar"
                  label="Race car"
                />
                <CustomFormField
                  fieldType={FormFieldType.CHECKBOX}
                  control={control}
                  name="tuning"
                  label="Tuning"
                />
              </div>

              <CustomFormField
                fieldType={FormFieldType.CHECKBOX}
                control={control}
                name="equipment.extras8tyres"
                label="8 tyres"
              />

              <CustomFormField
                fieldType={FormFieldType.TEXTAREA}
                control={control}
                name="vehicleDescription"
                label="Description"
                placeholder="Enter detailed description..."
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Button type="submit" className="w-full">
          Submit
        </Button>
      </form>
    </Form>
  );
}
