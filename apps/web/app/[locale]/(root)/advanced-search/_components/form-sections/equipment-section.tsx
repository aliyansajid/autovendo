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
import { EquipmentEnum } from "@repo/vehicle-constants";
import { useTranslations } from "next-intl";

export function EquipmentSection() {
  const tTitle = useTranslations("AdvancedSearch.sections");
  const tEquip = useTranslations("Vehicle.equipment");
  const { control } = useFormContext();

  return (
    <AccordionItem value="equipment" className="border-none">
      <AccordionTrigger className="flex items-center text-xl font-bold text-primary hover:no-underline">
        {tTitle("equipment.title")}
      </AccordionTrigger>
      <AccordionContent className="pt-6 px-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-3">
          {EquipmentEnum.map((equipment) => (
            <CustomFormField
              key={equipment.value}
              control={control}
              fieldType={FormFieldType.CHECKBOX}
              name={`equipment-${equipment.value}`}
              label={tEquip(equipment.value)}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
