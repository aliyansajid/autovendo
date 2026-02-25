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
  BodyTypeEnum,
  DriveTypeEnum,
  EquipmentEnum,
  FuelTypeEnum,
  TransmissionTypeEnum,
  VehicleConditionEnum,
  ColorEnum,
  EnergyLabelEnum,
  EmissionStandardEnum,
} from "@/constants";

const CURRENT_YEAR = new Date().getFullYear();

const formSchema = z.object({
  title: z
    .string()
    .min(5, "Bug title must be at least 5 characters.")
    .max(32, "Bug title must be at most 32 characters.")
    .optional(),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters.")
    .max(100, "Description must be at most 100 characters.")
    .optional(),
  year: z.array(z.number()),
  "year-from": z.string().optional(),
  "year-to": z.string().optional(),
  mileage: z.array(z.number()),
  "mileage-from": z.string().optional(),
  "mileage-to": z.string().optional(),
  price: z.array(z.number()),
  "price-from": z.string().optional(),
  "price-to": z.string().optional(),
  priceType: z.string().optional(),
  power: z.array(z.number()),
  "power-from": z.string().optional(),
  "power-to": z.string().optional(),
  powerType: z.string().optional(),
  capacity: z.array(z.number()),
  "capacity-from": z.string().optional(),
  "capacity-to": z.string().optional(),
  cylinder: z.array(z.number()),
  "cylinder-from": z.string().optional(),
  "cylinder-to": z.string().optional(),
  consumption: z.array(z.number()),
  "consumption-from": z.string().optional(),
  "consumption-to": z.string().optional(),
  emissions: z.array(z.number()),
  "emissions-from": z.string().optional(),
  "emissions-to": z.string().optional(),
  daysListed: z.string().optional(),
  conditions: z.array(z.string()).optional(),
});

