"use client";

import { useFormContext } from "react-hook-form";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/src/components/accordion";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/src/components/custom-form-field";
import { carExtrasEnum } from "@/constants/cars";
import { utilityExtrasEnum } from "@/constants/commercial-vehicles";
import { truckExtrasEnum } from "@/constants/truck";
import { camperExtrasEnum } from "@/constants/camper";

export function ExtrasSection({ vehicleType }: { vehicleType: string }) {
  const { control } = useFormContext();

  return (
    <AccordionItem value="extras" className="border-none">
      <AccordionTrigger className="flex items-center text-xl font-bold text-primary hover:no-underline">
        Extras
      </AccordionTrigger>
      <AccordionContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-3">
          {(vehicleType === "utility"
            ? utilityExtrasEnum
            : vehicleType === "truck"
              ? truckExtrasEnum
              : vehicleType === "camper"
                ? camperExtrasEnum
                : carExtrasEnum
          ).map((extra: { value: string; label: string }) => (
            <CustomFormField
              key={extra.value}
              control={control}
              fieldType={FormFieldType.CHECKBOX}
              name={`extra-${extra.value}`}
              label={extra.label}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
