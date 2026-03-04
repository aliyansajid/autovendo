"use client";

import { useEffect, useState } from "react";
import { Car, Truck, Caravan, X, PlusCircle, MinusCircle } from "lucide-react";
import { Button } from "@repo/ui/src/components/button";
import { Label } from "@repo/ui/src/components/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/src/components/accordion";
import { Badge } from "@repo/ui/src/components/badge";
import { Separator } from "@repo/ui/src/components/separator";
import { MakeSelectorDialog } from "@/components/make-selector-dialog";
import { MakeExclusionDialog } from "@/components/make-exclusion-dialog";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/src/components/custom-form-field";
import {
  DriveTypeEnum,
  EquipmentEnum,
  TransmissionTypeEnum,
  VehicleConditionEnum,
  ColorEnum,
  EnergyLabelEnum,
  EmissionStandardEnum,
  daysListedOptions,
  qualityLabels,
  yearHistogram,
  mileageHistogram,
  priceHistogram,
} from "@/constants";
import {
  carBodyTypeEnum,
  carFuelTypeEnum,
  carExtrasEnum,
} from "@/constants/cars";
import {
  utilityBodyTypeEnum,
  utilityFuelTypeEnum,
  utilityExtrasEnum,
} from "@/constants/commercial-vehicles";
import {
  truckBodyTypeEnum,
  truckFuelTypeEnum,
  truckExtrasEnum,
} from "@/constants/truck";
import {
  camperBodyTypeEnum,
  camperFuelTypeEnum,
  camperExtrasEnum,
} from "@/constants/camper";

const CURRENT_YEAR = new Date().getFullYear();

const positiveNum = z.number({
  error: "Bitte geben Sie eine positive Zahl ein",
});
const nonnegativeRange = z.array(positiveNum.nonnegative());
const positiveRange = z.array(positiveNum.positive());
const optionalStr = z.string().optional();

const formSchema = z.object({
  year: nonnegativeRange,
  "year-from": optionalStr,
  "year-to": optionalStr,
  mileage: nonnegativeRange,
  "mileage-from": optionalStr,
  "mileage-to": optionalStr,
  price: nonnegativeRange,
  "price-from": optionalStr,
  "price-to": optionalStr,
  priceType: optionalStr,
  power: nonnegativeRange,
  "power-from": optionalStr,
  "power-to": optionalStr,
  powerType: optionalStr,
  capacity: positiveRange,
  "capacity-from": optionalStr,
  "capacity-to": optionalStr,
  cylinder: positiveRange,
  "cylinder-from": optionalStr,
  "cylinder-to": optionalStr,
  consumption: nonnegativeRange,
  "consumption-from": optionalStr,
  "consumption-to": optionalStr,
  emissions: nonnegativeRange,
  "emissions-from": optionalStr,
  "emissions-to": optionalStr,
  daysListed: optionalStr,
  conditions: z.array(z.string()).optional(),
});

