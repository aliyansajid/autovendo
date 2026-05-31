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
import { EnergyLabelEnum, EmissionStandardEnum } from "@repo/vehicle-constants";
import type { VehicleFacets } from "@/types/vehicle";
import { formatCount } from "@/lib/helpers/format";
import { useTranslations, useLocale } from "next-intl";

export function EnergySection({ facets }: { facets?: VehicleFacets | null }) {
  const t = useTranslations("AdvancedSearch.sections.energy");
  const locale = useLocale();
  const { control, watch, setValue, getValues } = useFormContext();

  const consumptionFrom = useWatch({ control, name: "consumption-from" });
  const consumptionTo = useWatch({ control, name: "consumption-to" });
  const emissionsFrom = useWatch({ control, name: "emissions-from" });
  const emissionsTo = useWatch({ control, name: "emissions-to" });

  const consumptionMax = 30;
  const co2Max = 560;

  const consumptionValue = watch("consumption");
  const emissionsValue = watch("emissions");

  useEffect(() => {
    if (consumptionValue === undefined) {
      if (
        getValues("consumption-from") !== "" ||
        getValues("consumption-to") !== ""
      ) {
        setValue("consumption-from", "");
        setValue("consumption-to", "");
      }
      return;
    }
    const [from, to] = consumptionValue as [number, number];
    const nextFrom = from === 0 ? "" : from.toString();
    const nextTo = to >= consumptionMax ? "" : to.toString();
    if (getValues("consumption-from") !== nextFrom)
      setValue("consumption-from", nextFrom);
    if (getValues("consumption-to") !== nextTo)
      setValue("consumption-to", nextTo);
  }, [consumptionValue, consumptionMax, setValue, getValues]);

  useEffect(() => {
    if (emissionsValue === undefined) {
      if (
        getValues("emissions-from") !== "" ||
        getValues("emissions-to") !== ""
      ) {
        setValue("emissions-from", "");
        setValue("emissions-to", "");
      }
      return;
    }
    const [from, to] = emissionsValue as [number, number];
    const nextFrom = from === 0 ? "" : from.toString();
    const nextTo = to >= co2Max ? "" : to.toString();
    if (getValues("emissions-from") !== nextFrom)
      setValue("emissions-from", nextFrom);
    if (getValues("emissions-to") !== nextTo) setValue("emissions-to", nextTo);
  }, [emissionsValue, co2Max, setValue, getValues]);

  // Two-way sync: inputs -> sliders
  useEffect(() => {
    const parseNumber = (val: unknown, fallback: number) => {
      if (val === undefined || val === null || val === "") return fallback;
      const cleaned = String(val).replace(/[^0-9.-]/g, "");
      const num = Number(cleaned);
      return Number.isFinite(num) ? num : fallback;
    };
    const from = parseNumber(consumptionFrom, 0);
    const to = parseNumber(consumptionTo, consumptionMax);
    const [curFrom, curTo] = getValues("consumption") ?? [0, consumptionMax];
    if (from === curFrom && to === curTo) return;
    setValue("consumption", [from, to], { shouldDirty: true });
  }, [consumptionFrom, consumptionTo, getValues, setValue, consumptionMax]);

  useEffect(() => {
    const parseNumber = (val: unknown, fallback: number) => {
      if (val === undefined || val === null || val === "") return fallback;
      const cleaned = String(val).replace(/[^0-9.-]/g, "");
      const num = Number(cleaned);
      return Number.isFinite(num) ? num : fallback;
    };
    const from = parseNumber(emissionsFrom, 0);
    const to = parseNumber(emissionsTo, co2Max);
    const [curFrom, curTo] = getValues("emissions") ?? [0, co2Max];
    if (from === curFrom && to === curTo) return;
    setValue("emissions", [from, to], { shouldDirty: true });
  }, [emissionsFrom, emissionsTo, getValues, setValue, co2Max]);

  return (
    <AccordionItem value="energy" className="border-none">
      <AccordionTrigger className="flex items-center text-xl font-bold text-primary hover:no-underline">
        {t("title")}
      </AccordionTrigger>
      <AccordionContent className="pt-6 px-1 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="flex flex-col">
              <Label className="text-base font-semibold">
                {t("consumption")}
              </Label>
              <span
                className="text-xs text-muted-foreground cursor-pointer hover:underline"
                onClick={() => {
                  setValue("consumption", undefined as any);
                  setValue("consumption-from", "");
                  setValue("consumption-to", "");
                }}
              >
                {t("reset")}
              </span>
            </div>
            <CustomFormField
              control={control}
              fieldType={FormFieldType.SLIDER}
              name="consumption"
              min={0}
              max={consumptionMax}
              step={0.1}
            >
              <div className="flex gap-2 text-sm">
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT_GROUP}
                  name="consumption-from"
                  placeholder="0"
                  inputGroupText="l/100km"
                />
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT_GROUP}
                  name="consumption-to"
                  placeholder={`${new Intl.NumberFormat(locale === "de" ? "de-CH" : locale).format(consumptionMax)}${consumptionValue?.[1] && consumptionValue[1] >= consumptionMax ? "+" : ""}`}
                  inputGroupText="l/100km"
                />
              </div>
            </CustomFormField>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col">
              <Label className="text-base font-semibold">
                {t("emissions")}
              </Label>
              <span
                className="text-xs text-muted-foreground cursor-pointer hover:underline"
                onClick={() => {
                  setValue("emissions", undefined as any);
                  setValue("emissions-from", "");
                  setValue("emissions-to", "");
                }}
              >
                {t("reset")}
              </span>
            </div>
            <CustomFormField
              control={control}
              fieldType={FormFieldType.SLIDER}
              name="emissions"
              min={0}
              max={co2Max}
              step={1}
            >
              <div className="flex gap-2 text-sm">
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT_GROUP}
                  name="emissions-from"
                  placeholder="0"
                  inputGroupText="g/km"
                />
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT_GROUP}
                  name="emissions-to"
                  placeholder={`${new Intl.NumberFormat(locale === "de" ? "de-CH" : locale).format(co2Max)}${emissionsValue?.[1] && emissionsValue[1] >= co2Max ? "+" : ""}`}
                  inputGroupText="g/km"
                />
              </div>
            </CustomFormField>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col">
              <Label className="text-base font-semibold">
                {t("efficiency")}
              </Label>
              <span
                className="text-xs text-muted-foreground cursor-pointer hover:underline"
                onClick={() =>
                  EnergyLabelEnum.forEach((item) =>
                    setValue(`energy-${item.value}`, false),
                  )
                }
              >
                {t("reset")}
              </span>
            </div>
            <div className="space-y-3">
              {EnergyLabelEnum.map((item) => {
                const count = facets?.energyLabel?.[item.value];
                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between"
                  >
                    <CustomFormField
                      control={control}
                      fieldType={FormFieldType.CHECKBOX}
                      name={`energy-${item.value}`}
                      label={item.label}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formatCount(count ?? 0)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col">
            <Label className="text-base font-semibold">{t("euroNorm")}</Label>
            <span
              className="text-xs text-muted-foreground cursor-pointer hover:underline"
              onClick={() =>
                EmissionStandardEnum.forEach((item) =>
                  setValue(`eu-${item.value}`, false),
                )
              }
            >
              {t("reset")}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-3">
            {EmissionStandardEnum.map((item) => {
              const count = facets?.emissionStandard?.[item.value];
              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between"
                >
                  <CustomFormField
                    control={control}
                    fieldType={FormFieldType.CHECKBOX}
                    name={`eu-${item.value}`}
                    label={item.label}
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
