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
import { carExtrasEnum } from "@repo/vehicle-constants";
import { utilityExtrasEnum } from "@repo/vehicle-constants";
import { truckExtrasEnum } from "@repo/vehicle-constants";
import { camperExtrasEnum } from "@repo/vehicle-constants";
import { useTranslations } from "next-intl";

export function ExtrasSection({ vehicleType }: { vehicleType: string }) {
  const tTitle = useTranslations("AdvancedSearch.sections.extras");
  const tExtras = useTranslations("Vehicle.extras");
  const { control } = useFormContext();

  return (
    <AccordionItem value="extras" className="border-none">
      <AccordionTrigger className="flex items-center text-xl font-bold text-primary hover:no-underline">
        {tTitle("title")}
      </AccordionTrigger>
      <AccordionContent className="pt-6 px-1">
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
              label={tExtras(extra.value.toUpperCase().replace(/-/g, "_"))}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
