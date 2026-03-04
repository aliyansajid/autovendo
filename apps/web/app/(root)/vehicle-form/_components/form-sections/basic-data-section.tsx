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
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@repo/ui/src/components/accordion";
import { Separator } from "@repo/ui/components/separator";
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

export function BasicDataSection() {
  const { control } = useFormContext();

  const vehicleType = useWatch({ control, name: "vehicleType" });
  const selectedMake = useWatch({ control, name: "make" });
  const gearTransmission = useWatch({ control, name: "gearTransmission" });
  const warranty = useWatch({ control, name: "warranty" });

  const isCommercial = vehicleType === "utility";
  const isTruck = vehicleType === "truck";
  const isCamper = vehicleType === "camper";

  const activeMakes = (
    isTruck
      ? truckMakes
      : isCamper
        ? camperMakes
        : isCommercial
          ? utilityMakes
          : carMakes
  ) as ReadonlyArray<{
    label: string;
    items: ReadonlyArray<{ value: string; label: string }>;
  }>;

  const activeModels: Record<string, { value: string; label: string }[]> =
    isTruck ? truckModels : isCommercial ? utilityModels : carModels;

  const activeBodyTypeEnum = isTruck
    ? truckBodyTypeEnum
    : isCamper
      ? camperBodyTypeEnum
      : isCommercial
        ? utilityBodyTypeEnum
        : carBodyTypeEnum;

  const activeFuelTypeEnum = isTruck
    ? truckFuelTypeEnum
    : isCamper
      ? camperFuelTypeEnum
      : carFuelTypeEnum;

  const activeVehicleConditionEnum = VehicleConditionEnum;

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
    <div className="space-y-6">
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
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
                placeholder="Select vehicle type"
                className="w-full"
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
                placeholder="Select an option"
                className="w-full"
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
                placeholder="Select an option"
                className="w-full"
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
                placeholder="Select an option"
                className="w-full"
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
                placeholder="Select an option"
                className="w-full"
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
              placeholder="Enter a version"
              className="w-full"
            />

            <CustomFormField
              control={control}
              fieldType={FormFieldType.SELECT}
              name="driveType"
              label="Antrieb"
              placeholder="Select an option"
              className="w-full"
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
              placeholder="Select an option"
              className="w-full"
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
              placeholder="Select an option"
              className="w-full"
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
              label="Farbe"
              placeholder="Select an option"
              className="w-full"
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
              placeholder="Select an option"
              className="w-full"
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
      </Accordion>

      <Separator />

      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger className="flex items-center text-xl text-primary font-bold cursor-pointer hover:no-underline">
            Zustand
          </AccordionTrigger>
          <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 px-1">
            <CustomFormField
              control={control}
              fieldType={FormFieldType.SELECT}
              name="vehicleCondition"
              label="Zustand"
              placeholder="Select an option"
              className="w-full"
            >
              {activeVehicleConditionEnum.map(
                (c: { value: string; label: string }) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ),
              )}
            </CustomFormField>

            <CustomFormField
              control={control}
              fieldType={FormFieldType.DATE_PICKER}
              name="lastInspectionDate"
              label="Letzte MFK"
              placeholder="Select Date"
              className="w-full"
            />

            <div className="grid grid-cols-2 gap-3">
              <CustomFormField
                control={control}
                fieldType={FormFieldType.SELECT}
                name="registrationMonth"
                label="Monat"
                placeholder="Month"
                className="w-full"
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
                label="Jahr"
                placeholder="Year"
                className="w-full"
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
              name="mileage"
              label="Kilometer"
              placeholder="0"
              className="w-full"
            />

            <CustomFormField
              control={control}
              fieldType={FormFieldType.SELECT}
              name="warranty"
              label="Garantie"
              placeholder="Select an option"
              className="w-full"
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
                    label="Start date"
                    placeholder="Select Date"
                    className="w-full"
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
                      inputGroupText="months"
                      inputGroupTextPosition="right"
                      placeholder="0"
                      className="w-full"
                    />
                    <CustomFormField
                      control={control}
                      fieldType={FormFieldType.INPUT}
                      inputType="number"
                      name="maxKm"
                      label="Max km"
                      placeholder="0"
                      className="w-full"
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
      </Accordion>

      <Separator />

      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger className="flex items-center text-xl text-primary font-bold cursor-pointer hover:no-underline">
            Price
          </AccordionTrigger>
          <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 px-1">
            <CustomFormField
              control={control}
              fieldType={FormFieldType.INPUT_GROUP}
              inputType="number"
              name="priceChf"
              label="Price"
              inputGroupText="CHF"
              placeholder="0"
            />
            <CustomFormField
              control={control}
              fieldType={FormFieldType.INPUT_GROUP}
              inputType="number"
              name="newPriceChf"
              label="New Price"
              inputGroupText="CHF"
              placeholder="0"
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
