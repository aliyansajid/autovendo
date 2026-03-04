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
import { daysListedOptions, qualityLabels } from "@/constants";

export function MoreFiltersSection() {
  const { control } = useFormContext();

  return (
    <AccordionItem value="more" className="border-none">
      <AccordionTrigger className="flex items-center text-xl font-bold text-primary hover:no-underline">
        Weitere Filter
      </AccordionTrigger>
      <AccordionContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="flex flex-col">
              <Label className="text-base font-semibold">Inseratedauer</Label>
              <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                Zurücksetzen
              </span>
            </div>
            <CustomFormField
              control={control}
              fieldType={FormFieldType.RADIO_GROUP}
              name="daysListed"
              className="flex-col"
              options={
                daysListedOptions as unknown as {
                  label: string;
                  value: string;
                }[]
              }
            />
          </div>

          <div className="space-y-4 lg:col-span-2">
            <div className="flex flex-col">
              <Label className="text-base font-semibold">Qualitätslabel</Label>
              <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                Zurücksetzen
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
              {qualityLabels.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between"
                >
                  <CustomFormField
                    control={control}
                    fieldType={FormFieldType.CHECKBOX}
                    name={`seal-${item.label.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                    label={item.label}
                  />
                  <span className="text-sm text-muted-foreground">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
