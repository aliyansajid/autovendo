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
import { VehicleConditionEnum } from "@repo/vehicle-constants";
import { carBodyTypeEnum } from "@repo/vehicle-constants";
import { utilityBodyTypeEnum } from "@repo/vehicle-constants";
import { truckBodyTypeEnum } from "@repo/vehicle-constants";
import { camperBodyTypeEnum } from "@repo/vehicle-constants";
import type { VehicleFacets } from "@/types/vehicle";
import { formatCount } from "@repo/ui/lib/helpers/format";
import { useTranslations, useLocale } from "next-intl";

const CURRENT_YEAR = new Date().getFullYear();

export function BasicDataSection({
  vehicleType,
  facets,
}: {
  vehicleType: string;
  facets?: VehicleFacets | null;
}) {
  const t = useTranslations("AdvancedSearch.sections.basic");
  const tVehicle = useTranslations("Vehicle");
  const locale = useLocale();
  const { control, watch, setValue, getValues } = useFormContext();

  const yearMin = 1900;
  const yearMax = 2026;
  const kmMax = 400000;
  const priceMax = 1000000;

  const yearValue = useWatch({ control, name: "year" });
  const kilometerValue = useWatch({ control, name: "kilometer" });
  const priceValue = useWatch({ control, name: "price" });

  const yearRange = yearValue ?? [yearMin, yearMax];
  const kilometerRange = kilometerValue ?? [0, kmMax];
  const priceRange = priceValue ?? [0, priceMax];

  // Fallbacks for histograms if data is not yet loaded
  const yearHistogramData = facets?.yearHistogram ?? [];
  const kilometerHistogramData = facets?.kilometerHistogram ?? [];
  const priceHistogramData = facets?.priceHistogram ?? [];

  const PLACEHOLDER_HEIGHTS = [
    22, 35, 28, 45, 55, 40, 62, 75, 58, 80, 70, 85, 65, 50, 42, 60, 38, 30, 20,
    15,
  ];

  const normalizeHistogram = (data: { h: number }[]) => {
    const nonZero = data.filter((d) => d.h > 0);
    if (data.length <= 1 || nonZero.length <= 1) {
      return PLACEHOLDER_HEIGHTS.map((h) => ({ h, _placeholder: true }));
    }
    const max = Math.max(...data.map((d) => d.h));
    const min = Math.min(...data.map((d) => d.h));
    if (max === min) return data.map((d) => ({ ...d, h: 60 }));
    return data.map((d) => ({
      ...d,
      h: Math.max(8, Math.round(((d.h - min) / (max - min)) * 88) + 8),
    }));
  };

  const yearFrom = useWatch({ control, name: "year-from" });
  const yearTo = useWatch({ control, name: "year-to" });
  const kilometerFrom = useWatch({ control, name: "kilometer-from" });
  const kilometerTo = useWatch({ control, name: "kilometer-to" });
  const priceFrom = useWatch({ control, name: "price-from" });
  const priceTo = useWatch({ control, name: "price-to" });

  useEffect(() => {
    if (yearValue === undefined) {
      if (getValues("year-from") !== "" || getValues("year-to") !== "") {
        setValue("year-from", "");
        setValue("year-to", "");
      }
      return;
    }
    const [from, to] = yearValue as [number, number];
    const nextFrom = from <= yearMin ? "" : from.toString();
    const nextTo = to >= yearMax ? "" : to.toString();
    if (getValues("year-from") !== nextFrom) setValue("year-from", nextFrom);
    if (getValues("year-to") !== nextTo) setValue("year-to", nextTo);
  }, [yearValue, yearMin, yearMax, setValue, getValues]);

  useEffect(() => {
    if (kilometerValue === undefined) {
      if (
        getValues("kilometer-from") !== "" ||
        getValues("kilometer-to") !== ""
      ) {
        setValue("kilometer-from", "");
        setValue("kilometer-to", "");
      }
      return;
    }
    const [from, to] = kilometerValue as [number, number];
    const nextFrom = from === 0 ? "" : from.toString();
    const nextTo = to >= kmMax ? "" : to.toString();
    if (getValues("kilometer-from") !== nextFrom)
      setValue("kilometer-from", nextFrom);
    if (getValues("kilometer-to") !== nextTo) setValue("kilometer-to", nextTo);
  }, [kilometerValue, kmMax, setValue, getValues]);

  useEffect(() => {
    if (priceValue === undefined) {
      if (getValues("price-from") !== "" || getValues("price-to") !== "") {
        setValue("price-from", "");
        setValue("price-to", "");
      }
      return;
    }
    const [from, to] = priceValue as [number, number];
    const nextFrom = from === 0 ? "" : from.toString();
    const nextTo = to >= priceMax ? "" : to.toString();
    if (getValues("price-from") !== nextFrom) setValue("price-from", nextFrom);
    if (getValues("price-to") !== nextTo) setValue("price-to", nextTo);
  }, [priceValue, priceMax, setValue, getValues]);

  useEffect(() => {
    const parseNumber = (val: unknown, fallback: number) => {
      if (val === undefined || val === null || val === "") return fallback;
      const cleaned = String(val).replace(/[^0-9.-]/g, "");
      const num = Number(cleaned);
      return Number.isFinite(num) ? num : fallback;
    };
    const from = parseNumber(yearFrom, yearMin);
    const to = parseNumber(yearTo, yearMax);
    const [curFrom, curTo] = getValues("year") ?? [yearMin, yearMax];
    if (from === curFrom && to === curTo) return;
    setValue("year", [from, to], { shouldDirty: true });
  }, [yearFrom, yearTo, getValues, setValue, yearMin, yearMax]);

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
        {t("title")}
      </AccordionTrigger>
      <AccordionContent className="pt-6 px-1 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="flex flex-col">
              <Label className="text-base font-semibold">{t("year")}</Label>
              <span
                className="text-xs text-muted-foreground cursor-pointer hover:underline"
                onClick={() => {
                  setValue("year", undefined as any);
                  setValue("year-from", "");
                  setValue("year-to", "");
                }}
              >
                {t("reset")}
              </span>
            </div>

            <div className="h-16 flex items-end justify-between gap-[3px]">
              {normalizeHistogram(yearHistogramData).map(
                (
                  item: { year?: number; h: number; _placeholder?: boolean },
                  i: number,
                ) => {
                  const yStart = yearRange?.[0] ?? yearMin;
                  const yEnd = yearRange?.[1] ?? yearMax;
                  const isActive =
                    !item._placeholder &&
                    item.year != null &&
                    item.year >= yStart &&
                    item.year <= yEnd;
                  return (
                    <div
                      key={i}
                      className={`flex-1 min-w-0 rounded-t transition-all duration-300 ${
                        item._placeholder
                          ? "bg-primary/10"
                          : isActive
                            ? "bg-primary/70"
                            : "bg-primary/15"
                      }`}
                      style={{ height: `${item.h}%` }}
                    />
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
              <div className="flex gap-2 text-sm">
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
              <Label className="text-base font-semibold">
                {t("kilometer")}
              </Label>
              <span
                className="text-xs text-muted-foreground cursor-pointer hover:underline"
                onClick={() => {
                  setValue("kilometer", undefined as any);
                  setValue("kilometer-from", "");
                  setValue("kilometer-to", "");
                }}
              >
                {t("reset")}
              </span>
            </div>
            <div className="h-16 flex items-end justify-between gap-[3px]">
              {normalizeHistogram(kilometerHistogramData).map(
                (
                  item: { value?: number; h: number; _placeholder?: boolean },
                  i: number,
                ) => {
                  const mStart = kilometerRange?.[0] ?? 0;
                  const mEnd = kilometerRange?.[1] ?? kmMax;
                  const isActive =
                    !item._placeholder &&
                    item.value != null &&
                    item.value >= mStart &&
                    item.value <= mEnd;
                  return (
                    <div
                      key={i}
                      className={`flex-1 min-w-0 rounded-t transition-all duration-300 ${
                        item._placeholder
                          ? "bg-primary/10"
                          : isActive
                            ? "bg-primary/70"
                            : "bg-primary/15"
                      }`}
                      style={{ height: `${item.h}%` }}
                    />
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
              <div className="flex gap-2 text-sm">
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
                  placeholder={`${new Intl.NumberFormat(locale === "de" ? "de-CH" : locale).format(kmMax)}${kilometerRange?.[1] && kilometerRange[1] >= kmMax ? "+" : ""}`}
                  inputGroupText="km"
                />
              </div>
            </CustomFormField>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col">
              <Label className="text-base font-semibold">{t("price")}</Label>
              <span
                className="text-xs text-muted-foreground cursor-pointer hover:underline"
                onClick={() => {
                  setValue("price", undefined as any);
                  setValue("price-from", "");
                  setValue("price-to", "");
                }}
              >
                {t("reset")}
              </span>
            </div>

            <div className="h-16 flex items-end justify-between gap-[3px]">
              {normalizeHistogram(priceHistogramData).map(
                (
                  item: { value?: number; h: number; _placeholder?: boolean },
                  i: number,
                ) => {
                  const pStart = priceRange?.[0] ?? 0;
                  const pEnd = priceRange?.[1] ?? priceMax;
                  const isActive =
                    !item._placeholder &&
                    item.value != null &&
                    item.value >= pStart &&
                    item.value <= pEnd;
                  return (
                    <div
                      key={i}
                      className={`flex-1 min-w-0 rounded-t transition-all duration-300 ${
                        item._placeholder
                          ? "bg-primary/10"
                          : isActive
                            ? "bg-primary/70"
                            : "bg-primary/15"
                      }`}
                      style={{ height: `${item.h}%` }}
                    />
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
                  placeholder={`${new Intl.NumberFormat(locale === "de" ? "de-CH" : locale).format(priceMax)}${priceRange?.[1] && priceRange[1] >= priceMax ? "+" : ""}`}
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
              <Label className="text-base font-semibold">
                {t("condition")}
              </Label>
              <span
                className="text-xs text-muted-foreground cursor-pointer hover:underline"
                onClick={() =>
                  VehicleConditionEnum.forEach((item) =>
                    setValue(`condition-${item.value}`, false),
                  )
                }
              >
                {t("reset")}
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
                        label={tVehicle(
                          `conditions.${item.value.toUpperCase().replace(/-/g, "_")}`,
                        )}
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
              <Label className="text-base font-semibold">
                {t("inspectionAndWarranty")}
              </Label>
              <span
                className="text-xs text-muted-foreground cursor-pointer hover:underline"
                onClick={() => {
                  setValue("condition-mfk", false);
                  setValue("condition-warranty", false);
                }}
              >
                {t("reset")}
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.CHECKBOX}
                  name="condition-mfk"
                  label={t("inspectionPassed")}
                />
                <span className="text-sm text-muted-foreground">
                  {formatCount(facets?.inspectionPassed ?? 0)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.CHECKBOX}
                  name="condition-warranty"
                  label={t("hasWarranty")}
                />
                <span className="text-sm text-muted-foreground">
                  {formatCount(facets?.hasWarranty ?? 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex flex-col">
            <Label className="text-base font-semibold">{t("bodyType")}</Label>
            <span
              className="text-xs text-muted-foreground cursor-pointer hover:underline"
              onClick={() => {
                const bodyEnum =
                  vehicleType === "utility"
                    ? utilityBodyTypeEnum
                    : vehicleType === "truck"
                      ? truckBodyTypeEnum
                      : vehicleType === "camper"
                        ? camperBodyTypeEnum
                        : carBodyTypeEnum;
                bodyEnum.forEach((t: { value: string }) =>
                  setValue(`bodyType-${t.value}`, false),
                );
              }}
            >
              {t("reset")}
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
                    label={tVehicle(
                      `types.${type.value.toUpperCase().replace(/-/g, "_")}`,
                    )}
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
