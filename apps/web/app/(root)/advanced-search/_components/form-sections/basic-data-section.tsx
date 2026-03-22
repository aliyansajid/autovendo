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
import type { VehicleFacets } from "@/types";
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

  const yearMin = facets?.yearMin ?? 1900;
  const yearMax = facets?.yearMax ?? CURRENT_YEAR;
  const kmMax = facets?.kilometerMax ? Math.ceil(facets.kilometerMax / 1000) * 1000 : 400000;
  const priceMax = facets?.priceMax ? Math.ceil(facets.priceMax / 10000) * 10000 : 1000000;

  const yearValue = watch("year");
  const kilometerValue = watch("kilometer");
  const priceValue = watch("price");

  const yearRange = yearValue ?? [yearMin, yearMax];
  const kilometerRange = kilometerValue ?? [0, kmMax];
  const priceRange = priceValue ?? [0, priceMax];

  const kilometerFrom = useWatch({ control, name: "kilometer-from" });
  const kilometerTo = useWatch({ control, name: "kilometer-to" });
  const priceFrom = useWatch({ control, name: "price-from" });
  const priceTo = useWatch({ control, name: "price-to" });

  useEffect(() => {
    if (yearValue === undefined) {
      setValue("year-from", "");
      setValue("year-to", "");
      return;
    }
    const [from, to] = yearValue as [number, number];
    setValue("year-from", from <= yearMin ? "" : from.toString());
    setValue("year-to", to >= yearMax ? "" : to.toString());
  }, [yearValue, yearMin, yearMax, setValue]);

  useEffect(() => {
    if (kilometerValue === undefined) {
      setValue("kilometer-from", "");
      setValue("kilometer-to", "");
      return;
    }
    const [from, to] = kilometerValue as [number, number];
    setValue("kilometer-from", from === 0 ? "" : from.toString());
    setValue("kilometer-to", to >= kmMax ? "" : to.toString());
  }, [kilometerValue, kmMax, setValue]);

  useEffect(() => {
    if (priceValue === undefined) {
      setValue("price-from", "");
      setValue("price-to", "");
      return;
    }
    const [from, to] = priceValue as [number, number];
    setValue("price-from", from === 0 ? "" : from.toString());
    setValue("price-to", to >= priceMax ? "" : to.toString());
  }, [priceValue, priceMax, setValue]);

  useEffect(() => {
    const parseNumber = (val: unknown, fallback: number) => {
      if (val === undefined || val === null || val === "") return fallback;
      const cleaned = String(val).replace(/[^0-9.-]/g, "");
      const num = Number(cleaned);
      return Number.isFinite(num) ? num : fallback;
    };
    const from = parseNumber(kilometerFrom, 0);
    const to = parseNumber(kilometerTo, kmMax);
    const [curFrom, curTo] = getValues("kilometer") ?? [0, kmMax];
    if (from === curFrom && to === curTo) return;
    setValue("kilometer", [from, to], { shouldDirty: true });
  }, [kilometerFrom, kilometerTo, getValues, setValue, kmMax]);

  useEffect(() => {
    const parseNumber = (val: unknown, fallback: number) => {
      if (val === undefined || val === null || val === "") return fallback;
      const cleaned = String(val).replace(/[^0-9.-]/g, "");
      const num = Number(cleaned);
      return Number.isFinite(num) ? num : fallback;
    };
    const from = parseNumber(priceFrom, 0);
    const to = parseNumber(priceTo, priceMax);
    const [curFrom, curTo] = getValues("price") ?? [0, priceMax];
    if (from === curFrom && to === curTo) return;
    setValue("price", [from, to], { shouldDirty: true });
  }, [priceFrom, priceTo, getValues, setValue, priceMax]);

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
              <span
                className="text-xs text-muted-foreground cursor-pointer hover:underline"
                onClick={() => { setValue("year", undefined as any); setValue("year-from", ""); setValue("year-to", ""); }}
              >
                Zurücksetzen
              </span>
            </div>

            <div className="h-16 flex items-end justify-between gap-1">
              {yearHistogram.map(
                (item: { year: number; h: number }, i: number) => {
                  const yStart = yearRange?.[0] ?? yearMin;
                  const yEnd = yearRange?.[1] ?? yearMax;
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
              min={yearMin}
              max={yearMax}
              step={1}
            >
              <div className="flex gap-2">
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT_GROUP}
                  name="year-from"
                  placeholder={yearMin.toString()}
                />
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT_GROUP}
                  name="year-to"
                  placeholder={yearMax.toString()}
                />
              </div>
            </CustomFormField>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col">
              <Label className="text-base font-semibold">Kilometerstand</Label>
              <span
                className="text-xs text-muted-foreground cursor-pointer hover:underline"
                onClick={() => { setValue("kilometer", undefined as any); setValue("kilometer-from", ""); setValue("kilometer-to", ""); }}
              >
                Zurücksetzen
              </span>
            </div>
            <div className="h-16 flex items-end justify-between gap-1">
              {kilometerHistogram.map(
                (item: { value: number; h: number }, i: number) => {
                  const mStart = kilometerRange?.[0] ?? 0;
                  const mEnd = kilometerRange?.[1] ?? kmMax;
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
              max={kmMax}
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
                  placeholder={`${kmMax.toLocaleString("de-CH")}+`}
                  inputGroupText="km"
                />
              </div>
            </CustomFormField>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col">
              <Label className="text-base font-semibold">Preis</Label>
              <span
                className="text-xs text-muted-foreground cursor-pointer hover:underline"
                onClick={() => { setValue("price", undefined as any); setValue("price-from", ""); setValue("price-to", ""); }}
              >
                Zurücksetzen
              </span>
            </div>

            <div className="h-16 flex items-end justify-between gap-1">
              {priceHistogram.map(
                (item: { value: number; h: number }, i: number) => {
                  const pStart = priceRange?.[0] ?? 0;
                  const pEnd = priceRange?.[1] ?? priceMax;
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
              max={priceMax}
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
                  placeholder={`${priceMax.toLocaleString("de-CH")}+`}
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
              <span
                className="text-xs text-muted-foreground cursor-pointer hover:underline"
                onClick={() => VehicleConditionEnum.forEach((item) => setValue(`condition-${item.value}`, false))}
              >
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
              <span
                className="text-xs text-muted-foreground cursor-pointer hover:underline"
                onClick={() => { setValue("condition-mfk", false); setValue("condition-warranty", false); }}
              >
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
                <span className="text-sm text-muted-foreground">{formatCount(facets?.inspectionPassed ?? 0)}</span>
              </div>

              <div className="flex items-center justify-between">
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.CHECKBOX}
                  name="condition-warranty"
                  label="Mit Garantie"
                />
                <span className="text-sm text-muted-foreground">{formatCount(facets?.hasWarranty ?? 0)}</span>
              </div>
            </div>
          </div>

        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex flex-col">
            <Label className="text-base font-semibold">Aufbauart</Label>
            <span
              className="text-xs text-muted-foreground cursor-pointer hover:underline"
              onClick={() => {
                const bodyEnum = vehicleType === "utility" ? utilityBodyTypeEnum : vehicleType === "truck" ? truckBodyTypeEnum : vehicleType === "camper" ? camperBodyTypeEnum : carBodyTypeEnum;
                bodyEnum.forEach((t: { value: string }) => setValue(`bodyType-${t.value}`, false));
              }}
            >
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
