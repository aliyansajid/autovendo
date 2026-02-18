"use client";

import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@repo/ui/components/form";
import { cn } from "@repo/ui/lib/utils";
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
import { useState } from "react";
import { Check, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/src/components/card";
import { Input } from "@repo/ui/src/components/input";

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
      priceChf: 0,
      newPriceChf: 0,
      images: [],
    },
  });

  const { control, handleSubmit, trigger, setValue, watch } = form; // Added trigger, setValue, watch
  const selectedMake = form.watch("make");

  const [currentStep, setCurrentStep] = useState(1);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const totalSteps = 2;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = async () => {
    const isStepValid = await trigger([
      "make",
      "model",
      "gearTransmission",
      "fuelType",
      "bodyType",
      "color",
      "interiorColor",
      "vehicleCondition",
      "mileage",
      "priceChf",
    ]); // Add other required fields for step 1 validation if needed based on schema

    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setPreviewImages((prev) => [...prev, ...newPreviews]);

      // Update form data - in a real app you might want to handle File objects
      // For now we just store the file objects in the form state
      const currentImages = watch("images") || [];
      setValue("images", [...currentImages, ...files]);
    }
  };

  const removeImage = (index: number) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    const currentImages = watch("images") || [];
    if (Array.isArray(currentImages)) {
      setValue(
        "images",
        currentImages.filter((_, i) => i !== index),
      );
    }
  };

  const gearTransmission = useWatch({ control, name: "gearTransmission" });
  const fuelType = useWatch({ control, name: "fuelType" });
  const batteryOwnership = useWatch({ control, name: "batteryOwnership" });

  const onSubmit = (data: z.infer<typeof vehicleFormSchema>) => {
    console.log("Form Submitted:", data);
    alert(
      JSON.stringify(
        { ...data, images: `${(data.images as any[])?.length || 0} files` },
        null,
        2,
      ),
    );
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

  const steps = [
    { id: 1, label: "Vehicle Details" },
    { id: 2, label: "Photos" },
  ];

  return (
    <Form {...form}>
      <div className="relative flex justify-between w-full max-w-2xl mx-auto mb-8 isolate">
        <div className="absolute top-5 left-0 right-0 h-[2px] -translate-y-1/2 bg-muted" />
        <div
          className="absolute top-5 left-0 h-[2px] -translate-y-1/2 bg-primary transition-all duration-500"
          style={{
            width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - 10rem)`,
          }}
        />

        {steps.map((step) => {
          const isActive = currentStep >= step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div
              key={step.id}
              className="flex flex-col items-center gap-2 bg-background w-40 z-10"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-semibold",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground",
                  isCurrent && "ring-4 ring-primary/20",
                )}
              >
                {isActive && !isCurrent && step.id < currentStep ? (
                  <span className="text-lg">
                    <Check />
                  </span>
                ) : (
                  step.id
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {currentStep === 1 && (
          <div className="space-y-6">
            <Accordion type="single" collapsible defaultValue="item-1">
              <AccordionItem value="item-1">
                <AccordionTrigger className="flex items-center text-xl text-primary font-bold cursor-pointer hover:no-underline">
                  Fahrzeug-Merkmale
                </AccordionTrigger>
                <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 px-1">
                  <div className="grid grid-cols-2 gap-3">
                    <CustomFormField
                      control={form.control}
                      fieldType={FormFieldType.SELECT}
                      name="make"
                      label="Marke"
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
                      label="Modell"
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
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <CustomFormField
                      control={control}
                      fieldType={FormFieldType.SELECT}
                      name="gearTransmission"
                      label="Getriebe"
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
                      label="Getriebe Typ"
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
                  </div>

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
                    label="Antrieb"
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
                    label="Karosserie"
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
                    label="Kraftstoff"
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
                    label="Innenraumfarbe"
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
                    name="color"
                    label="Farbe"
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
                    label="Métalisé"
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Separator />

            <Accordion type="single" collapsible defaultValue="item-1">
              <AccordionItem value="item-1">
                <AccordionTrigger className="flex items-center text-xl text-primary font-bold cursor-pointer hover:no-underline">
                  Zustand
                </AccordionTrigger>
                <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 px-1">
                  <CustomFormField
                    control={control}
                    fieldType={FormFieldType.SELECT}
                    name="vehicleCondition"
                    label="Zustand"
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
                    label="Letzte MFK"
                    placeholder="Select Date"
                    className="w-full"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <CustomFormField
                      control={control}
                      fieldType={FormFieldType.SELECT}
                      name="registrationMonth"
                      label="Monat"
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
                      label="Jahr"
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
                    label="Kilometer"
                    placeholder="0"
                    className="w-full"
                  />

                  <CustomFormField
                    control={control}
                    fieldType={FormFieldType.SELECT}
                    name="warranty"
                    label="Garantie"
                    placeholder="Select an option"
                    className="w-full"
                  >
                    {WarrantyEnum.map((warranty) => (
                      <SelectItem key={warranty.value} value={warranty.value}>
                        {warranty.label}
                      </SelectItem>
                    ))}
                  </CustomFormField>

                  <div className="grid grid-cols-2 gap-3">
                    <CustomFormField
                      control={control}
                      fieldType={FormFieldType.DATE_PICKER}
                      name="warrantyStartDate"
                      label="Start date"
                      placeholder="0"
                      className="w-full"
                    />
                    <CustomFormField
                      control={control}
                      fieldType={FormFieldType.INPUT_GROUP}
                      inputType="number"
                      name="duration"
                      label="Dauer"
                      inputGroupText="months"
                      placeholder="0"
                      className="w-full"
                    />

                    <CustomFormField
                      control={control}
                      fieldType={FormFieldType.INPUT}
                      inputType="number"
                      name="maxKm"
                      label="Max km"
                      placeholder="0"
                      className="w-full"
                    />
                  </div>

                  <CustomFormField
                    control={control}
                    fieldType={FormFieldType.CHECKBOX}
                    name="inspectionPassed"
                    label="MFK bestanden"
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
                    name="priceChf"
                    label="Price"
                    inputGroupText="CHF"
                    placeholder="0"
                  />
                  <CustomFormField
                    control={control}
                    fieldType={FormFieldType.INPUT_GROUP}
                    inputType="number"
                    name="newPriceChf"
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
                  <div className="grid grid-cols-2 gap-3">
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

                  {(showCombustionOrMild ||
                    showFullHybrid ||
                    showPluginHybrid) && (
                    <div className="space-y-2">
                      <Label>Consumption (l/100 km)</Label>
                      <div className="grid grid-cols-3 gap-3">
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

                  <div className="grid grid-cols-2 gap-3">
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

                  <div className="grid grid-cols-2 gap-3">
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

                  <div className="grid grid-cols-2 gap-3">
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
          </div>
        )}

        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Images</CardTitle>
              <CardDescription>
                Add photos of your vehicle. High quality photos increase your
                chances of selling.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg h-60 w-full flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors hover:border-primary/50">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="p-4 rounded-full bg-primary/10">
                    <UploadCloud className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">
                      Click to upload photos
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      WEBP, PNG, JPG, JPEG
                    </p>
                  </div>
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>

              {previewImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-2">
                  {previewImages.map((src, index) => (
                    <div
                      key={index}
                      className="relative aspect-video group rounded-lg overflow-hidden border bg-muted"
                    >
                      <Image
                        src={src}
                        alt={`Vehicle preview ${index + 1}`}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          variant="destructive"
                          type="button"
                          onClick={() => removeImage(index)}
                          className="rounded-full"
                        >
                          <X />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between">
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}
          {currentStep < totalSteps ? (
            <Button type="button" onClick={handleNext} className="ml-auto">
              Next
            </Button>
          ) : (
            <Button type="submit" className="ml-auto">
              Submit
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