export const AdvancedSearchForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { powerType: "ps", daysListed: "any" },
  });

  const yearRange = form.watch("year") || [1900, CURRENT_YEAR];
  const mileageRange = form.watch("mileage") || [0, 400000];
  const priceRange = form.watch("price") || [0, 1000000];

  useEffect(() => {
    form.setValue("year-from", yearRange[0]?.toString() || "1900");
    form.setValue(
      "year-to",
      yearRange[1]?.toString() || CURRENT_YEAR.toString(),
    );
  }, [yearRange, form]);

  function onSubmit(data: z.infer<typeof formSchema>) {
    console.log(data);
  }

  const [vehicleType, setVehicleType] = useState("car");
  const [isMakeModalOpen, setIsMakeModalOpen] = useState(false);
  const [isExclusionModalOpen, setIsExclusionModalOpen] = useState(false);
  const [selectedMakes, setSelectedMakes] = useState<string[]>([]);
  const [excludedMakes, setExcludedMakes] = useState<string[]>([]);

  const handleMakeSelect = (make: string) => {
    setSelectedMakes((prev) => (prev.includes(make) ? prev : [...prev, make]));
    setIsMakeModalOpen(false);
  };

  const handleMakeExclusion = (make: string) => {
    setExcludedMakes((prev) => (prev.includes(make) ? prev : [...prev, make]));
    setIsExclusionModalOpen(false);
  };

  return (
    <div className="w-full max-w-285 mx-auto px-4 py-12">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex items-center justify-between pb-3 border-b">
          <h1 className="text-2xl font-bold">Filter</h1>
          <Button variant="ghost">
            Schliessen <X />
          </Button>
        </div>

        <div className="flex overflow-x-auto gap-8 mb-8 pt-8 scrollbar-hide border-b">
          {[
            { id: "car", label: "Personenwagen", icon: Car },
            { id: "camper", label: "Wohnmobil", icon: Caravan },
            { id: "utility", label: "Nutzfahrzeug", icon: Truck },
            { id: "truck", label: "Lastwagen", icon: Truck },
          ].map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setVehicleType(type.id)}
              className={`flex items-center gap-3 pb-4 min-w-max transition-all ${
                vehicleType === type.id
                  ? "text-foreground border-b-2 border-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <type.icon className="w-6 h-6" />
              <span className="text-base font-medium">{type.label}</span>
            </button>
          ))}
        </div>

        <Accordion
          type="multiple"
          defaultValue={[
            "make",
            "basic",
            "tech",
            "equipment",
            "extras",
            "appearance",
            "energy",
            "more",
          ]}
          className="w-full space-y-8"
        >
          <AccordionItem value="make" className="border-none">
            <AccordionTrigger className="flex items-center text-xl font-bold text-primary hover:no-underline">
              Marke & Modell
            </AccordionTrigger>
            <AccordionContent className="pt-6">
              <div className="flex flex-row gap-2">
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsMakeModalOpen(true)}
                >
                  <PlusCircle />
                  Hinzufügen
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsExclusionModalOpen(true)}
                >
                  <MinusCircle />
                  Ausschliessen
                </Button>
              </div>

              <div className="mt-4 space-y-4">
                {selectedMakes.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                      Include
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedMakes.map((make) => (
                        <Badge
                          key={make}
                          variant="secondary"
                          className="text-sm"
                        >
                          {make}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {excludedMakes.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-red-500 uppercase tracking-wider">
                      Exclude
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {excludedMakes.map((make) => (
                        <Badge
                          key={make}
                          variant="destructive"
                          className="text-sm"
                        >
                          {make}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedMakes.length === 0 && excludedMakes.length === 0 && (
                  <div className="p-8 bg-muted border-2 border-dashed rounded-xl flex items-center justify-center text-muted-foreground">
                    Keine Fahrzeuge ausgewählt.
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <MakeSelectorDialog
            open={isMakeModalOpen}
            onOpenChange={setIsMakeModalOpen}
            onSelect={handleMakeSelect}
          />

          <MakeExclusionDialog
            open={isExclusionModalOpen}
            onOpenChange={setIsExclusionModalOpen}
            onSelect={handleMakeExclusion}
          />

          <Separator />

          <AccordionItem value="basic" className="border-none">
            <AccordionTrigger className="text-xl font-bold text-primary hover:no-underline flex items-center">
              Basisdaten
            </AccordionTrigger>
            <AccordionContent className="pt-6 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <Label className="text-base font-semibold">Jahr</Label>
                    <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                      Zurücksetzen
                    </span>
                  </div>

                  <div className="h-16 flex items-end justify-between gap-1">
                    {yearHistogram.map(
                      (item: { year: number; h: number }, i: number) => {
                        const yStart = yearRange?.[0] ?? 1900;
                        const yEnd = yearRange?.[1] ?? CURRENT_YEAR;
                        const isActive =
                          item.year >= yStart && item.year <= yEnd;
                        return (
                          <div
                            key={i}
                            className={`w-full rounded-t transition-colors ${
                              isActive
                                ? "bg-primary"
                                : "bg-muted-foreground/30 opacity-50"
                            }`}
                            style={{ height: `${item.h}%` }}
                          ></div>
                        );
                      },
                    )}
                  </div>
                  <CustomFormField
                    control={form.control}
                    fieldType={FormFieldType.SLIDER}
                    name="year"
                    min={1900}
                    max={CURRENT_YEAR}
                    step={1}
                  >
                    <div className="flex gap-2">
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.INPUT_GROUP}
                        name="year-from"
                        placeholder="1900"
                      />
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.INPUT_GROUP}
                        name="year-to"
                        placeholder={CURRENT_YEAR.toString()}
                      />
                    </div>
                  </CustomFormField>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col">
                    <Label className="text-base font-semibold">
                      Kilometerstand
                    </Label>
                    <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                      Zurücksetzen
                    </span>
                  </div>
                  <div className="h-16 flex items-end justify-between gap-1">
                    {mileageHistogram.map(
                      (item: { value: number; h: number }, i: number) => {
                        const mStart = mileageRange?.[0] ?? 0;
                        const mEnd = mileageRange?.[1] ?? 400000;
                        const isActive =
                          item.value >= mStart && item.value <= mEnd;
                        return (
                          <div
                            key={i}
                            className={`w-full rounded-t transition-colors ${
                              isActive
                                ? "bg-primary"
                                : "bg-muted-foreground/30 opacity-50"
                            }`}
                            style={{ height: `${item.h}%` }}
                          ></div>
                        );
                      },
                    )}
                  </div>
                  <CustomFormField
                    control={form.control}
                    fieldType={FormFieldType.SLIDER}
                    name="mileage"
                    min={0}
                    max={400000}
                    step={1000}
                  >
                    <div className="flex gap-2">
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.INPUT_GROUP}
                        name="mileage-from"
                        placeholder="0"
                        inputGroupText="km"
                      />
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.INPUT_GROUP}
                        name="mileage-to"
                        placeholder="400'000+"
                        inputGroupText="km"
                      />
                    </div>
                  </CustomFormField>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col">
                    <Label className="text-base font-semibold">Preis</Label>
                    <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                      Zurücksetzen
                    </span>
                  </div>

                  <div className="h-16 flex items-end justify-between gap-1">
                    {priceHistogram.map(
                      (item: { value: number; h: number }, i: number) => {
                        const pStart = priceRange?.[0] ?? 0;
                        const pEnd = priceRange?.[1] ?? 1000000;
                        const isActive =
                          item.value >= pStart && item.value <= pEnd;
                        return (
                          <div
                            key={i}
                            className={`w-full rounded-t transition-colors ${
                              isActive
                                ? "bg-primary"
                                : "bg-muted-foreground/30 opacity-50"
                            }`}
                            style={{ height: `${item.h}%` }}
                          ></div>
                        );
                      },
                    )}
                  </div>
                  <CustomFormField
                    control={form.control}
                    fieldType={FormFieldType.SLIDER}
                    name="price"
                    min={0}
                    max={200000}
                    step={1000}
                  >
                    <div className="flex gap-2 text-sm">
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.INPUT_GROUP}
                        name="price-from"
                        placeholder="0"
                        inputGroupText="CHF"
                      />
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.INPUT_GROUP}
                        name="price-to"
                        placeholder="1'000'000+"
                        inputGroupText="CHF"
                      />
                    </div>
                  </CustomFormField>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <Label className="text-base font-semibold">Zustand</Label>
                    <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                      Zurücksetzen
                    </span>
                  </div>
                  <div className="space-y-3">
                    {VehicleConditionEnum.map(
                      (item: { value: string; label: string }) => (
                        <div
                          key={item.value}
                          className="flex items-center justify-between"
                        >
                          <CustomFormField
                            control={form.control}
                            fieldType={FormFieldType.CHECKBOX}
                            name={`condition-${item.value}`}
                            label={item.label}
                          />
                          <span className="text-sm text-muted-foreground">
                            {Math.floor(Math.random() * 50000).toLocaleString(
                              "de-CH",
                            )}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col">
                    <Label className="text-base font-semibold">
                      MFK & Garantie
                    </Label>
                    <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                      Zurücksetzen
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.CHECKBOX}
                        name="condition"
                        label="Ab MFK"
                      />
                      <span className="text-sm text-muted-foreground">
                        112&apos;484
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.CHECKBOX}
                        name="condition"
                        label="Mit Garantie"
                      />
                      <span className="text-sm text-muted-foreground">
                        107&apos;688
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col">
                    <Label className="text-base font-semibold">
                      Unfallfahrzeug
                    </Label>
                    <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                      Zurücksetzen
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.CHECKBOX}
                        name="condition"
                        label="Unfallfahrzeug"
                      />
                      <span className="text-sm text-muted-foreground">750</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.CHECKBOX}
                        name="condition"
                        label="Kein Unfallfahrzeug"
                      />
                      <span className="text-sm text-muted-foreground">
                        155&apos;177
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex flex-col">
                  <Label className="text-base font-semibold">Aufbauart</Label>
                  <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                    Zurücksetzen
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-3">
                  {(vehicleType === "utility"
                    ? utilityBodyTypeEnum
                    : vehicleType === "truck"
                      ? truckBodyTypeEnum
                      : vehicleType === "camper"
                        ? camperBodyTypeEnum
                        : carBodyTypeEnum
                  ).map((type: { value: string; label: string }) => (
                    <div
                      key={type.value}
                      className="flex items-center justify-between"
                    >
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.CHECKBOX}
                        name={`bodyType-${type.value}`}
                        label={type.label}
                      />
                      <span className="text-sm text-muted-foreground">
                        {Math.floor(Math.random() * 50000).toLocaleString(
                          "de-CH",
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <Separator />

          <AccordionItem value="tech" className="border-none">
            <AccordionTrigger className="flex items-center text-xl font-bold text-primary hover:no-underline">
              Technischen Daten
            </AccordionTrigger>
            <AccordionContent className="pt-6 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <Label className="text-base font-semibold">
                      Treibstoff
                    </Label>
                    <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                      Zurücksetzen
                    </span>
                  </div>
                  <div className="space-y-3">
                    {(vehicleType === "utility"
                      ? utilityFuelTypeEnum
                      : vehicleType === "truck"
                        ? truckFuelTypeEnum
                        : vehicleType === "camper"
                          ? camperFuelTypeEnum
                          : carFuelTypeEnum
                    ).map((type: { value: string; label: string }) => (
                      <div
                        key={type.value}
                        className="flex items-center justify-between"
                      >
                        <CustomFormField
                          control={form.control}
                          fieldType={FormFieldType.CHECKBOX}
                          name={type.value}
                          label={type.label}
                        />
                        <span className="text-sm text-muted-foreground">
                          {Math.floor(Math.random() * 50000).toLocaleString(
                            "de-CH",
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col">
                    <Label className="text-base font-semibold">Getriebe</Label>
                    <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                      Zurücksetzen
                    </span>
                  </div>
                  <div className="space-y-3">
                    {TransmissionTypeEnum.map((type) => (
                      <div
                        key={type.value}
                        className="flex items-center justify-between"
                      >
                        <CustomFormField
                          control={form.control}
                          fieldType={FormFieldType.CHECKBOX}
                          name={type.value}
                          label={type.label}
                        />
                        <span className="text-sm text-muted-foreground">
                          {Math.floor(Math.random() * 50000).toLocaleString(
                            "de-CH",
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col">
                    <Label className="text-base font-semibold">Antrieb</Label>
                    <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                      Zurücksetzen
                    </span>
                  </div>
                  <div className="space-y-3">
                    {DriveTypeEnum.map((type) => (
                      <div
                        key={type.value}
                        className="flex items-center justify-between"
                      >
                        <CustomFormField
                          control={form.control}
                          fieldType={FormFieldType.CHECKBOX}
                          name={type.value}
                          label={type.label}
                        />
                        <span className="text-sm text-muted-foreground">
                          {Math.floor(Math.random() * 50000).toLocaleString(
                            "de-CH",
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <Label className="text-base font-semibold">
                        Leistung
                      </Label>
                      <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                        Zurücksetzen
                      </span>
                    </div>
                    <CustomFormField
                      control={form.control}
                      fieldType={FormFieldType.RADIO_GROUP}
                      name="powerType"
                      wrapperClassName="w-fit"
                      options={[
                        { label: "PS", value: "ps" },
                        { label: "kW", value: "kw" },
                      ]}
                    />
                  </div>

                  <CustomFormField
                    control={form.control}
                    fieldType={FormFieldType.SLIDER}
                    name="power"
                    min={0}
                    max={1500}
                    step={10}
                  >
                    <div className="flex gap-2">
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.INPUT_GROUP}
                        name="power-from"
                        inputGroupText="PS"
                        placeholder="0"
                      />
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.INPUT_GROUP}
                        name="power-to"
                        inputGroupText="PS"
                        placeholder="1'500+"
                      />
                    </div>
                  </CustomFormField>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col">
                    <Label className="text-base font-semibold">Hubraum</Label>
                    <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                      Zurücksetzen
                    </span>
                  </div>
                  <CustomFormField
                    control={form.control}
                    fieldType={FormFieldType.SLIDER}
                    name="capacity"
                    min={1}
                    max={8000}
                    step={100}
                  >
                    <div className="flex gap-2">
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.INPUT_GROUP}
                        name="capacity-from"
                        inputGroupText="cm³"
                        placeholder="1"
                      />
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.INPUT_GROUP}
                        name="capacity-to"
                        inputGroupText="cm³"
                        placeholder="8'000+"
                      />
                    </div>
                  </CustomFormField>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col">
                    <Label className="text-base font-semibold">Zylinder</Label>
                    <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                      Zurücksetzen
                    </span>
                  </div>
                  <CustomFormField
                    control={form.control}
                    fieldType={FormFieldType.SLIDER}
                    name="cylinder"
                    min={1}
                    max={16}
                    step={1}
                  >
                    <div className="flex gap-2">
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.INPUT_GROUP}
                        name="cylinder-from"
                        placeholder="1"
                      />
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.INPUT_GROUP}
                        name="cylinder-to"
                        placeholder="16"
                      />
                    </div>
                  </CustomFormField>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <Separator />

          <AccordionItem value="equipment" className="border-none">
            <AccordionTrigger className="flex items-center text-xl font-bold text-primary hover:no-underline">
              Ausstattung
            </AccordionTrigger>
            <AccordionContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-3">
                {EquipmentEnum.map((equipment) => (
                  <CustomFormField
                    key={equipment.value}
                    control={form.control}
                    fieldType={FormFieldType.CHECKBOX}
                    name={equipment.value}
                    label={equipment.label}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <Separator />

          <AccordionItem value="extras" className="border-none">
            <AccordionTrigger className="flex items-center text-xl font-bold text-primary hover:no-underline">
              Extras
            </AccordionTrigger>
            <AccordionContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-3">
                {(vehicleType === "utility"
                  ? utilityExtrasEnum
                  : vehicleType === "truck"
                    ? truckExtrasEnum
                    : vehicleType === "camper"
                      ? camperExtrasEnum
                      : carExtrasEnum
                ).map((extra: { value: string; label: string }) => (
                  <CustomFormField
                    key={extra.value}
                    control={form.control}
                    fieldType={FormFieldType.CHECKBOX}
                    name={extra.value}
                    label={extra.label}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <Separator />

          <AccordionItem value="appearance" className="border-none">
            <AccordionTrigger className="flex items-center text-xl font-bold text-primary hover:no-underline">
              Farbe
            </AccordionTrigger>
            <AccordionContent className="pt-6 space-y-12">
              <div className="space-y-4">
                <div className="flex flex-col">
                  <Label className="text-base font-semibold">Aussenfarbe</Label>
                  <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                    Zurücksetzen
                  </span>
                </div>

                <div className="flex items-center">
                  <CustomFormField
                    control={form.control}
                    fieldType={FormFieldType.CHECKBOX}
                    name="metallic"
                    label="Metallic"
                  />
                  <span className="text-sm text-muted-foreground">
                    86&apos;371
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-3">
                  {ColorEnum.map((color) => (
                    <div
                      key={color.value}
                      className="flex items-center justify-between"
                    >
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.CHECKBOX}
                        name={color.value}
                        label={
                          <span className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded-full border border-border/20 ${"border" in color && color.border ? "border-border" : ""}`}
                              style={{
                                background:
                                  "gradient" in color
                                    ? color.gradient
                                    : color.hex,
                              }}
                            />
                            {color.label}
                          </span>
                        }
                      />
                      <span className="text-sm text-muted-foreground">
                        {Math.floor(Math.random() * 50000).toLocaleString(
                          "de-CH",
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex flex-col">
                  <Label className="text-base font-semibold">Innenfarbe</Label>
                  <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                    Zurücksetzen
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-12">
                  {ColorEnum.map((color) => (
                    <div
                      key={color.value}
                      className="flex items-center justify-between"
                    >
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.CHECKBOX}
                        name={`int-${color.value}`}
                        label={
                          <span className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded-full border border-border/20 ${"border" in color && color.border ? "border-border" : ""}`}
                              style={{
                                background:
                                  "gradient" in color
                                    ? color.gradient
                                    : color.hex,
                              }}
                            />
                            {color.label}
                          </span>
                        }
                      />
                      <span className="text-sm text-muted-foreground">
                        {Math.floor(Math.random() * 50000).toLocaleString(
                          "de-CH",
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <Separator />

          <AccordionItem value="energy" className="border-none">
            <AccordionTrigger className="flex items-center text-xl font-bold text-primary hover:no-underline">
              Energie & Umwelt
            </AccordionTrigger>
            <AccordionContent className="pt-6 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <Label className="text-base font-semibold">Verbrauch</Label>
                    <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                      Zurücksetzen
                    </span>
                  </div>
                  <CustomFormField
                    control={form.control}
                    fieldType={FormFieldType.SLIDER}
                    name="consumption"
                    min={0}
                    max={30}
                    step={0.1}
                  >
                    <div className="flex gap-2">
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.INPUT_GROUP}
                        name="consumption-from"
                        placeholder="0"
                        inputGroupText="1/100km"
                      />
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.INPUT_GROUP}
                        name="consumption-to"
                        placeholder="30+"
                        inputGroupText="1/100km"
                      />
                    </div>
                  </CustomFormField>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col">
                    <Label className="text-base font-semibold">
                      CO2-Emissionen
                    </Label>
                    <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                      Zurücksetzen
                    </span>
                  </div>
                  <CustomFormField
                    control={form.control}
                    fieldType={FormFieldType.SLIDER}
                    name="emissions"
                    min={0}
                    max={560}
                    step={1}
                  >
                    <div className="flex gap-2">
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.INPUT_GROUP}
                        name="emissions-from"
                        placeholder="0"
                        inputGroupText="g/km"
                      />
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.INPUT_GROUP}
                        name="emissions-to"
                        placeholder="560+"
                        inputGroupText="g/km"
                      />
                    </div>
                  </CustomFormField>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col">
                    <Label className="text-base font-semibold">
                      Energieeffizienz
                    </Label>
                    <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                      Zurücksetzen
                    </span>
                  </div>
                  <div className="space-y-3">
                    {EnergyLabelEnum.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between"
                      >
                        <CustomFormField
                          control={form.control}
                          fieldType={FormFieldType.CHECKBOX}
                          name={item.value}
                          label={item.label}
                        />
                        <span className="text-sm text-muted-foreground">
                          {Math.floor(Math.random() * 50000).toLocaleString(
                            "de-CH",
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col">
                  <Label className="text-base font-semibold">Euronorm</Label>
                  <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                    Zurücksetzen
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-3">
                  {EmissionStandardEnum.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between"
                    >
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.CHECKBOX}
                        name={item.value}
                        label={item.label}
                      />
                      <span className="text-sm text-muted-foreground">
                        {Math.floor(Math.random() * 50000).toLocaleString(
                          "de-CH",
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <Separator />

          <AccordionItem value="more" className="border-none">
            <AccordionTrigger className="flex items-center text-xl font-bold text-primary hover:no-underline">
              Weitere Filter
            </AccordionTrigger>
            <AccordionContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <Label className="text-base font-semibold">
                      Inseratedauer
                    </Label>
                    <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                      Zurücksetzen
                    </span>
                  </div>
                  <CustomFormField
                    control={form.control}
                    fieldType={FormFieldType.RADIO_GROUP}
                    name="daysListed"
                    className="flex-col"
                    options={
                      daysListedOptions as unknown as {
                        label: string;
                        value: string;
                      }[]
                    }
                  />
                </div>

                <div className="space-y-4 lg:col-span-2">
                  <div className="flex flex-col">
                    <Label className="text-base font-semibold">
                      Qualitätslabel
                    </Label>
                    <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                      Zurücksetzen
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                    {qualityLabels.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between"
                      >
                        <CustomFormField
                          control={form.control}
                          fieldType={FormFieldType.CHECKBOX}
                          name={`seal-${item.label.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                          label={item.label}
                        />
                        <span className="text-sm text-muted-foreground">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="fixed bottom-0 left-0 right-0 py-4 px-4 md:px-0 bg-background flex justify-center items-center z-50 shadow-2xl border-t">
          <Button
            size="lg"
            className="w-full max-w-xl bg-rating hover:bg-rating/90 text-black"
          >
            155&apos;927 Fahrzeuge anzeigen
          </Button>
        </div>
      </form>
    </div>
  );
};
