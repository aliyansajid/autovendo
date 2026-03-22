"use client";

import { useFormContext } from "react-hook-form";
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
import type { VehicleFacets } from "@/types";
import { formatCount } from "@/lib/helpers/format";

export function TechnicalDataSection({
  vehicleType,
  facets,
}: {
  vehicleType: string;
  facets?: VehicleFacets | null;
}) {
  const { control, watch, setValue } = useFormContext();
  const powerType = watch("powerType") ?? "ps";
  const powerValue = watch("power"); // undefined = slider not yet moved

  // Compute dynamic slider limits from DB facets, rounded to nearest step
  const maxPs = facets?.hpMax ? Math.ceil(facets.hpMax / 10) * 10 : 1500;
  const maxKw = facets?.kwMax ? Math.ceil(facets.kwMax / 5) * 5 : 1000;
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
      setValue("power-from", "");
      setValue("power-to", "");
      return;
    }
    const [from, to] = powerValue as [number, number];
    setValue("power-from", from === 0 ? "" : from.toString());
    setValue("power-to", to >= currentMax ? "" : to.toString());
  }, [powerValue, setValue, currentMax]);

  const cubicCapacityMax = facets?.cubicCapacityMax ? Math.ceil(facets.cubicCapacityMax / 100) * 100 : 8000;
  const cylindersMax = facets?.cylindersMax ?? 16;
  const capacityValue = watch("capacity");
  const cylinderValue = watch("cylinder");

  useEffect(() => {
    if (capacityValue === undefined) {
      setValue("capacity-from", "");
      setValue("capacity-to", "");
      return;
    }
    const [from, to] = capacityValue as [number, number];
    setValue("capacity-from", from <= 1 ? "" : from.toString());
    setValue("capacity-to", to >= cubicCapacityMax ? "" : to.toString());
  }, [capacityValue, cubicCapacityMax, setValue]);

  useEffect(() => {
    if (cylinderValue === undefined) {
      setValue("cylinder-from", "");
      setValue("cylinder-to", "");
      return;
    }
    const [from, to] = cylinderValue as [number, number];
    setValue("cylinder-from", from <= 1 ? "" : from.toString());
    setValue("cylinder-to", to >= cylindersMax ? "" : to.toString());
  }, [cylinderValue, cylindersMax, setValue]);

  const currentFuelEnum = vehicleType === "utility"
    ? utilityFuelTypeEnum
    : vehicleType === "truck"
      ? truckFuelTypeEnum
      : vehicleType === "camper"
        ? camperFuelTypeEnum
        : carFuelTypeEnum;

  return (
    <AccordionItem value="tech" className="border-none">
      <AccordionTrigger className="flex items-center text-xl font-bold text-primary hover:no-underline">
        Technischen Daten
      </AccordionTrigger>
      <AccordionContent className="pt-6 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="flex flex-col">
              <Label className="text-base font-semibold">Treibstoff</Label>
              <span
                className="text-xs text-muted-foreground cursor-pointer hover:underline"
                onClick={() => currentFuelEnum.forEach((t) => setValue(`fuel-${t.value}`, false))}
              >
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
              ).map((type: { value: string; label: string }) => {
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

          <div className="space-y-4">
            <div className="flex flex-col">
              <Label className="text-base font-semibold">Getriebe</Label>
              <span
                className="text-xs text-muted-foreground cursor-pointer hover:underline"
                onClick={() => TransmissionTypeEnum.forEach((t) => setValue(`transmission-${t.value}`, false))}
              >
                Zurücksetzen
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

          <div className="space-y-4">
            <div className="flex flex-col">
              <Label className="text-base font-semibold">Antrieb</Label>
              <span
                className="text-xs text-muted-foreground cursor-pointer hover:underline"
                onClick={() => DriveTypeEnum.forEach((t) => setValue(`drive-${t.value}`, false))}
              >
                Zurücksetzen
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <Label className="text-base font-semibold">Leistung</Label>
                <span
                  className="text-xs text-muted-foreground cursor-pointer hover:underline"
                  onClick={() => { setValue("power", undefined as any); setValue("power-from", ""); setValue("power-to", ""); }}
                >
                  Zurücksetzen
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
                  placeholder={`${currentMax}+`}
                />
              </div>
            </CustomFormField>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col">
              <Label className="text-base font-semibold">Hubraum</Label>
              <span
                className="text-xs text-muted-foreground cursor-pointer hover:underline"
                onClick={() => { setValue("capacity", undefined as any); setValue("capacity-from", ""); setValue("capacity-to", ""); }}
              >
                Zurücksetzen
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
                  placeholder={`${cubicCapacityMax.toLocaleString("de-CH")}+`}
                />
              </div>
            </CustomFormField>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col">
              <Label className="text-base font-semibold">Zylinder</Label>
              <span
                className="text-xs text-muted-foreground cursor-pointer hover:underline"
                onClick={() => { setValue("cylinder", undefined as any); setValue("cylinder-from", ""); setValue("cylinder-to", ""); }}
              >
                Zurücksetzen
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
                  placeholder={`${cylindersMax}+`}
                />
              </div>
            </CustomFormField>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
