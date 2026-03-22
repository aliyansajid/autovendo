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
import { EnergyLabelEnum, EmissionStandardEnum } from "@/constants";
import type { VehicleFacets } from "@/types";
import { formatCount } from "@/lib/helpers/format";

export function EnergySection({ facets }: { facets?: VehicleFacets | null }) {
  const { control, watch, setValue, getValues } = useFormContext();

  const consumptionFrom = useWatch({ control, name: "consumption-from" });
  const consumptionTo = useWatch({ control, name: "consumption-to" });
  const emissionsFrom = useWatch({ control, name: "emissions-from" });
  const emissionsTo = useWatch({ control, name: "emissions-to" });

  const consumptionMax = facets?.consumptionMax
    ? Math.ceil(facets.consumptionMax * 10) / 10 + 0.1
    : 30;
  const co2Max = facets?.co2Max ? Math.ceil(facets.co2Max / 10) * 10 : 560;

  const consumptionValue = watch("consumption");
  const emissionsValue = watch("emissions");

  useEffect(() => {
    if (consumptionValue === undefined) {
      setValue("consumption-from", "");
      setValue("consumption-to", "");
      return;
    }
    const [from, to] = consumptionValue as [number, number];
    setValue("consumption-from", from === 0 ? "" : from.toString());
    setValue("consumption-to", to >= consumptionMax ? "" : to.toString());
  }, [consumptionValue, consumptionMax, setValue]);

  useEffect(() => {
    if (emissionsValue === undefined) {
      setValue("emissions-from", "");
      setValue("emissions-to", "");
      return;
    }
    const [from, to] = emissionsValue as [number, number];
    setValue("emissions-from", from === 0 ? "" : from.toString());
    setValue("emissions-to", to >= co2Max ? "" : to.toString());
  }, [emissionsValue, co2Max, setValue]);

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
        Energie & Umwelt
      </AccordionTrigger>
      <AccordionContent className="pt-6 px-1 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="flex flex-col">
              <Label className="text-base font-semibold">Verbrauch</Label>
              <span
                className="text-xs text-muted-foreground cursor-pointer hover:underline"
                onClick={() => {
                  setValue("consumption", undefined as any);
                  setValue("consumption-from", "");
                  setValue("consumption-to", "");
                }}
              >
                Zurücksetzen
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
              <div className="flex gap-2">
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT_GROUP}
                  name="consumption-from"
                  placeholder="0"
                  inputGroupText="1/100km"
                />
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT_GROUP}
                  name="consumption-to"
                  placeholder={`${consumptionMax}+`}
                  inputGroupText="1/100km"
                />
              </div>
            </CustomFormField>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col">
              <Label className="text-base font-semibold">CO2-Emissionen</Label>
              <span
                className="text-xs text-muted-foreground cursor-pointer hover:underline"
                onClick={() => {
                  setValue("emissions", undefined as any);
                  setValue("emissions-from", "");
                  setValue("emissions-to", "");
                }}
              >
                Zurücksetzen
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
              <div className="flex gap-2">
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
                  placeholder={`${co2Max}+`}
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
              <span
                className="text-xs text-muted-foreground cursor-pointer hover:underline"
                onClick={() =>
                  EnergyLabelEnum.forEach((item) =>
                    setValue(`energy-${item.value}`, false),
                  )
                }
              >
                Zurücksetzen
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
            <Label className="text-base font-semibold">Euronorm</Label>
            <span
              className="text-xs text-muted-foreground cursor-pointer hover:underline"
              onClick={() =>
                EmissionStandardEnum.forEach((item) =>
                  setValue(`eu-${item.value}`, false),
                )
              }
            >
              Zurücksetzen
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
