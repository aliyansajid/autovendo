import { useFormContext, useWatch } from "react-hook-form";
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
import { Separator } from "@repo/ui/src/components/separator";

export function TechnicalDataSection() {
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
          Technische Daten
        </AccordionTrigger>
        <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 px-1">
          <div className="grid grid-cols-2 gap-3">
            <CustomFormField
              control={control}
              fieldType={FormFieldType.INPUT}
              inputType="number"
              name="doors"
              label="Türen"
              placeholder="0"
            />
            <CustomFormField
              control={control}
              fieldType={FormFieldType.INPUT}
              inputType="number"
              name="seats"
              label="Sitzplätze"
              placeholder="0"
            />
          </div>

          {(showCombustionOrMild || showFullHybrid || showPluginHybrid) && (
            <div className="space-y-2">
              <Label>Verbrauch (l/100 km)</Label>
              <div className="grid grid-cols-3 gap-3">
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT}
                  name="consumptionCity"
                  placeholder="Stadt"
                />
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT}
                  name="consumptionCountry"
                  placeholder="Land"
                />
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT}
                  name="consumptionTotal"
                  placeholder="Total"
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
              label="Hubraum"
              inputGroupText="cm³"
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
              label="CO2-Emissionen"
              inputGroupText="g/km"
              placeholder="0"
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            <CustomFormField
              control={control}
              fieldType={FormFieldType.INPUT}
              inputType="number"
              name="hp"
              label="PS"
              placeholder="0"
            />
            <CustomFormField
              control={control}
              fieldType={FormFieldType.INPUT}
              inputType="number"
              name="kw"
              label="kW"
              placeholder="0"
            />
          </div>

          <CustomFormField
            control={control}
            fieldType={FormFieldType.SELECT}
            name="energyLabel"
            label="Energieeffizienz"
            placeholder="Label wählen"
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
            label="Typengenehmigung"
            placeholder="z.B. 1MA123"
          />

          <CustomFormField
            control={control}
            fieldType={FormFieldType.INPUT}
            name="vehicleIdentificationNumber"
            label="Fahrgestell-Nr. (VIN)"
            placeholder="VIN eingeben"
          />

          <div className="grid grid-cols-2 gap-3">
            <CustomFormField
              control={control}
              fieldType={FormFieldType.INPUT_GROUP}
              inputType="number"
              name="emptyWeight"
              label="Leergewicht"
              inputGroupText="kg"
              placeholder="0"
            />
            <CustomFormField
              control={control}
              fieldType={FormFieldType.INPUT_GROUP}
              inputType="number"
              name="loadCapacity"
              label="Nutzlast"
              inputGroupText="kg"
              placeholder="0"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <CustomFormField
              control={control}
              fieldType={FormFieldType.INPUT_GROUP}
              inputType="number"
              name="towingCapacityBraked"
              label="Anhängelast"
              inputGroupText="kg"
              placeholder="0"
            />
            <CustomFormField
              control={control}
              fieldType={FormFieldType.INPUT_GROUP}
              inputType="number"
              name="wheelbase"
              label="Radstand"
              inputGroupText="mm"
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
                label="Reichweite"
                inputGroupText="km"
                placeholder="0"
              />
              <CustomFormField
                control={control}
                fieldType={FormFieldType.INPUT_GROUP}
                inputType="number"
                name="batteryCapacity"
                label="Batteriekapazität"
                inputGroupText="kWh"
                placeholder="0"
              />

              {(showElectric || showPluginHybrid) && (
                <>
                  <div className="col-span-2">
                    <CustomFormField
                      control={control}
                      fieldType={FormFieldType.SELECT}
                      name="batteryOwnership"
                      label="Batterie-Besitzmodell"
                      placeholder="Modell wählen"
                    >
                      {BatteryOwnershipEnum.map((e) => (
                        <SelectItem key={e.value} value={e.value}>
                          {e.label}
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
                      label="Batteriemiete"
                      inputGroupText="CHF/Mt."
                      placeholder="0"
                    />
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <CustomFormField
                      control={control}
                      fieldType={FormFieldType.SELECT}
                      name="chargingPlugTypeStandard"
                      label="Stecker-Typ AC"
                      placeholder="Typ wählen"
                    >
                      {ChargingPlugTypeStandardEnum.map((e) => (
                        <SelectItem key={e.value} value={e.value}>
                          {e.label}
                        </SelectItem>
                      ))}
                    </CustomFormField>

                    <CustomFormField
                      control={control}
                      fieldType={FormFieldType.SELECT}
                      name="chargingPlugTypeFast"
                      label="Stecker-Typ DC"
                      placeholder="Typ wählen"
                    >
                      {ChargingPlugTypeFastEnum.map((e) => (
                        <SelectItem key={e.value} value={e.value}>
                          {e.label}
                        </SelectItem>
                      ))}
                    </CustomFormField>
                  </div>

                  <CustomFormField
                    control={control}
                    fieldType={FormFieldType.INPUT_GROUP}
                    inputType="number"
                    name="chargingPower"
                    label="Ladeleistung"
                    inputGroupText="kW"
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
                label="Verbrennungsmotor PS"
                placeholder="0"
              />
              <CustomFormField
                control={control}
                fieldType={FormFieldType.INPUT}
                inputType="number"
                name="electricMotorPowerHp"
                label="Elektromotor PS"
                placeholder="0"
              />
            </>
          )}
        </AccordionContent>
      </AccordionItem>

      <Separator />

      <AccordionItem value="description">
        <AccordionTrigger className="flex items-center text-xl text-primary font-bold cursor-pointer hover:no-underline">
          Weitere Informationen
        </AccordionTrigger>
        <AccordionContent className="pt-6 px-1">
          <CustomFormField
            fieldType={FormFieldType.TEXTAREA}
            control={control}
            name="vehicleDescription"
            label="Beschreibung"
            placeholder="Geben Sie hier Details zu Ihrem Fahrzeug ein..."
            className="h-40"
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
