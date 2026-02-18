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
  ChargingPlugTypeStandardEnum,
  ChargingPlugTypeFastEnum,
  BatteryOwnershipEnum,
  WarrantyEnum,
  EquipmentEnum,
  ExtrasEnum,
} from "@/constants";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@repo/ui/src/components/accordion";
import { vehicleFormSchema } from "@/schema/vehicle-form-schema";
import { Label } from "@repo/ui/src/components/label";

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

  const showCombustionOrMild = [
    "petrol",
    "diesel",
    "lpg-petrol",
    "mhev-diesel",
    "mhev-petrol",
    "cng-petrol",
    "ethanol-petrol",
  ].includes(fuelType || "");

  const showElectric = fuelType === "electric";

  const showFullHybrid = ["hev-diesel", "hev-petrol"].includes(fuelType || "");

  const showHydrogen = fuelType === "hydrogen";

  const showPluginHybrid = ["phev-diesel", "phev-petrol"].includes(
    fuelType || "",
  );

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
            <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 px-1">
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
                control={control}
                fieldType={FormFieldType.SELECT}
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
                control={control}
                fieldType={FormFieldType.SELECT}
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
                control={control}
                fieldType={FormFieldType.INPUT}
                name="version"
                label="Version"
                placeholder="Enter a version"
                className="w-full"
              />

              <CustomFormField
                control={control}
                fieldType={FormFieldType.SELECT}
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
                control={control}
                fieldType={FormFieldType.SELECT}
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
                control={control}
                fieldType={FormFieldType.SELECT}
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
                control={control}
                fieldType={FormFieldType.SELECT}
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
                control={control}
                fieldType={FormFieldType.SELECT}
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
                control={control}
                fieldType={FormFieldType.CHECKBOX}
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
            <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 px-1">
              <CustomFormField
                control={control}
                fieldType={FormFieldType.SELECT}
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
                control={control}
                fieldType={FormFieldType.DATE_PICKER}
                name="lastInspectionDate"
                label="Last inspection at MFK"
                placeholder="Select Date"
                className="w-full"
              />

              <div className="grid grid-cols-2 gap-6">
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.SELECT}
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
                  control={control}
                  fieldType={FormFieldType.SELECT}
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
                control={control}
                fieldType={FormFieldType.INPUT}
                inputType="number"
                name="mileage"
                label="Mileage"
                placeholder="0"
                className="w-full"
              />

              <CustomFormField
                control={control}
                fieldType={FormFieldType.SELECT}
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
                control={control}
                fieldType={FormFieldType.CHECKBOX}
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
            <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 px-1">
              <CustomFormField
                control={control}
                fieldType={FormFieldType.INPUT_GROUP}
                inputType="number"
                name="price"
                label="Price"
                inputGroupText="CHF"
                placeholder="0"
              />
              <CustomFormField
                control={control}
                fieldType={FormFieldType.INPUT_GROUP}
                inputType="number"
                name="newPrice"
                label="New Price"
                inputGroupText="CHF"
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
            <AccordionContent className="space-y-6 px-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-y-3 pt-6">
                {EquipmentEnum.map((equipment) => (
                  <CustomFormField
                    key={equipment.value}
                    control={control}
                    fieldType={FormFieldType.CHECKBOX}
                    name={`equipment.${equipment.value}`}
                    label={equipment.label}
                  />
                ))}
              </div>
              <div className="space-y-4 pt-4">
                <Label className="text-lg text-primary font-semibold">
                  Extras
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-3">
                  {ExtrasEnum.map((extra) => (
                    <CustomFormField
                      key={extra.value}
                      control={control}
                      fieldType={FormFieldType.CHECKBOX}
                      name={`extras.${extra.value}`}
                      label={extra.label}
                    />
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Separator />

        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger className="flex items-center text-xl text-primary font-bold cursor-pointer hover:no-underline">
              Technical Data
            </AccordionTrigger>
            <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 px-1">
              <div className="grid grid-cols-2 gap-6">
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT}
                  inputType="number"
                  name="doors"
                  label="Doors"
                  placeholder="0"
                />

                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT}
                  inputType="number"
                  name="seats"
                  label="Seats"
                  placeholder="0"
                />
              </div>

              {(showCombustionOrMild || showFullHybrid || showPluginHybrid) && (
                <div className="space-y-2">
                  <Label>Consumption (l/100 km)</Label>
                  <div className="grid grid-cols-3 gap-6">
                    <CustomFormField
                      control={control}
                      fieldType={FormFieldType.INPUT}
                      inputType="text"
                      name="consumptionCity"
                      placeholder="City"
                    />

                    <CustomFormField
                      control={control}
                      fieldType={FormFieldType.INPUT}
                      inputType="text"
                      name="consumptionCountry"
                      placeholder="Country"
                    />

                    <CustomFormField
                      control={control}
                      fieldType={FormFieldType.INPUT}
                      inputType="text"
                      name="consumptionTotal"
                      placeholder="Total"
                    />
                  </div>
                </div>
              )}

              {(showCombustionOrMild || showHydrogen) && (
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT_GROUP}
                  inputType="number"
                  name="cubicCapacity"
                  label="Cubic capacity"
                  inputGroupText="cm³"
                  placeholder="0"
                />
              )}

              {(showCombustionOrMild ||
                showFullHybrid ||
                showHydrogen ||
                showPluginHybrid) && (
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT_GROUP}
                  inputType="number"
                  name="co2Emission"
                  label="CO2 emission"
                  inputGroupText="g/km"
                  placeholder="0"
                />
              )}

              {(showCombustionOrMild || showHydrogen) && (
                <>
                  <CustomFormField
                    control={control}
                    fieldType={FormFieldType.INPUT}
                    inputType="number"
                    name="cylinders"
                    label="Cylinders"
                    placeholder="0"
                  />

                  <CustomFormField
                    control={control}
                    fieldType={FormFieldType.INPUT}
                    inputType="number"
                    name="numberOfGears"
                    label="Number of gears"
                    placeholder="0"
                  />
                </>
              )}

              <CustomFormField
                control={control}
                fieldType={FormFieldType.SELECT}
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
                  control={control}
                  fieldType={FormFieldType.INPUT}
                  inputType="number"
                  name="hp"
                  label="HP"
                  placeholder="0"
                />

                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT}
                  inputType="number"
                  name="kw"
                  label="kW"
                  placeholder="0"
                />
              </div>

              <CustomFormField
                control={control}
                fieldType={FormFieldType.INPUT}
                name="typeApproval"
                label="Type Approval"
                placeholder="Enter type approval"
                className="w-full"
              />

              <CustomFormField
                control={control}
                fieldType={FormFieldType.INPUT_GROUP}
                inputType="number"
                name="wheelbase"
                label="Wheelbase"
                inputGroupText="mm"
                placeholder="0"
                className="w-full"
              />

              <CustomFormField
                control={control}
                fieldType={FormFieldType.INPUT}
                name="vehicleIdentificationNumber"
                label="Vehicle identification number"
                placeholder="Enter vehicle identification number"
                className="w-full"
              />

              <div className="grid grid-cols-2 gap-6">
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT_GROUP}
                  inputType="number"
                  name="emptyWeight"
                  label="Empty Weight"
                  inputGroupText="kg"
                  placeholder="0"
                />

                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT_GROUP}
                  inputType="number"
                  name="loadCapacity"
                  label="Load Capacity"
                  inputGroupText="kg"
                  placeholder="0"
                />
              </div>

              <CustomFormField
                control={control}
                fieldType={FormFieldType.INPUT}
                name="serialNumber"
                label="Serial Number"
                placeholder="Enter serial number"
                className="w-full"
              />

              <div className="grid grid-cols-2 gap-6">
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT_GROUP}
                  inputType="number"
                  name="height"
                  label="Height"
                  inputGroupText="mm"
                  placeholder="0"
                />

                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT_GROUP}
                  inputType="number"
                  name="width"
                  label="Width"
                  inputGroupText="mm"
                  placeholder="0"
                />
              </div>

              <CustomFormField
                control={control}
                fieldType={FormFieldType.INPUT_GROUP}
                inputType="number"
                name="length"
                label="Length"
                inputGroupText="mm"
                placeholder="0"
              />

              <CustomFormField
                control={control}
                fieldType={FormFieldType.INPUT_GROUP}
                inputType="number"
                name="towingCapacityBraked"
                label="Towing capacity"
                inputGroupText="kg"
                placeholder="0"
              />

              {(showElectric || showFullHybrid || showPluginHybrid) && (
                <>
                  <CustomFormField
                    control={control}
                    fieldType={FormFieldType.INPUT_GROUP}
                    inputType="number"
                    name="range"
                    label="Range"
                    inputGroupText="km"
                    placeholder="0"
                  />

                  {(showElectric || showPluginHybrid) && (
                    <CustomFormField
                      control={control}
                      fieldType={FormFieldType.SELECT}
                      name="batteryOwnership"
                      label="Battery ownership model"
                      placeholder="Select an option"
                      className="w-full"
                    >
                      {BatteryOwnershipEnum.map((e) => (
                        <SelectItem key={e.value} value={e.value}>
                          {e.label}
                        </SelectItem>
                      ))}
                    </CustomFormField>
                  )}

                  <CustomFormField
                    control={control}
                    fieldType={FormFieldType.INPUT_GROUP}
                    inputType="number"
                    name="batteryCapacity"
                    label="Battery capacity"
                    inputGroupText="kWh"
                    placeholder="0"
                  />

                  {(showElectric || showPluginHybrid) && (
                    <>
                      {batteryOwnership === "battery-rent-required" && (
                        <CustomFormField
                          control={control}
                          fieldType={FormFieldType.INPUT_GROUP}
                          inputType="number"
                          name="batteryRentalMonth"
                          label="Battery rental"
                          inputGroupText="CHF/month"
                          placeholder="0"
                        />
                      )}

                      <CustomFormField
                        control={control}
                        fieldType={FormFieldType.INPUT_GROUP}
                        inputType="number"
                        name="powerConsumption"
                        label="Power consumption"
                        inputGroupText="kWh/100km"
                        placeholder="0"
                      />

                      <CustomFormField
                        control={control}
                        fieldType={FormFieldType.INPUT_GROUP}
                        inputType="number"
                        name="batterySoh"
                        label="Battery state of health"
                        inputGroupText="0-100%"
                        placeholder="0"
                      />

                      <CustomFormField
                        control={control}
                        fieldType={FormFieldType.SELECT}
                        name="chargingPlugTypeStandard"
                        label="Charging plug type - standard (AC)"
                        placeholder="Select an option"
                        className="w-full"
                      >
                        {ChargingPlugTypeStandardEnum.map((e) => (
                          <SelectItem key={e.value} value={e.value}>
                            {e.label}
                          </SelectItem>
                        ))}
                      </CustomFormField>

                      <CustomFormField
                        control={control}
                        fieldType={FormFieldType.SELECT}
                        name="chargingPlugTypeFast"
                        label="Charging plug type - fast charge (DC)"
                        placeholder="Select an option"
                        className="w-full"
                      >
                        {ChargingPlugTypeFastEnum.map((e) => (
                          <SelectItem key={e.value} value={e.value}>
                            {e.label}
                          </SelectItem>
                        ))}
                      </CustomFormField>

                      <CustomFormField
                        control={control}
                        fieldType={FormFieldType.INPUT_GROUP}
                        inputType="number"
                        name="chargingPower"
                        label="Charging power"
                        inputGroupText="kW"
                        placeholder="0"
                      />

                      <CustomFormField
                        control={control}
                        fieldType={FormFieldType.INPUT_GROUP}
                        inputType="number"
                        name="chargingTime80"
                        label="Charging time in minutes"
                        inputGroupText="0-80%"
                        placeholder="0"
                      />

                      <CustomFormField
                        control={control}
                        fieldType={FormFieldType.INPUT_GROUP}
                        inputType="number"
                        name="fastChargingTime80"
                        label="Fast charging time in minutes"
                        inputGroupText="0-80%"
                        placeholder="0"
                      />

                      <CustomFormField
                        control={control}
                        fieldType={FormFieldType.INPUT_GROUP}
                        inputType="number"
                        name="chargingTime100"
                        label="Charging time in minutes"
                        inputGroupText="0-100%"
                        placeholder="0"
                      />

                      <CustomFormField
                        control={control}
                        fieldType={FormFieldType.INPUT_GROUP}
                        inputType="number"
                        name="fastChargingTime100"
                        label="Fast charging time in minutes"
                        inputGroupText="0-100%"
                        placeholder="0"
                      />
                    </>
                  )}

                  {showFullHybrid && (
                    <CustomFormField
                      control={control}
                      fieldType={FormFieldType.INPUT_GROUP}
                      inputType="number"
                      name="powerConsumption"
                      label="Power consumption"
                      inputGroupText="kWh/100km"
                      placeholder="0"
                    />
                  )}
                </>
              )}

              {(showFullHybrid || showPluginHybrid) && (
                <>
                  <CustomFormField
                    control={control}
                    fieldType={FormFieldType.INPUT}
                    inputType="number"
                    name="combustionEnginePowerHp"
                    label="Combustion Engine Power (HP)"
                    placeholder="0"
                  />
                  <CustomFormField
                    control={control}
                    fieldType={FormFieldType.INPUT}
                    inputType="number"
                    name="electricMotorPowerHp"
                    label="Electric Motor Power (HP)"
                    placeholder="0"
                  />
                </>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Separator />

        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger className="flex items-center text-xl text-primary font-bold cursor-pointer hover:no-underline">
              Detailed Information
            </AccordionTrigger>
            <AccordionContent className="pt-6 px-1">
              <CustomFormField
                fieldType={FormFieldType.TEXTAREA}
                control={control}
                name="vehicleDescription"
                label="Description"
                placeholder="Enter detailed description..."
                className="h-32"
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
