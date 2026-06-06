"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { useEffect, useRef } from "react";
import { Slider } from "@repo/ui/components/slider";
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
import { TransmissionTypeEnum, DriveTypeEnum } from "@repo/vehicle-constants";
import { carFuelTypeEnum } from "@repo/vehicle-constants";
import { utilityFuelTypeEnum } from "@repo/vehicle-constants";
import { truckFuelTypeEnum } from "@repo/vehicle-constants";
import { camperFuelTypeEnum } from "@repo/vehicle-constants";
import type { VehicleFacets } from "@/types/vehicle";
import { formatCount } from "@repo/ui/lib/helpers/format";
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
  const { control, watch, setValue } = useFormContext();
  const powerType = watch("powerType") ?? "ps";

  const powerFrom = useWatch({ control, name: "power-from" });
  const powerTo = useWatch({ control, name: "power-to" });
  const capacityFrom = useWatch({ control, name: "capacity-from" });
  const capacityTo = useWatch({ control, name: "capacity-to" });
  const cylinderFrom = useWatch({ control, name: "cylinder-from" });
  const cylinderTo = useWatch({ control, name: "cylinder-to" });

  const maxPs = facets?.hpMax ?? 4000;
  const maxKw = facets?.kwMax ?? 3000;
  const currentMax = powerType === "kw" ? maxKw : maxPs;
  const currentStep = powerType === "kw" ? 5 : 10;
  const currentUnit = powerType === "kw" ? "kW" : "PS";

  const cubicCapacityMax = facets?.cubicCapacityMax ?? 30000;
  const cylindersMax = facets?.cylindersMax ?? 16;

  // Reset power inputs when switching between PS and kW
  const prevPowerTypeRef = useRef(powerType);
  useEffect(() => {
    if (prevPowerTypeRef.current !== powerType) {
      prevPowerTypeRef.current = powerType;
      setValue("power-from", "");
      setValue("power-to", "");
    }
  }, [powerType, setValue]);

  const parseNum = (val: unknown, fallback: number) => {
    if (val === undefined || val === null || val === "") return fallback;
    const cleaned = String(val).replace(/[^0-9.-]/g, "");
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : fallback;
  };

  const powerRange: [number, number] = [
    parseNum(powerFrom, 0),
    parseNum(powerTo, currentMax),
  ];
  const capacityRange: [number, number] = [
    parseNum(capacityFrom, 1),
    parseNum(capacityTo, cubicCapacityMax),
  ];
  const cylinderRange: [number, number] = [
    parseNum(cylinderFrom, 1),
    parseNum(cylinderTo, cylindersMax),
  ];

  const currentFuelEnum =
    vehicleType === "UTILITY"
      ? utilityFuelTypeEnum
      : vehicleType === "TRUCK"
        ? truckFuelTypeEnum
        : vehicleType === "CAMPER"
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
                      label={tVehicle(
                        `fuelTypes.${type.value}`,
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

          <div className="space-y-4">
            <div className="flex flex-col">
              <Label className="text-base font-semibold">
                {t("transmission")}
              </Label>
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
                      label={tVehicle(
                        `transmissionTypes.${type.value}`,
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
                      label={tVehicle(
                        `driveTypes.${type.value}`,
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="flex flex-col">
              <Label className="text-base font-semibold">{t("doors")}</Label>
              <span
                className="text-xs text-muted-foreground cursor-pointer hover:underline"
                onClick={() => {
                  setValue("doors-from", "");
                  setValue("doors-to", "");
                }}
              >
                {tBasic("reset")}
              </span>
            </div>
            <div className="flex gap-2">
              <CustomFormField
                control={control}
                fieldType={FormFieldType.INPUT_GROUP}
                name="doors-from"
                placeholder="2"
              />
              <CustomFormField
                control={control}
                fieldType={FormFieldType.INPUT_GROUP}
                name="doors-to"
                placeholder="5"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col">
              <Label className="text-base font-semibold">{t("seats")}</Label>
              <span
                className="text-xs text-muted-foreground cursor-pointer hover:underline"
                onClick={() => {
                  setValue("seats-from", "");
                  setValue("seats-to", "");
                }}
              >
                {tBasic("reset")}
              </span>
            </div>
            <div className="flex gap-2">
              <CustomFormField
                control={control}
                fieldType={FormFieldType.INPUT_GROUP}
                name="seats-from"
                placeholder="2"
              />
              <CustomFormField
                control={control}
                fieldType={FormFieldType.INPUT_GROUP}
                name="seats-to"
                placeholder="9"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <Label className="text-base font-semibold">{t("power")}</Label>
                <span
                  className="text-xs text-muted-foreground cursor-pointer hover:underline"
                  onClick={() => {
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

            <Slider
              min={0}
              max={currentMax}
              step={currentStep}
              value={powerRange}
              onValueChange={([from = 0, to = 0]) => {
                setValue("power-from", from === 0 ? "" : String(from));
                setValue("power-to", to >= currentMax ? "" : String(to));
              }}
              className="py-2"
            />
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
                placeholder={`${new Intl.NumberFormat(locale === "de" ? "de-CH" : locale).format(currentMax)}+`}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col">
              <Label className="text-base font-semibold">{t("capacity")}</Label>
              <span
                className="text-xs text-muted-foreground cursor-pointer hover:underline"
                onClick={() => {
                  setValue("capacity-from", "");
                  setValue("capacity-to", "");
                }}
              >
                {tBasic("reset")}
              </span>
            </div>
            <Slider
              min={1}
              max={cubicCapacityMax}
              step={100}
              value={capacityRange}
              onValueChange={([from = 0, to = 0]) => {
                setValue("capacity-from", from <= 1 ? "" : String(from));
                setValue("capacity-to", to >= cubicCapacityMax ? "" : String(to));
              }}
              className="py-2"
            />
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
                placeholder={`${new Intl.NumberFormat(locale === "de" ? "de-CH" : locale).format(cubicCapacityMax)}+`}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col">
              <Label className="text-base font-semibold">{t("cylinder")}</Label>
              <span
                className="text-xs text-muted-foreground cursor-pointer hover:underline"
                onClick={() => {
                  setValue("cylinder-from", "");
                  setValue("cylinder-to", "");
                }}
              >
                {tBasic("reset")}
              </span>
            </div>
            <Slider
              min={1}
              max={cylindersMax}
              step={1}
              value={cylinderRange}
              onValueChange={([from = 0, to = 0]) => {
                setValue("cylinder-from", from <= 1 ? "" : String(from));
                setValue("cylinder-to", to >= cylindersMax ? "" : String(to));
              }}
              className="py-2"
            />
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
                placeholder={`${cylindersMax}+`}
              />
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
