"use client";

import { useFormContext } from "react-hook-form";
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
import { TransmissionTypeEnum, DriveTypeEnum } from "@/constants";
import { carFuelTypeEnum } from "@/constants/cars";
import { utilityFuelTypeEnum } from "@/constants/commercial-vehicles";
import { truckFuelTypeEnum } from "@/constants/truck";
import { camperFuelTypeEnum } from "@/constants/camper";
import type { VehicleFacets } from "@/lib/schemas/vehicle.schema";
import { formatCount } from "@/lib/helpers/format";

export function TechnicalDataSection({
  vehicleType,
  facets,
}: {
  vehicleType: string;
  facets?: VehicleFacets | null;
}) {
  const { control, watch, setValue } = useFormContext();
  const powerRange = watch("power") ?? [0, 1500];

  useEffect(() => {
    setValue("power-from", powerRange[0]?.toString() ?? "0");
    setValue("power-to", powerRange[1]?.toString() ?? "1500");
  }, [powerRange, setValue]);

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
              <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
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
                    control={control}
                    fieldType={FormFieldType.CHECKBOX}
                    name={`drive-${type.value}`}
                    label={type.label}
                  />
                  <span className="text-sm text-muted-foreground">0</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <Label className="text-base font-semibold">Leistung</Label>
                <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
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
              max={1500}
              step={10}
            >
              <div className="flex gap-2">
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT_GROUP}
                  name="power-from"
                  inputGroupText="PS"
                  placeholder="0"
                />
                <CustomFormField
                  control={control}
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
              control={control}
              fieldType={FormFieldType.SLIDER}
              name="capacity"
              min={1}
              max={8000}
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
              control={control}
              fieldType={FormFieldType.SLIDER}
              name="cylinder"
              min={1}
              max={16}
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
                  placeholder="16"
                />
              </div>
            </CustomFormField>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
