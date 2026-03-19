import { useFormContext, useWatch } from "react-hook-form";
import {
  SelectGroup,
  SelectItem,
  SelectLabel,
} from "@repo/ui/components/select";
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
import {
  GearTransmissionEnum,
  TransmissionTypeEnum,
  DriveTypeEnum,
  ColorEnum,
  VehicleConditionEnum,
  WarrantyEnum,
  VehicleTypeEnum,
} from "@/constants";
import {
  carMakes,
  carModels,
  carBodyTypeEnum,
  carFuelTypeEnum,
} from "@/constants/cars";
import {
  utilityMakes,
  utilityModels,
  utilityBodyTypeEnum,
  utilityFuelTypeEnum,
} from "@/constants/commercial-vehicles";
import {
  truckMakes,
  truckModels,
  truckBodyTypeEnum,
  truckFuelTypeEnum,
} from "@/constants/truck";
import {
  camperMakes,
  camperBodyTypeEnum,
  camperFuelTypeEnum,
} from "@/constants/camper";
import { Separator } from "@repo/ui/src/components/separator";

export function BasicDataSection() {
  const { control } = useFormContext();

  const vehicleType = useWatch({ control, name: "vehicleType" });
  const selectedMake = useWatch({ control, name: "make" });
  const gearTransmission = useWatch({ control, name: "gearTransmission" });
  const warranty = useWatch({ control, name: "warranty" });

  const vehicleDataMap: Record<string, any> = {
    car: {
      makes: carMakes,
      models: carModels,
      bodyTypes: carBodyTypeEnum,
      fuelTypes: carFuelTypeEnum,
    },
    utility: {
      makes: utilityMakes,
      models: utilityModels,
      bodyTypes: utilityBodyTypeEnum,
      fuelTypes: utilityFuelTypeEnum,
    },
    truck: {
      makes: truckMakes,
      models: truckModels,
      bodyTypes: truckBodyTypeEnum,
      fuelTypes: truckFuelTypeEnum,
    },
    camper: {
      makes: camperMakes,
      models: {},
      bodyTypes: camperBodyTypeEnum,
      fuelTypes: camperFuelTypeEnum,
    },
  };

  const vehicleData = vehicleDataMap[vehicleType] || vehicleDataMap.car;

  const activeMakes = vehicleData.makes as ReadonlyArray<{
    label: string;
    items: ReadonlyArray<{ value: string; label: string }>;
  }>;
  const activeModels: Record<string, { value: string; label: string }[]> =
    vehicleData.models;
  const activeBodyTypeEnum = vehicleData.bodyTypes;
  const activeFuelTypeEnum = vehicleData.fuelTypes;

  const showWarrantyDetails = [
    "from-delivery",
    "from-first-registration",
    "from-date",
  ].includes(warranty || "");

  const showWarrantyStartDate = warranty === "from-date";

  const currentYear = new Date().getFullYear();

  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) =>
    (currentYear - i).toString(),
  );

  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  return (
    <Accordion
      type="multiple"
      defaultValue={["features", "condition", "price"]}
      className="space-y-6"
    >
      <AccordionItem value="features" className="border-none">
        <AccordionTrigger className="flex items-center text-xl text-primary font-bold cursor-pointer hover:no-underline">
          Fahrzeug-Merkmale
        </AccordionTrigger>
        <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 px-1">
          <div className="col-span-1 md:col-span-2">
            <CustomFormField
              control={control}
              fieldType={FormFieldType.SELECT}
              name="vehicleType"
              label="Fahrzeugtyp"
              placeholder="Fahrzeugtyp wählen"
            >
              {VehicleTypeEnum.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </CustomFormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <CustomFormField
              control={control}
              fieldType={FormFieldType.SELECT}
              name="make"
              label="Marke"
              placeholder="Marke wählen"
            >
              {(() => {
                const seen = new Set<string>();
                return activeMakes.map((group) => {
                  const uniqueItems = group.items.filter(
                    (make) => !seen.has(make.value),
                  );
                  uniqueItems.forEach((make) => seen.add(make.value));
                  if (uniqueItems.length === 0) return null;
                  return (
                    <SelectGroup key={group.label}>
                      <SelectLabel>{group.label}</SelectLabel>
                      {uniqueItems.map((make) => (
                        <SelectItem key={make.value} value={make.value}>
                          {make.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  );
                });
              })()}
            </CustomFormField>

            <CustomFormField
              control={control}
              fieldType={FormFieldType.SELECT}
              name="model"
              label="Modell"
              placeholder="Modell wählen"
              disabled={!selectedMake}
            >
              {selectedMake &&
                activeModels[selectedMake]?.map(
                  (model: { value: string; label: string }) => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label}
                    </SelectItem>
                  ),
                )}
            </CustomFormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <CustomFormField
              control={control}
              fieldType={FormFieldType.SELECT}
              name="gearTransmission"
              label="Getriebe"
              placeholder="Getriebe wählen"
            >
              {GearTransmissionEnum.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </CustomFormField>

            <CustomFormField
              control={control}
              fieldType={FormFieldType.SELECT}
              name="transmissionType"
              label="Getriebe Typ"
              placeholder="Typ wählen"
              disabled={!gearTransmission}
            >
              {TransmissionTypeEnum.filter((t) => {
                if (!gearTransmission) return true;
                if (gearTransmission === "automatic") {
                  return [
                    "automatic",
                    "automatic-stepless",
                    "semi-automatic",
                  ].includes(t.value);
                }
                if (gearTransmission === "manual") {
                  return t.value === "manual";
                }
                return true;
              }).map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </CustomFormField>
          </div>

          <CustomFormField
            control={control}
            fieldType={FormFieldType.INPUT}
            name="version"
            label="Version"
            placeholder="Version (z.B. GT Sky)"
          />

          <CustomFormField
            control={control}
            fieldType={FormFieldType.SELECT}
            name="driveType"
            label="Antrieb"
            placeholder="Antrieb wählen"
          >
            {DriveTypeEnum.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </CustomFormField>

          <CustomFormField
            control={control}
            fieldType={FormFieldType.SELECT}
            name="bodyType"
            label="Karosserie"
            placeholder="Karosserie wählen"
          >
            {activeBodyTypeEnum.map(
              (type: { value: string; label: string }) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ),
            )}
          </CustomFormField>

          <CustomFormField
            control={control}
            fieldType={FormFieldType.SELECT}
            name="fuelType"
            label="Kraftstoff"
            placeholder="Kraftstoff wählen"
          >
            {activeFuelTypeEnum.map(
              (type: { value: string; label: string }) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ),
            )}
          </CustomFormField>

          <CustomFormField
            control={control}
            fieldType={FormFieldType.SELECT}
            name="color"
            label="Aussenfarbe"
            placeholder="Farbe wählen"
          >
            {ColorEnum.map((color) => (
              <SelectItem key={color.value} value={color.value}>
                {color.label}
              </SelectItem>
            ))}
          </CustomFormField>

          <CustomFormField
            control={control}
            fieldType={FormFieldType.SELECT}
            name="interiorColor"
            label="Innenraumfarbe"
            placeholder="Farbe wählen"
          >
            {ColorEnum.map((color) => (
              <SelectItem key={color.value} value={color.value}>
                {color.label}
              </SelectItem>
            ))}
          </CustomFormField>

          <CustomFormField
            control={control}
            fieldType={FormFieldType.CHECKBOX}
            name="metallic"
            label="Métalisé"
          />
        </AccordionContent>
      </AccordionItem>

      <Separator />

      <AccordionItem value="condition" className="border-none">
        <AccordionTrigger className="flex items-center text-xl text-primary font-bold cursor-pointer hover:no-underline">
          Zustand
        </AccordionTrigger>
        <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 px-1">
          <CustomFormField
            control={control}
            fieldType={FormFieldType.SELECT}
            name="vehicleCondition"
            label="Zustand"
            placeholder="Zustand wählen"
          >
            {VehicleConditionEnum.map((c: { value: string; label: string }) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </CustomFormField>

          <CustomFormField
            control={control}
            fieldType={FormFieldType.DATE_PICKER}
            name="lastInspectionDate"
            label="Letzte MFK"
            placeholder="Datum wählen"
          />

          <div className="grid grid-cols-2 gap-3">
            <CustomFormField
              control={control}
              fieldType={FormFieldType.SELECT}
              name="registrationMonth"
              label="Reg. Monat"
              placeholder="Monat"
            >
              {months.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </CustomFormField>
            <CustomFormField
              control={control}
              fieldType={FormFieldType.SELECT}
              name="registrationYear"
              label="Reg. Jahr"
              placeholder="Jahr"
            >
              {years.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </CustomFormField>
          </div>

          <CustomFormField
            control={control}
            fieldType={FormFieldType.INPUT}
            inputType="number"
            name="kilometer"
            label="Kilometerstand"
            placeholder="0"
          />

          <CustomFormField
            control={control}
            fieldType={FormFieldType.SELECT}
            name="warranty"
            label="Garantie"
            placeholder="Garantie wählen"
          >
            {WarrantyEnum.map((warranty) => (
              <SelectItem key={warranty.value} value={warranty.value}>
                {warranty.label}
              </SelectItem>
            ))}
          </CustomFormField>

          {(showWarrantyDetails || showWarrantyStartDate) && (
            <>
              {showWarrantyStartDate && (
                <CustomFormField
                  control={control}
                  fieldType={FormFieldType.DATE_PICKER}
                  name="warrantyStartDate"
                  label="Startdatum"
                  placeholder="Datum wählen"
                />
              )}

              {showWarrantyDetails && (
                <div className="grid grid-cols-2 gap-3">
                  <CustomFormField
                    control={control}
                    fieldType={FormFieldType.INPUT_GROUP}
                    inputType="number"
                    name="duration"
                    label="Dauer"
                    inputGroupText="Monate"
                    placeholder="0"
                  />
                  <CustomFormField
                    control={control}
                    fieldType={FormFieldType.INPUT}
                    inputType="number"
                    name="maxKm"
                    label="Max km"
                    placeholder="0"
                  />
                </div>
              )}
            </>
          )}

          <div className="col-span-1 md:col-span-2">
            <CustomFormField
              control={control}
              fieldType={FormFieldType.CHECKBOX}
              name="inspectionPassed"
              label="MFK bestanden"
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      <Separator />

      <AccordionItem value="price">
        <AccordionTrigger className="flex items-center text-xl text-primary font-bold cursor-pointer hover:no-underline">
          Preis
        </AccordionTrigger>
        <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 px-1">
          <CustomFormField
            control={control}
            fieldType={FormFieldType.INPUT_GROUP}
            inputType="number"
            name="price"
            label="Verkaufspreis"
            inputGroupText="CHF"
            placeholder="0"
          />
          <CustomFormField
            control={control}
            fieldType={FormFieldType.INPUT_GROUP}
            inputType="number"
            name="newPrice"
            label="Neupreis"
            inputGroupText="CHF"
            placeholder="0"
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