export const AdvancedSearchForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      year: [1900, CURRENT_YEAR],
      "year-from": "1900",
      "year-to": CURRENT_YEAR.toString(),
      mileage: [0, 400000],
      "mileage-from": "0",
      "mileage-to": "400000",
      price: [0, 1000000],
      "price-from": "0",
      "price-to": "1000000+",
      priceType: "price",
      power: [0, 1500],
      "power-from": "0",
      "power-to": "1500",
      powerType: "ps",
      capacity: [1, 8000],
      "capacity-from": "1",
      "capacity-to": "8000+",
      cylinder: [1, 16],
      "cylinder-from": "1",
      "cylinder-to": "16",
      consumption: [0, 30],
      "consumption-from": "0",
      "consumption-to": "30+",
      emissions: [0, 560],
      "emissions-from": "0",
      "emissions-to": "560+",
      daysListed: "any",
      conditions: [],
    },
  });

  const yearRange = form.watch("year") || [1900, CURRENT_YEAR];
  const mileageRange = form.watch("mileage") || [0, 400000];
  const priceRange = form.watch("price") || [0, 1000000];
  const powerRange = form.watch("power") || [0, 1500];
  const capacityRange = form.watch("capacity") || [1, 8000];
  const cylinderRange = form.watch("cylinder") || [1, 16];
  const consumptionRange = form.watch("consumption") || [0, 30];
  const emissionsRange = form.watch("emissions") || [0, 560];

  useEffect(() => {
    form.setValue("year-from", yearRange[0]?.toString() || "1900");
    form.setValue(
      "year-to",
      yearRange[1]?.toString() || CURRENT_YEAR.toString(),
    );
  }, [yearRange, form]);

  useEffect(() => {
    form.setValue("mileage-from", mileageRange[0]?.toString() || "0");
    addCommas("mileage-to", mileageRange[1], "400000+", form);
  }, [mileageRange, form]);

  useEffect(() => {
    form.setValue("price-from", priceRange[0]?.toString() || "0");
    addCommas("price-to", priceRange[1], "1000000+", form);
  }, [priceRange, form]);

  useEffect(() => {
    form.setValue("power-from", powerRange[0]?.toString() || "0");
    addCommas("power-to", powerRange[1], "1500+", form);
  }, [powerRange, form]);

  useEffect(() => {
    form.setValue("capacity-from", capacityRange[0]?.toString() || "1");
    addCommas("capacity-to", capacityRange[1], "8000+", form);
  }, [capacityRange, form]);

  useEffect(() => {
    form.setValue("cylinder-from", cylinderRange[0]?.toString() || "1");
    addCommas("cylinder-to", cylinderRange[1], "16", form);
  }, [cylinderRange, form]);

  useEffect(() => {
    form.setValue("consumption-from", consumptionRange[0]?.toString() || "0");
    addCommas("consumption-to", consumptionRange[1], "30+", form);
  }, [consumptionRange, form]);

  useEffect(() => {
    form.setValue("emissions-from", emissionsRange[0]?.toString() || "0");
    addCommas("emissions-to", emissionsRange[1], "560+", form);
  }, [emissionsRange, form]);

  function addCommas(
    field: any,
    val: number | undefined,
    maxString: string,
    f: any,
  ) {
    if (val === undefined) {
      f.setValue(field, maxString);
    } else if (field === "price-to" && val >= 1000000) {
      f.setValue(field, "1'000'000+");
    } else if (field === "mileage-to" && val >= 400000) {
      f.setValue(field, "400'000+");
    } else if (field === "power-to" && val >= 1500) {
      f.setValue(field, "1'500+");
    } else if (field === "capacity-to" && val >= 8000) {
      f.setValue(field, "8'000+");
    } else if (field === "consumption-to" && val >= 30) {
      f.setValue(field, "30+");
    } else if (field === "emissions-to" && val >= 560) {
      f.setValue(field, "560+");
    } else {
      f.setValue(field, val.toString());
    }
  }

  const yearHistogram = [
    { year: 1910, h: 10 },
    { year: 1920, h: 20 },
    { year: 1930, h: 30 },
    { year: 1940, h: 45 },
    { year: 1950, h: 60 },
    { year: 1960, h: 80 },
    { year: 1970, h: 60 },
    { year: 1980, h: 40 },
    { year: 1990, h: 20 },
    { year: 2000, h: 10 },
    { year: 2010, h: 50 },
    { year: 2015, h: 90 },
    { year: 2020, h: 100 },
    { year: CURRENT_YEAR, h: 30 },
  ];

  const mileageHistogram = [
    { value: 0, h: 100 },
    { value: 30000, h: 80 },
    { value: 60000, h: 60 },
    { value: 90000, h: 40 },
    { value: 120000, h: 20 },
    { value: 150000, h: 10 },
    { value: 180000, h: 5 },
    { value: 210000, h: 5 },
    { value: 240000, h: 20 },
    { value: 270000, h: 40 },
    { value: 300000, h: 60 },
    { value: 330000, h: 30 },
    { value: 360000, h: 10 },
    { value: 400000, h: 5 },
  ];

  const priceHistogram = [
    { value: 0, h: 20 },
    { value: 20000, h: 30 },
    { value: 40000, h: 50 },
    { value: 60000, h: 70 },
    { value: 80000, h: 90 },
    { value: 100000, h: 60 },
    { value: 120000, h: 40 },
    { value: 140000, h: 30 },
    { value: 160000, h: 20 },
    { value: 180000, h: 10 },
    { value: 200000, h: 10 },
    { value: 1000000, h: 5 },
  ];

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
            { id: "trailer", label: "Anhänger", icon: Truck },
          ].map((type) => (
            <button
              key={type.id}
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
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <Label className="text-base font-semibold">Preis</Label>
                      <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                        Zurücksetzen
                      </span>
                    </div>

                    <CustomFormField
                      control={form.control}
                      fieldType={FormFieldType.RADIO_GROUP}
                      name="priceType"
                      className="flex-row gap-4 mb-0"
                      wrapperClassName="w-fit"
                      options={[
                        { label: "Kaufpreis", value: "price" },
                        { label: "Leasingrate", value: "leasing" },
                      ]}
                    />
                  </div>

                  <div className="h-16 flex items-end justify-between gap-1 px-2 pb-2">
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
                        112'484
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
                        107'688
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
                        155'177
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
                  {BodyTypeEnum.map(
                    (type: { value: string; label: string }) => (
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
                    ),
                  )}
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
                    {FuelTypeEnum.map((type) => (
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
                  <span className="text-sm text-muted-foreground">86'371</span>
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
                    options={[
                      { label: "Beliebig", value: "any" },
                      { label: "1 Tag", value: "1 tag" },
                      { label: "2 Tage", value: "2 tage" },
                      { label: "3 Tage", value: "3 tage" },
                      { label: "5 Tage", value: "5 tage" },
                      { label: "7 Tage", value: "7 tage" },
                      { label: "14 Tage", value: "14 tage" },
                      { label: "28 Tage", value: "28 tage" },
                    ]}
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
                    {[
                      { l: "AMAG", c: "7'967" },
                      { l: "Audi Occasion :plus", c: "768" },
                      { l: "Auto Welt von Rotz AG", c: "902" },
                      { l: "BMW", c: "1'873" },
                      { l: "BMW Premium Selection", c: "2'725" },
                      { l: "BYD Official Partner", c: "145" },
                      { l: "CUPRA Approved", c: "153" },
                      { l: "Jaguar Approved", c: "2" },
                      { l: "Land Rover Approved", c: "37" },
                      { l: "Merbag", c: "1'601" },
                      { l: "Mercedes-Benz Certified", c: "2'899" },
                      { l: "Mini", c: "133" },
                      { l: "Occasionen MINI NEXT", c: "227" },
                      { l: "Quality1", c: "30'309" },
                      { l: "SEAT Occasion Plus", c: "145" },
                      { l: "Skoda Occasion Plus", c: "424" },
                      { l: "VFAS", c: "2'046" },
                      { l: "Volvo Selekt", c: "1'581" },
                      { l: "VW Occasion Plus", c: "770" },
                    ].map((item) => (
                      <div
                        key={item.l}
                        className="flex items-center justify-between"
                      >
                        <CustomFormField
                          control={form.control}
                          fieldType={FormFieldType.CHECKBOX}
                          name={`seal-${item.l.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                          label={item.l}
                        />
                        <span className="text-sm text-muted-foreground">
                          {item.c}
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
            className="w-full max-w-3xl bg-[#FFCE00] hover:bg-[#FFCE00]/90 text-black"
          >
            155'927 Fahrzeuge anzeigen
          </Button>
        </div>
      </form>
    </div>
  );
};
