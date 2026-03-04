import { useFormContext, useWatch } from "react-hook-form";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/components/custom-form-field";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@repo/ui/src/components/accordion";
import { Label } from "@repo/ui/src/components/label";
import { EquipmentEnum } from "@/constants";
import { carExtrasEnum } from "@/constants/cars";
import { utilityExtrasEnum } from "@/constants/commercial-vehicles";
import { truckExtrasEnum } from "@/constants/truck";
import { camperExtrasEnum } from "@/constants/camper";

export function EquipmentSection() {
  const { control } = useFormContext();
  const vehicleType = useWatch({ control, name: "vehicleType" });

  const isCommercial = vehicleType === "utility";
  const isTruck = vehicleType === "truck";
  const isCamper = vehicleType === "camper";

  const activeEquipmentEnum = EquipmentEnum;
  const activeExtrasEnum = isTruck
    ? truckExtrasEnum
    : isCamper
      ? camperExtrasEnum
      : isCommercial
        ? utilityExtrasEnum
        : carExtrasEnum;

  return (
    <Accordion type="single" collapsible defaultValue="item-1">
      <AccordionItem value="item-1">
        <AccordionTrigger className="flex items-center text-xl text-primary font-bold cursor-pointer hover:no-underline">
          Equipment
        </AccordionTrigger>
        <AccordionContent className="space-y-6 px-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-3 pt-6">
            {activeEquipmentEnum.map(
              (equipment: { value: string; label: string }) => (
                <CustomFormField
                  key={equipment.value}
                  control={control}
                  fieldType={FormFieldType.CHECKBOX}
                  name={`equipment.${equipment.value}`}
                  label={equipment.label}
                />
              ),
            )}
          </div>
          <div className="space-y-4 pt-4">
            <Label className="text-lg text-primary font-semibold">Extras</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-3">
              {activeExtrasEnum.map(
                (extra: { value: string; label: string }) => (
                  <CustomFormField
                    key={extra.value}
                    control={control}
                    fieldType={FormFieldType.CHECKBOX}
                    name={`extras.${extra.value}`}
                    label={extra.label}
                  />
                ),
              )}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
