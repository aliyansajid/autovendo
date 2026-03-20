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
import { daysListedOptions } from "@/constants";

export function MoreFiltersSection() {
  const { control, setValue } = useFormContext();

  return (
    <AccordionItem value="more" className="border-none">
      <AccordionTrigger className="flex items-center text-xl font-bold text-primary hover:no-underline">
        Weitere Filter
      </AccordionTrigger>
      <AccordionContent className="pt-6">
        <div className="space-y-4">
          <div className="flex flex-col">
            <Label className="text-base font-semibold">Inseratedauer</Label>
            <span
              className="text-xs text-muted-foreground cursor-pointer hover:underline"
              onClick={() => setValue("daysListed", "any")}
            >
              Zurücksetzen
            </span>
          </div>
          <CustomFormField
            control={control}
            fieldType={FormFieldType.RADIO_GROUP}
            name="daysListed"
            className="flex-col"
            options={daysListedOptions.map((o) => ({ label: o.label, value: o.value }))}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
