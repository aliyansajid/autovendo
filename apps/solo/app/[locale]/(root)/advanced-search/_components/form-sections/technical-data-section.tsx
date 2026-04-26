"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { useEffect, useRef } from "react";
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
import { TransmissionTypeEnum, DriveTypeEnum } from "@/constants";
import { carFuelTypeEnum } from "@/constants/cars";
import { utilityFuelTypeEnum } from "@/constants/commercial-vehicles";
import { truckFuelTypeEnum } from "@/constants/truck";
import { camperFuelTypeEnum } from "@/constants/camper";
import type { VehicleFacets } from "@/types/vehicle";
import { formatCount } from "@/lib/helpers/format";
import { useTranslations, useLocale } from "next-intl";

export function TechnicalDataSection({
  vehicleType,
  facets,
}: {
  vehicleType: string;
  facets?: VehicleFacets | null;
}) {
  const t = useTranslations("AdvancedSearch.sections.tech");
  const tBasic = useTranslations("AdvancedSearch.sections.basic");
  const tVehicle = useTranslations("Vehicle");
  const locale = useLocale();
  const { control, watch, setValue, getValues } = useFormContext();
  const powerType = watch("powerType") ?? "ps";
  const powerValue = watch("power"); // undefined = slider not yet moved

  const powerFrom = useWatch({ control, name: "power-from" });
  const powerTo = useWatch({ control, name: "power-to" });
  const capacityFrom = useWatch({ control, name: "capacity-from" });
  const capacityTo = useWatch({ control, name: "capacity-to" });
  const cylinderFrom = useWatch({ control, name: "cylinder-from" });
  const cylinderTo = useWatch({ control, name: "cylinder-to" });

  // Compute dynamic slider limits from DB facets, rounded to nearest step
  const maxPs = 1500;
  const maxKw = 1000;
  const currentMax = powerType === "kw" ? maxKw : maxPs;
  const currentStep = powerType === "kw" ? 5 : 10;
  const currentUnit = powerType === "kw" ? "kW" : "PS";

  // Reset slider and filter inputs when the user switches between PS and kW
  const prevPowerTypeRef = useRef(powerType);
  useEffect(() => {
    if (prevPowerTypeRef.current !== powerType) {
      prevPowerTypeRef.current = powerType;
      setValue("power", undefined as any);
      setValue("power-from", "");
      setValue("power-to", "");
    }
  }, [powerType, setValue]);

  // Sync slider position → input fields; treat min/max positions as "no filter"
  useEffect(() => {
    if (powerValue === undefined) {
      if (getValues("power-from") !== "" || getValues("power-to") !== "") {
        setValue("power-from", "");
        setValue("power-to", "");
      }
      return;
    }
    const [from, to] = powerValue as [number, number];
    const nextFrom = from === 0 ? "" : from.toString();
    const nextTo = to >= currentMax ? "" : to.toString();
    if (getValues("power-from") !== nextFrom) setValue("power-from", nextFrom);
    if (getValues("power-to") !== nextTo) setValue("power-to", nextTo);
  }, [powerValue, currentMax, setValue, getValues]);

  const cubicCapacityMax = 8000;
  const cylindersMax = 16;
  const capacityValue = watch("capacity");
  const cylinderValue = watch("cylinder");

  useEffect(() => {
    if (capacityValue === undefined) {
      if (
        getValues("capacity-from") !== "" ||
        getValues("capacity-to") !== ""
      ) {
        setValue("capacity-from", "");
        setValue("capacity-to", "");
      }
      return;
    }
    const [from, to] = capacityValue as [number, number];
    const nextFrom = from <= 1 ? "" : from.toString();
    const nextTo = to >= cubicCapacityMax ? "" : to.toString();
    if (getValues("capacity-from") !== nextFrom)
      setValue("capacity-from", nextFrom);
    if (getValues("capacity-to") !== nextTo) setValue("capacity-to", nextTo);
  }, [capacityValue, cubicCapacityMax, setValue, getValues]);

  useEffect(() => {
    if (cylinderValue === undefined) {
      if (
        getValues("cylinder-from") !== "" ||
        getValues("cylinder-to") !== ""
      ) {
        setValue("cylinder-from", "");
        setValue("cylinder-to", "");
      }
      return;
    }
    const [from, to] = cylinderValue as [number, number];
    const nextFrom = from <= 1 ? "" : from.toString();
    const nextTo = to >= cylindersMax ? "" : to.toString();
    if (getValues("cylinder-from") !== nextFrom)
      setValue("cylinder-from", nextFrom);
    if (getValues("cylinder-to") !== nextTo) setValue("cylinder-to", nextTo);
  }, [cylinderValue, cylindersMax, setValue, getValues]);

  // Two-way sync: inputs -> sliders
  useEffect(() => {
    const parseNumber = (val: unknown, fallback: number) => {
      if (val === undefined || val === null || val === "") return fallback;
      const cleaned = String(val).replace(/[^0-9.-]/g, "");
      const num = Number(cleaned);
      return Number.isFinite(num) ? num : fallback;
    };
    const from = parseNumber(powerFrom, 0);
    const to = parseNumber(powerTo, currentMax);
    const [curFrom, curTo] = getValues("power") ?? [0, currentMax];
    if (from === curFrom && to === curTo) return;
    setValue("power", [from, to], { shouldDirty: true });
  }, [powerFrom, powerTo, getValues, setValue, currentMax]);

  useEffect(() => {
    const parseNumber = (val: unknown, fallback: number) => {
      if (val === undefined || val === null || val === "") return fallback;
      const cleaned = String(val).replace(/[^0-9.-]/g, "");
      const num = Number(cleaned);
      return Number.isFinite(num) ? num : fallback;
    };
    const from = parseNumber(capacityFrom, 1);
    const to = parseNumber(capacityTo, cubicCapacityMax);
    const [curFrom, curTo] = getValues("capacity") ?? [1, cubicCapacityMax];
    if (from === curFrom && to === curTo) return;
    setValue("capacity", [from, to], { shouldDirty: true });
  }, [capacityFrom, capacityTo, getValues, setValue, cubicCapacityMax]);

  useEffect(() => {
    const parseNumber = (val: unknown, fallback: number) => {
      if (val === undefined || val === null || val === "") return fallback;
      const cleaned = String(val).replace(/[^0-9.-]/g, "");
      const num = Number(cleaned);
      return Number.isFinite(num) ? num : fallback;
    };
    const from = parseNumber(cylinderFrom, 1);
    const to = parseNumber(cylinderTo, cylindersMax);
    const [curFrom, curTo] = getValues("cylinder") ?? [1, cylindersMax];
    if (from === curFrom && to === curTo) return;
    setValue("cylinder", [from, to], { shouldDirty: true });
  }, [cylinderFrom, cylinderTo, getValues, setValue, cylindersMax]);

  const currentFuelEnum =
    vehicleType === "utility"
      ? utilityFuelTypeEnum
      : vehicleType === "truck"
        ? truckFuelTypeEnum
        : vehicleType === "camper"
          ? camperFuelTypeEnum
          : carFuelTypeEnum;

  return (
    <AccordionItem value="tech" className="border-none">
      <AccordionTrigger className="flex items-center text-xl font-bold text-primary hover:no-underline">
        {t("title")}
      </AccordionTrigger>
      <AccordionContent className="pt-6 px-1 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="flex flex-col">
              <Label className="text-base font-semibold">{t("fuel")}</Label>
              <span
                className="text-xs text-muted-foreground cursor-pointer hover:underline"
                onClick={() =>
                  currentFuelEnum.forEach((t) =>
                    setValue(`fuel-${t.value}`, false),
                  )
                }
              >
                {tBasic("reset")}
              </span>
            </div>
            <div className="space-y-3">
              {currentFuelEnum.map((type: { value: string; label: string }) => {
                const count = facets?.fuelType?.[type.value];
                return (
                  <div
                    key={type.value}
                    className="flex items-center justify-between"
                  >
                    <CustomFormField
                      control={control}
                      fieldType={FormFieldType.CHECKBOX}
                      name={`fuel-${type.value}`}
                      label={tVehicle(`fuelTypes.${type.value.toUpperCase().replace("-", "_")}`)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formatCount(count ?? 0)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col">
              <Label className="text-base font-semibold">{t("transmission")}</Label>
              <span
                className="text-xs text-muted-foreground cursor-pointer hover:underline"
                onClick={() =>
                  TransmissionTypeEnum.forEach((t) =>
                    setValue(`transmission-${t.value}`, false),
                  )
                }
              >
                {tBasic("reset")}
              </span>
            </div>
            <div className="space-y-3">
              {TransmissionTypeEnum.map((type) => {
                const count = facets?.transmissionType?.[type.value];
                return (
                  <div
                    key={type.value}
                    className="flex items-center justify-between"
                  >
                    <CustomFormField
                      control={control}
                      fieldType={FormFieldType.CHECKBOX}
                      name={`transmission-${type.value}`}
                      label={tVehicle(`transmissionTypes.${type.value.toUpperCase().replace("-", "_")}`)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formatCount(count ?? 0)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col">
              <Label className="text-base font-semibold">{t("drive")}</Label>
              <span
                className="text-xs text-muted-foreground cursor-pointer hover:underline"
                onClick={() =>
                  DriveTypeEnum.forEach((t) =>
                    setValue(`drive-${t.value}`, false),
                  )
                }
              >
                {tBasic("reset")}
              </span>
            </div>
            <div className="space-y-3">
              {DriveTypeEnum.map((type) => {
                const count = facets?.driveType?.[type.value];
                return (
                  <div
                    key={type.value}
                    className="flex items-center justify-between"
                  >
                    <CustomFormField
                      control={control}
                      fieldType={FormFieldType.CHECKBOX}
                      name={`drive-${type.value}`}
                      label={tVehicle(`driveTypes.${type.value.toUpperCase().replace("-", "_")}`)}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <Label className="text-base font-semibold">{t("power")}</Label>
                <span
                  className="text-xs text-muted-foreground cursor-pointer hover:underline"
                  onClick={() => {
                    setValue("power", undefined as any);
                    setValue("power-from", "");
                    setValue("power-to", "");
                  }}
                >
                  {tBasic("reset")}
                </span>
              </div>
              <CustomFormField
                control={control}
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
              control={control}
              fieldType={FormFieldType.SLIDER}
              name="power"
              min={0}
              max={currentMax}
              step={currentStep}
            >
              <div className="flex gap-2">
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT_GROUP}
                  name="power-from"
                  inputGroupText={currentUnit}
                  placeholder="0"
                />
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT_GROUP}
                  name="power-to"
                  inputGroupText={currentUnit}
                  placeholder={`${new Intl.NumberFormat(locale === "de" ? "de-CH" : locale).format(currentMax)}${powerValue?.[1] && powerValue[1] >= currentMax ? "+" : ""}`}
                />
              </div>
            </CustomFormField>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col">
              <Label className="text-base font-semibold">{t("capacity")}</Label>
              <span
                className="text-xs text-muted-foreground cursor-pointer hover:underline"
                onClick={() => {
                  setValue("capacity", undefined as any);
                  setValue("capacity-from", "");
                  setValue("capacity-to", "");
                }}
              >
                {tBasic("reset")}
              </span>
            </div>
            <CustomFormField
              control={control}
              fieldType={FormFieldType.SLIDER}
              name="capacity"
              min={1}
              max={cubicCapacityMax}
              step={100}
            >
              <div className="flex gap-2">
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT_GROUP}
                  name="capacity-from"
                  inputGroupText="cm³"
                  placeholder="1"
                />
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT_GROUP}
                  name="capacity-to"
                  inputGroupText="cm³"
                  placeholder={`${new Intl.NumberFormat(locale === "de" ? "de-CH" : locale).format(cubicCapacityMax)}${capacityValue?.[1] && capacityValue[1] >= cubicCapacityMax ? "+" : ""}`}
                />
              </div>
            </CustomFormField>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col">
              <Label className="text-base font-semibold">{t("cylinder")}</Label>
              <span
                className="text-xs text-muted-foreground cursor-pointer hover:underline"
                onClick={() => {
                  setValue("cylinder", undefined as any);
                  setValue("cylinder-from", "");
                  setValue("cylinder-to", "");
                }}
              >
                {tBasic("reset")}
              </span>
            </div>
            <CustomFormField
              control={control}
              fieldType={FormFieldType.SLIDER}
              name="cylinder"
              min={1}
              max={cylindersMax}
              step={1}
            >
              <div className="flex gap-2">
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT_GROUP}
                  name="cylinder-from"
                  placeholder="1"
                />
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT_GROUP}
                  name="cylinder-to"
                  placeholder={`${cylindersMax}${cylinderValue?.[1] && cylinderValue[1] >= cylindersMax ? "+" : ""}`}
                />
              </div>
            </CustomFormField>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
