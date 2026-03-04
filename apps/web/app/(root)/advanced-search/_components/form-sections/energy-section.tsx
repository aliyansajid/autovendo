"use client";

import { useFormContext } from "react-hook-form";
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

export function EnergySection() {
  const { control } = useFormContext();

  return (
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
              control={control}
              fieldType={FormFieldType.SLIDER}
              name="consumption"
              min={0}
              max={30}
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
                  placeholder="30+"
                  inputGroupText="1/100km"
                />
              </div>
            </CustomFormField>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col">
              <Label className="text-base font-semibold">CO2-Emissionen</Label>
              <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                Zurücksetzen
              </span>
            </div>
            <CustomFormField
              control={control}
              fieldType={FormFieldType.SLIDER}
              name="emissions"
              min={0}
              max={560}
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
                    control={control}
                    fieldType={FormFieldType.CHECKBOX}
                    name={`energy-${item.value}`}
                    label={item.label}
                  />
                  <span className="text-sm text-muted-foreground">
                    {Math.floor(Math.random() * 50000).toLocaleString("de-CH")}
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
                  control={control}
                  fieldType={FormFieldType.CHECKBOX}
                  name={`eu-${item.value}`}
                  label={item.label}
                />
                <span className="text-sm text-muted-foreground">
                  {Math.floor(Math.random() * 50000).toLocaleString("de-CH")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
