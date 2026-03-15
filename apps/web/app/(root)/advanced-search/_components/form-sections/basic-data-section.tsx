"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { useEffect } from "react";
import { Label } from "@repo/ui/src/components/label";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/src/components/accordion";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/src/components/custom-form-field";
import { Separator } from "@repo/ui/src/components/separator";
import {
  VehicleConditionEnum,
  yearHistogram,
  kilometerHistogram,
  priceHistogram,
} from "@/constants";
import { carBodyTypeEnum } from "@/constants/cars";
import { utilityBodyTypeEnum } from "@/constants/commercial-vehicles";
import { truckBodyTypeEnum } from "@/constants/truck";
import { camperBodyTypeEnum } from "@/constants/camper";
import type { VehicleFacets } from "@/lib/schemas/vehicle.schema";
import { formatCount } from "@/lib/helpers/format";

const CURRENT_YEAR = new Date().getFullYear();

export function BasicDataSection({
  vehicleType,
  facets,
}: {
  vehicleType: string;
  facets?: VehicleFacets | null;
}) {
  const { control, watch, setValue, getValues } = useFormContext();

  const yearRange = watch("year") || [1900, CURRENT_YEAR];
  const kilometerRange = watch("kilometer") || [0, 400000];
  const priceRange = watch("price") || [0, 1000000];

  const kilometerFrom = useWatch({ control, name: "kilometer-from" });
  const kilometerTo = useWatch({ control, name: "kilometer-to" });
  const priceFrom = useWatch({ control, name: "price-from" });
  const priceTo = useWatch({ control, name: "price-to" });

  useEffect(() => {
    setValue("year-from", yearRange[0]?.toString() || "1900");
    setValue("year-to", yearRange[1]?.toString() || CURRENT_YEAR.toString());
  }, [yearRange, setValue]);

  useEffect(() => {
    setValue("kilometer-from", kilometerRange[0]?.toString() || "0");
    setValue("kilometer-to", kilometerRange[1]?.toString() || "400000");
  }, [kilometerRange, setValue]);

  useEffect(() => {
    setValue("price-from", priceRange[0]?.toString() || "0");
    setValue("price-to", priceRange[1]?.toString() || "1000000");
  }, [priceRange, setValue]);

  // Two-way sync: inputs -> sliders for kilometer (without depending on slider value to avoid loops)
  useEffect(() => {
    const parseNumber = (val: unknown, fallback: number) => {
      if (val === undefined || val === null || val === "") return fallback;
      const cleaned = String(val).replace(/[^0-9.-]/g, "");
      const num = Number(cleaned);
      return Number.isFinite(num) ? num : fallback;
    };

    const from = parseNumber(kilometerFrom, 0);
    const to = parseNumber(kilometerTo, 400000);

    const [curFrom, curTo] = getValues("kilometer") || [0, 400000];
    if (from === curFrom && to === curTo) return;

    setValue("kilometer", [from, to], { shouldDirty: true });
  }, [kilometerFrom, kilometerTo, getValues, setValue]);

  // Two-way sync: inputs -> sliders for price
  useEffect(() => {
    const parseNumber = (val: unknown, fallback: number) => {
      if (val === undefined || val === null || val === "") return fallback;
      const cleaned = String(val).replace(/[^0-9.-]/g, "");
      const num = Number(cleaned);
      return Number.isFinite(num) ? num : fallback;
    };

    const from = parseNumber(priceFrom, 0);
    const to = parseNumber(priceTo, 1000000);

    const [curFrom, curTo] = getValues("price") || [0, 1000000];
    if (from === curFrom && to === curTo) return;

    setValue("price", [from, to], { shouldDirty: true });
  }, [priceFrom, priceTo, getValues, setValue]);

  return (
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
                  const isActive = item.year >= yStart && item.year <= yEnd;
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
              control={control}
              fieldType={FormFieldType.SLIDER}
              name="year"
              min={1900}
              max={CURRENT_YEAR}
              step={1}
            >
              <div className="flex gap-2">
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT_GROUP}
                  name="year-from"
                  placeholder="1900"
                />
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT_GROUP}
                  name="year-to"
                  placeholder={CURRENT_YEAR.toString()}
                />
              </div>
            </CustomFormField>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col">
              <Label className="text-base font-semibold">Kilometerstand</Label>
              <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                Zurücksetzen
              </span>
            </div>
            <div className="h-16 flex items-end justify-between gap-1">
              {kilometerHistogram.map(
                (item: { value: number; h: number }, i: number) => {
                  const mStart = kilometerRange?.[0] ?? 0;
                  const mEnd = kilometerRange?.[1] ?? 400000;
                  const isActive = item.value >= mStart && item.value <= mEnd;
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
              control={control}
              fieldType={FormFieldType.SLIDER}
              name="kilometer"
              min={0}
              max={400000}
              step={1000}
            >
              <div className="flex gap-2">
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT_GROUP}
                  name="kilometer-from"
                  placeholder="0"
                  inputGroupText="km"
                />
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT_GROUP}
                  name="kilometer-to"
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
                  const isActive = item.value >= pStart && item.value <= pEnd;
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
              control={control}
              fieldType={FormFieldType.SLIDER}
              name="price"
              min={0}
              max={200000}
              step={1000}
            >
              <div className="flex gap-2 text-sm">
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT_GROUP}
                  name="price-from"
                  placeholder="0"
                  inputGroupText="CHF"
                />
                <CustomFormField
                  control={control}
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
                (item: { value: string; label: string }) => {
                  const count = facets?.vehicleCondition?.[item.value];
                  return (
                    <div
                      key={item.value}
                      className="flex items-center justify-between"
                    >
                      <CustomFormField
                        control={control}
                        fieldType={FormFieldType.CHECKBOX}
                        name={`condition-${item.value}`}
                        label={item.label}
                      />
                      <span className="text-sm text-muted-foreground">
                        {formatCount(count ?? 0)}
                      </span>
                    </div>
                  );
                },
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col">
              <Label className="text-base font-semibold">MFK & Garantie</Label>
              <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                Zurücksetzen
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.CHECKBOX}
                  name="condition-mfk"
                  label="Ab MFK"
                />
                <span className="text-sm text-muted-foreground">0</span>
              </div>

              <div className="flex items-center justify-between">
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.CHECKBOX}
                  name="condition-warranty"
                  label="Mit Garantie"
                />
                <span className="text-sm text-muted-foreground">0</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col">
              <Label className="text-base font-semibold">Unfallfahrzeug</Label>
              <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                Zurücksetzen
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.CHECKBOX}
                  name="condition-accident"
                  label="Unfallfahrzeug"
                />
                <span className="text-sm text-muted-foreground">0</span>
              </div>
              <div className="flex items-center justify-between">
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.CHECKBOX}
                  name="condition-noaccident"
                  label="Kein Unfallfahrzeug"
                />
                <span className="text-sm text-muted-foreground">0</span>
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
            ).map((type: { value: string; label: string }) => {
              const count = facets?.bodyType?.[type.value];
              return (
                <div
                  key={type.value}
                  className="flex items-center justify-between"
                >
                  <CustomFormField
                    control={control}
                    fieldType={FormFieldType.CHECKBOX}
                    name={`bodyType-${type.value}`}
                    label={type.label}
                  />
                  <span className="text-sm text-muted-foreground">
                    {formatCount(count ?? 0)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
