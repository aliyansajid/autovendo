import { useFormContext, useWatch } from "react-hook-form";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/components/custom-form-field";
import { SelectItem } from "@repo/ui/components/select";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@repo/ui/src/components/accordion";
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
    <div className="space-y-6">
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger className="flex items-center text-xl text-primary font-bold cursor-pointer hover:no-underline">
            Technical Data
          </AccordionTrigger>
          <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 px-1">
            <div className="grid grid-cols-2 gap-3">
              <CustomFormField
                control={control}
                fieldType={FormFieldType.INPUT}
                inputType="number"
                name="doors"
                label="Doors"
                placeholder="0"
              />
              <CustomFormField
                control={control}
                fieldType={FormFieldType.INPUT}
                inputType="number"
                name="seats"
                label="Seats"
                placeholder="0"
              />
            </div>

            {(showCombustionOrMild || showFullHybrid || showPluginHybrid) && (
              <div className="space-y-2">
                <Label>Consumption (l/100 km)</Label>
                <div className="grid grid-cols-3 gap-3">
                  <CustomFormField
                    control={control}
                    fieldType={FormFieldType.INPUT}
                    inputType="text"
                    name="consumptionCity"
                    placeholder="City"
                  />
                  <CustomFormField
                    control={control}
                    fieldType={FormFieldType.INPUT}
                    inputType="text"
                    name="consumptionCountry"
                    placeholder="Country"
                  />
                  <CustomFormField
                    control={control}
                    fieldType={FormFieldType.INPUT}
                    inputType="text"
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
                label="Cubic capacity"
                inputGroupText="cm³"
                inputGroupTextPosition="right"
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
                label="CO2 emission"
                inputGroupText="g/km"
                inputGroupTextPosition="right"
                placeholder="0"
              />
            )}

            {(showCombustionOrMild || showHydrogen) && (
              <>
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT}
                  inputType="number"
                  name="cylinders"
                  label="Cylinders"
                  placeholder="0"
                />
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT}
                  inputType="number"
                  name="numberOfGears"
                  label="Number of gears"
                  placeholder="0"
                />
              </>
            )}

            <CustomFormField
              control={control}
              fieldType={FormFieldType.SELECT}
              name="energyLabel"
              label="Energy Label"
              placeholder="Select an option"
              className="w-full"
            >
              {EnergyLabelEnum.map((e) => (
                <SelectItem key={e.value} value={e.value}>
                  {e.label}
                </SelectItem>
              ))}
            </CustomFormField>

            <div className="grid grid-cols-2 gap-3">
              <CustomFormField
                control={control}
                fieldType={FormFieldType.INPUT}
                inputType="number"
                name="hp"
                label="HP"
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
              fieldType={FormFieldType.INPUT}
              name="typeApproval"
              label="Type Approval"
              placeholder="Enter type approval"
              className="w-full"
            />
            <CustomFormField
              control={control}
              fieldType={FormFieldType.INPUT_GROUP}
              inputType="number"
              name="wheelbase"
              label="Wheelbase"
              inputGroupText="mm"
              placeholder="0"
              className="w-full"
            />
            <CustomFormField
              control={control}
              fieldType={FormFieldType.INPUT}
              name="vehicleIdentificationNumber"
              label="Vehicle identification number"
              placeholder="Enter vehicle identification number"
              className="w-full"
            />

            <div className="grid grid-cols-2 gap-3">
              <CustomFormField
                control={control}
                fieldType={FormFieldType.INPUT_GROUP}
                inputType="number"
                name="emptyWeight"
                label="Empty Weight"
                inputGroupText="kg"
                placeholder="0"
              />
              <CustomFormField
                control={control}
                fieldType={FormFieldType.INPUT_GROUP}
                inputType="number"
                name="loadCapacity"
                label="Load Capacity"
                inputGroupText="kg"
                placeholder="0"
              />
            </div>
            <CustomFormField
              control={control}
              fieldType={FormFieldType.INPUT}
              name="serialNumber"
              label="Serial Number"
              placeholder="Enter serial number"
              className="w-full"
            />

            <div className="grid grid-cols-2 gap-3">
              <CustomFormField
                control={control}
                fieldType={FormFieldType.INPUT_GROUP}
                inputType="number"
                name="height"
                label="Height"
                inputGroupText="mm"
                placeholder="0"
              />
              <CustomFormField
                control={control}
                fieldType={FormFieldType.INPUT_GROUP}
                inputType="number"
                name="width"
                label="Width"
                inputGroupText="mm"
                placeholder="0"
              />
            </div>
            <CustomFormField
              control={control}
              fieldType={FormFieldType.INPUT_GROUP}
              inputType="number"
              name="length"
              label="Length"
              inputGroupText="mm"
              placeholder="0"
            />
            <CustomFormField
              control={control}
              fieldType={FormFieldType.INPUT_GROUP}
              inputType="number"
              name="towingCapacityBraked"
              label="Towing capacity"
              inputGroupText="kg"
              placeholder="0"
            />

            {(showElectric || showFullHybrid || showPluginHybrid) && (
              <>
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT_GROUP}
                  inputType="number"
                  name="range"
                  label="Range"
                  inputGroupText="km"
                  placeholder="0"
                />
                {(showElectric || showPluginHybrid) && (
                  <CustomFormField
                    control={control}
                    fieldType={FormFieldType.SELECT}
                    name="batteryOwnership"
                    label="Battery ownership model"
                    placeholder="Select an option"
                    className="w-full"
                  >
                    {BatteryOwnershipEnum.map((e) => (
                      <SelectItem key={e.value} value={e.value}>
                        {e.label}
                      </SelectItem>
                    ))}
                  </CustomFormField>
                )}
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT_GROUP}
                  inputType="number"
                  name="batteryCapacity"
                  label="Battery capacity"
                  inputGroupText="kWh"
                  placeholder="0"
                />

                {(showElectric || showPluginHybrid) && (
                  <>
                    {batteryOwnership === "battery-rent-required" && (
                      <CustomFormField
                        control={control}
                        fieldType={FormFieldType.INPUT_GROUP}
                        inputType="number"
                        name="batteryRentalMonth"
                        label="Battery rental"
                        inputGroupText="CHF/month"
                        placeholder="0"
                      />
                    )}
                    <CustomFormField
                      control={control}
                      fieldType={FormFieldType.INPUT_GROUP}
                      inputType="number"
                      name="powerConsumption"
                      label="Power consumption"
                      inputGroupText="kWh/100km"
                      placeholder="0"
                    />
                    <CustomFormField
                      control={control}
                      fieldType={FormFieldType.INPUT_GROUP}
                      inputType="number"
                      name="batterySoh"
                      label="Battery state of health"
                      inputGroupText="0-100%"
                      placeholder="0"
                    />

                    <CustomFormField
                      control={control}
                      fieldType={FormFieldType.SELECT}
                      name="chargingPlugTypeStandard"
                      label="Charging plug type - standard (AC)"
                      placeholder="Select an option"
                      className="w-full"
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
                      label="Charging plug type - fast charge (DC)"
                      placeholder="Select an option"
                      className="w-full"
                    >
                      {ChargingPlugTypeFastEnum.map((e) => (
                        <SelectItem key={e.value} value={e.value}>
                          {e.label}
                        </SelectItem>
                      ))}
                    </CustomFormField>

                    <CustomFormField
                      control={control}
                      fieldType={FormFieldType.INPUT_GROUP}
                      inputType="number"
                      name="chargingPower"
                      label="Charging power"
                      inputGroupText="kW"
                      placeholder="0"
                    />
                    <CustomFormField
                      control={control}
                      fieldType={FormFieldType.INPUT_GROUP}
                      inputType="number"
                      name="chargingTime80"
                      label="Charging time in minutes"
                      inputGroupText="0-80%"
                      placeholder="0"
                    />
                    <CustomFormField
                      control={control}
                      fieldType={FormFieldType.INPUT_GROUP}
                      inputType="number"
                      name="fastChargingTime80"
                      label="Fast charging time in minutes"
                      inputGroupText="0-80%"
                      placeholder="0"
                    />
                    <CustomFormField
                      control={control}
                      fieldType={FormFieldType.INPUT_GROUP}
                      inputType="number"
                      name="chargingTime100"
                      label="Charging time in minutes"
                      inputGroupText="0-100%"
                      placeholder="0"
                    />
                    <CustomFormField
                      control={control}
                      fieldType={FormFieldType.INPUT_GROUP}
                      inputType="number"
                      name="fastChargingTime100"
                      label="Fast charging time in minutes"
                      inputGroupText="0-100%"
                      placeholder="0"
                    />
                  </>
                )}

                {showFullHybrid && (
                  <CustomFormField
                    control={control}
                    fieldType={FormFieldType.INPUT_GROUP}
                    inputType="number"
                    name="powerConsumption"
                    label="Power consumption"
                    inputGroupText="kWh/100km"
                    placeholder="0"
                  />
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
                  label="Combustion Engine Power (HP)"
                  placeholder="0"
                />
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.INPUT}
                  inputType="number"
                  name="electricMotorPowerHp"
                  label="Electric Motor Power (HP)"
                  placeholder="0"
                />
              </>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Separator />

      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger className="flex items-center text-xl text-primary font-bold cursor-pointer hover:no-underline">
            Detailed Information
          </AccordionTrigger>
          <AccordionContent className="pt-6 px-1">
            <CustomFormField
              fieldType={FormFieldType.TEXTAREA}
              control={control}
              name="vehicleDescription"
              label="Description"
              placeholder="Enter detailed description..."
              className="h-32"
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
