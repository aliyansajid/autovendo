import { useFormContext, useWatch } from "react-hook-form";
import { useTranslations } from "next-intl";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/components/custom-form-field";
import { SelectItem } from "@repo/ui/components/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";
import { Label } from "@repo/ui/components/label";
import {
  EnergyLabelEnum,
  BatteryOwnershipEnum,
  ChargingPlugTypeStandardEnum,
  ChargingPlugTypeFastEnum,
} from "@/constants";
import { Separator } from "@repo/ui/components/separator";

export function TechnicalDataSection() {
  const t = useTranslations("VehicleFormSections");
  const t_vehicle = useTranslations("Vehicle");
  const { control } = useFormContext();
  const fuelType = useWatch({ control, name: "fuelType" });
  const batteryOwnership = useWatch({ control, name: "batteryOwnership" });

  const showCombustionOrMild = [
    "petrol",
    "diesel",
    "lpg-petrol",
    "mhev-diesel",
    "mhev-petrol",
    "cng-petrol",
    "ethanol-petrol",
  ].includes(fuelType || "");
  const showElectric = fuelType === "electric";
  const showFullHybrid = ["hev-diesel", "hev-petrol"].includes(fuelType || "");
  const showHydrogen = fuelType === "hydrogen";
  const showPluginHybrid = ["phev-diesel", "phev-petrol"].includes(
    fuelType || "",
  );

  return (
    <Accordion
      type="multiple"
      defaultValue={["tech-specs", "description"]}
      className="space-y-6"
    >
      <AccordionItem value="tech-specs" className="border-none">
        <AccordionTrigger className="flex items-center text-xl text-primary font-bold cursor-pointer hover:no-underline">
          {t("technicalData")}
        </AccordionTrigger>
        <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 px-1">
          <div className="grid grid-cols-2 gap-3">
            <CustomFormField
              control={control}
              fieldType={FormFieldType.INPUT}
              inputType="number"
              name="doors"
              label={t("doors")}
              placeholder="0"
            />
            <CustomFormField
              control={control}
              fieldType={FormFieldType.INPUT}
              inputType="number"
              name="seats"
              label={t("seats")}
              placeholder="0"
            />
          </div>

          {(showCombustionOrMild || showFullHybrid || showPluginHybrid) && (
            <div className="space-y-2">
              <Label>{t("consumption")}</Label>
              <div className="grid grid-cols-3 gap-3">
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT}
                  name="consumptionCity"
                  placeholder={t("consumptionCity")}
                />
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT}
                  name="consumptionCountry"
                  placeholder={t("consumptionCountry")}
                />
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT}
                  name="consumptionTotal"
                  placeholder={t("consumptionTotal")}
                />
              </div>
            </div>
          )}

          {(showCombustionOrMild || showHydrogen) && (
              <CustomFormField
                control={control}
                fieldType={FormFieldType.INPUT_GROUP}
                inputType="number"
                name="cubicCapacity"
                label={t("displacement")}
                inputGroupText={t("units.ccm")}
                placeholder="0"
              />
          )}

          {(showCombustionOrMild ||
            showFullHybrid ||
            showHydrogen ||
            showPluginHybrid) && (
              <CustomFormField
                control={control}
                fieldType={FormFieldType.INPUT_GROUP}
                inputType="number"
                name="co2Emission"
                label={t("co2")}
                inputGroupText={t("units.gkm")}
                placeholder="0"
              />
          )}

          <div className="grid grid-cols-2 gap-3">
            <CustomFormField
              control={control}
              fieldType={FormFieldType.INPUT}
              inputType="number"
              name="hp"
              label={t("ps")}
              placeholder="0"
            />
              <CustomFormField
                control={control}
                fieldType={FormFieldType.INPUT}
                inputType="number"
                name="kw"
                label={t("units.kw")}
                placeholder="0"
              />
          </div>

          <CustomFormField
            control={control}
            fieldType={FormFieldType.SELECT}
            name="energyLabel"
            label={t("energyEfficiency")}
            placeholder={t("selectTypePlaceholder")}
          >
            {EnergyLabelEnum.map((e) => (
              <SelectItem key={e.value} value={e.value}>
                {e.label}
              </SelectItem>
            ))}
          </CustomFormField>

          <CustomFormField
            control={control}
            fieldType={FormFieldType.INPUT}
            name="typeApproval"
            label={t("typeApproval")}
            placeholder={t("typeApprovalPlaceholder")}
          />

          <CustomFormField
            control={control}
            fieldType={FormFieldType.INPUT}
            name="vehicleIdentificationNumber"
            label={t("vin")}
            placeholder={t("vinPlaceholder")}
          />

          <div className="grid grid-cols-2 gap-3">
              <CustomFormField
                control={control}
                fieldType={FormFieldType.INPUT_GROUP}
                inputType="number"
                name="emptyWeight"
                label={t("emptyWeight")}
                inputGroupText={t("units.kg")}
                placeholder="0"
              />
              <CustomFormField
                control={control}
                fieldType={FormFieldType.INPUT_GROUP}
                inputType="number"
                name="loadCapacity"
                label={t("payload")}
                inputGroupText={t("units.kg")}
                placeholder="0"
              />
          </div>

          <div className="grid grid-cols-2 gap-3">
              <CustomFormField
                control={control}
                fieldType={FormFieldType.INPUT_GROUP}
                inputType="number"
                name="towingCapacityBraked"
                label={t("towingCapacity")}
                inputGroupText={t("units.kg")}
                placeholder="0"
              />
              <CustomFormField
                control={control}
                fieldType={FormFieldType.INPUT_GROUP}
                inputType="number"
                name="wheelbase"
                label={t("wheelbase")}
                inputGroupText={t("units.mm")}
                placeholder="0"
              />
          </div>

          {(showElectric || showFullHybrid || showPluginHybrid) && (
            <>
              <CustomFormField
                control={control}
                fieldType={FormFieldType.INPUT_GROUP}
                inputType="number"
                name="range"
                label={t("range")}
                inputGroupText={t("units.km")}
                placeholder="0"
              />
              <CustomFormField
                control={control}
                fieldType={FormFieldType.INPUT_GROUP}
                inputType="number"
                name="batteryCapacity"
                label={t("batteryCapacity")}
                inputGroupText={t("units.kwh")}
                placeholder="0"
              />

              {(showElectric || showPluginHybrid) && (
                <>
                  <div className="col-span-2">
                    <CustomFormField
                      control={control}
                      fieldType={FormFieldType.SELECT}
                      name="batteryOwnership"
                      label={t("batteryOwnership")}
                      placeholder={t("batteryOwnershipPlaceholder")}
                    >
                      {BatteryOwnershipEnum.map((e) => (
                        <SelectItem key={e.value} value={e.value}>
                          {t_vehicle(`batteryOwnership.${e.value.toUpperCase().replace(/-/g, "_")}`)}
                        </SelectItem>
                      ))}
                    </CustomFormField>
                  </div>

                  {batteryOwnership === "battery-rent-required" && (
                      <CustomFormField
                        control={control}
                        fieldType={FormFieldType.INPUT_GROUP}
                        inputType="number"
                        name="batteryRentalMonth"
                        label={t("batteryRental")}
                        inputGroupText={t("units.chf_month")}
                        placeholder="0"
                      />
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <CustomFormField
                      control={control}
                      fieldType={FormFieldType.SELECT}
                      name="chargingPlugTypeStandard"
                      label={t("chargingStandardAC")}
                      placeholder={t("selectTypePlaceholder")}
                    >
                      {ChargingPlugTypeStandardEnum.map((e) => (
                        <SelectItem key={e.value} value={e.value}>
                          {t_vehicle(`chargingStandardAC.${e.value.toUpperCase().replace(/-/g, "_")}`)}
                        </SelectItem>
                      ))}
                    </CustomFormField>

                    <CustomFormField
                      control={control}
                      fieldType={FormFieldType.SELECT}
                      name="chargingPlugTypeFast"
                      label={t("chargingStandardDC")}
                      placeholder={t("selectTypePlaceholder")}
                    >
                      {ChargingPlugTypeFastEnum.map((e) => (
                        <SelectItem key={e.value} value={e.value}>
                          {t_vehicle(`chargingStandardDC.${e.value.toUpperCase().replace(/-/g, "_")}`)}
                        </SelectItem>
                      ))}
                    </CustomFormField>
                  </div>

                  <CustomFormField
                    control={control}
                    fieldType={FormFieldType.INPUT_GROUP}
                    inputType="number"
                    name="chargingPower"
                    label={t("chargingPower")}
                    inputGroupText={t("units.kw")}
                    placeholder="0"
                  />
                </>
              )}
            </>
          )}

          {(showFullHybrid || showPluginHybrid) && (
            <>
              <CustomFormField
                control={control}
                fieldType={FormFieldType.INPUT}
                inputType="number"
                name="combustionEnginePowerHp"
                label={t("combustionEnginePower")}
                placeholder="0"
              />
              <CustomFormField
                control={control}
                fieldType={FormFieldType.INPUT}
                inputType="number"
                name="electricMotorPowerHp"
                label={t("electricMotorPower")}
                placeholder="0"
              />
            </>
          )}
        </AccordionContent>
      </AccordionItem>

      <Separator />

      <AccordionItem value="description">
        <AccordionTrigger className="flex items-center text-xl text-primary font-bold cursor-pointer hover:no-underline">
          {t("furtherInfo")}
        </AccordionTrigger>
        <AccordionContent className="pt-6 px-1">
          <CustomFormField
            fieldType={FormFieldType.TEXTAREA}
            control={control}
            name="vehicleDescription"
            label={t("description")}
            placeholder={t("descriptionPlaceholder")}
            className="h-40"
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
