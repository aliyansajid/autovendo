import { useFormContext, useWatch } from "react-hook-form";
import { useTranslations } from "next-intl";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/components/custom-form-field";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";
import { Label } from "@repo/ui/components/label";
import { EquipmentEnum } from "@/constants";
import { carExtrasEnum } from "@/constants/cars";
import { utilityExtrasEnum } from "@/constants/commercial-vehicles";
import { truckExtrasEnum } from "@/constants/truck";
import { camperExtrasEnum } from "@/constants/camper";

export function EquipmentSection() {
  const t = useTranslations("VehicleFormSections");
  const t_vehicle = useTranslations("Vehicle");
  const { control } = useFormContext();
  const vehicleType = useWatch({ control, name: "vehicleType" });

  const vehicleExtrasMap: Record<string, readonly any[]> = {
    car: carExtrasEnum,
    utility: utilityExtrasEnum,
    truck: truckExtrasEnum,
    camper: camperExtrasEnum,
  };

  const activeExtrasEnum = (vehicleExtrasMap[vehicleType] ||
    carExtrasEnum) as any[];

  return (
    <Accordion
      type="multiple"
      defaultValue={["equipment"]}
      className="space-y-6"
    >
      <AccordionItem value="equipment">
        <AccordionTrigger className="flex items-center text-xl text-primary font-bold cursor-pointer hover:no-underline">
          {t("equipmentTitle")}
        </AccordionTrigger>
        <AccordionContent className="space-y-6 px-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-3 pt-6">
            {EquipmentEnum.map((item) => (
              <CustomFormField
                key={item.value}
                control={control}
                fieldType={FormFieldType.CHECKBOX}
                name={`equipment.${item.value}`}
                label={t_vehicle(`equipment.${item.value.toUpperCase().replace(/-/g, "_")}`)}
              />
            ))}
          </div>

          <div className="space-y-4 pt-4">
            <Label className="text-lg text-primary font-semibold">
              {t("additionalExtras")}
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-3">
              {activeExtrasEnum.map((extra) => (
                <CustomFormField
                  key={extra.value}
                  control={control}
                  fieldType={FormFieldType.CHECKBOX}
                  name={`extras.${extra.value}`}
                  label={t_vehicle(`extras.${extra.value.toUpperCase().replace(/-/g, "_")}`)}
                />
              ))}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
