import { useFormContext, useWatch } from "react-hook-form";
import { useTranslations } from "next-intl";
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
import { Separator } from "@repo/ui/components/separator";

export function BasicDataSection() {
  const t = useTranslations("VehicleFormSections");
  const t_vehicle = useTranslations("Vehicle");
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
    { value: "1", label: t("months.1") },
    { value: "2", label: t("months.2") },
    { value: "3", label: t("months.3") },
    { value: "4", label: t("months.4") },
    { value: "5", label: t("months.5") },
    { value: "6", label: t("months.6") },
    { value: "7", label: t("months.7") },
    { value: "8", label: t("months.8") },
    { value: "9", label: t("months.9") },
    { value: "10", label: t("months.10") },
    { value: "11", label: t("months.11") },
    { value: "12", label: t("months.12") },
  ];

  return (
    <Accordion
      type="multiple"
      defaultValue={["features", "condition", "price"]}
      className="space-y-6"
    >
      <AccordionItem value="features" className="border-none">
        <AccordionTrigger className="flex items-center text-xl text-primary font-bold cursor-pointer hover:no-underline">
          {t("vehicleFeatures")}
        </AccordionTrigger>
        <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 px-1">
          <div className="col-span-1 md:col-span-2">
            <CustomFormField
              control={control}
              fieldType={FormFieldType.SELECT}
              name="vehicleType"
              label={t("vehicleType")}
              placeholder={t("vehicleTypePlaceholder")}
            >
              {VehicleTypeEnum.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {t_vehicle(`types.${type.value.toUpperCase().replace(/-/g, "_")}`)}
                </SelectItem>
              ))}
            </CustomFormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <CustomFormField
              control={control}
              fieldType={FormFieldType.SELECT}
              name="make"
              label={t("make")}
              placeholder={t("makePlaceholder")}
            >
              {(() => {
                const seen = new Set<string>();
                return activeMakes.map((group) => {
                  const uniqueItems = group.items.filter(
                    (make) => !seen.has(make.value),
                  );
                  uniqueItems.forEach((make) => seen.add(make.value));
                  if (uniqueItems.length === 0) return null;
                  
                  const groupKey = group.label === "Top-Marken" ? "topBrands" : "allBrands";
                  
                  return (
                    <SelectGroup key={group.label}>
                      <SelectLabel>{t_vehicle(`brandGroups.${groupKey}`)}</SelectLabel>
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
              label={t("model")}
              placeholder={t("modelPlaceholder")}
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
              label={t("transmission")}
              placeholder={t("transmissionPlaceholder")}
            >
              {GearTransmissionEnum.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {t_vehicle(`transmissionTypes.${type.value.toUpperCase()}`)}
                </SelectItem>
              ))}
            </CustomFormField>

            <CustomFormField
              control={control}
              fieldType={FormFieldType.SELECT}
              name="transmissionType"
              label={t("transmissionType")}
              placeholder={t("transmissionTypePlaceholder")}
              disabled={!gearTransmission}
            >
              {TransmissionTypeEnum.filter((t_type) => {
                if (!gearTransmission) return true;
                if (gearTransmission === "automatic") {
                  return [
                    "automatic",
                    "automatic-stepless",
                    "semi-automatic",
                  ].includes(t_type.value);
                }
                if (gearTransmission === "manual") {
                  return t_type.value === "manual";
                }
                return true;
              }).map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {t_vehicle(`transmissionTypes.${type.value.toUpperCase().replace(/-/g, "_")}`)}
                </SelectItem>
              ))}
            </CustomFormField>
          </div>

          <CustomFormField
            control={control}
            fieldType={FormFieldType.INPUT}
            name="version"
            label={t("version")}
            placeholder={t("versionPlaceholder")}
          />

          <CustomFormField
            control={control}
            fieldType={FormFieldType.SELECT}
            name="driveType"
            label={t("driveType")}
            placeholder={t("driveTypePlaceholder")}
          >
            {DriveTypeEnum.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {t_vehicle(`driveTypes.${type.value.toUpperCase().replace(/-/g, "_")}`)}
              </SelectItem>
            ))}
          </CustomFormField>

          <CustomFormField
            control={control}
            fieldType={FormFieldType.SELECT}
            name="bodyType"
            label={t("bodyType")}
            placeholder={t("bodyTypePlaceholder")}
          >
            {activeBodyTypeEnum.map(
              (type: { value: string; label: string }) => (
                <SelectItem key={type.value} value={type.value}>
                  {t_vehicle(`types.${type.value.toUpperCase().replace(/-/g, "_")}`)}
                </SelectItem>
              ),
            )}
          </CustomFormField>

          <CustomFormField
            control={control}
            fieldType={FormFieldType.SELECT}
            name="fuelType"
            label={t("fuelType")}
            placeholder={t("fuelTypePlaceholder")}
          >
            {activeFuelTypeEnum.map(
              (type: { value: string; label: string }) => (
                <SelectItem key={type.value} value={type.value}>
                  {t_vehicle(`fuelTypes.${type.value.toUpperCase().replace(/-/g, "_")}`)}
                </SelectItem>
              ),
            )}
          </CustomFormField>

          <CustomFormField
            control={control}
            fieldType={FormFieldType.SELECT}
            name="color"
            label={t("color")}
            placeholder={t("colorPlaceholder")}
          >
            {ColorEnum.map((color) => (
              <SelectItem key={color.value} value={color.value}>
                {t_vehicle(`colors.${color.value.toUpperCase()}`)}
              </SelectItem>
            ))}
          </CustomFormField>

          <CustomFormField
            control={control}
            fieldType={FormFieldType.SELECT}
            name="interiorColor"
            label={t("interiorColor")}
            placeholder={t("interiorColorPlaceholder")}
          >
            {ColorEnum.map((color) => (
              <SelectItem key={color.value} value={color.value}>
                {t_vehicle(`colors.${color.value.toUpperCase()}`)}
              </SelectItem>
            ))}
          </CustomFormField>

          <CustomFormField
            control={control}
            fieldType={FormFieldType.CHECKBOX}
            name="metallic"
            label={t("metallic")}
          />
        </AccordionContent>
      </AccordionItem>

      <Separator />

      <AccordionItem value="condition" className="border-none">
        <AccordionTrigger className="flex items-center text-xl text-primary font-bold cursor-pointer hover:no-underline">
          {t("condition")}
        </AccordionTrigger>
        <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 px-1">
          <CustomFormField
            control={control}
            fieldType={FormFieldType.SELECT}
            name="vehicleCondition"
            label={t("vehicleCondition")}
            placeholder={t("vehicleConditionPlaceholder")}
          >
            {VehicleConditionEnum.map((c: { value: string; label: string }) => (
              <SelectItem key={c.value} value={c.value}>
                {t_vehicle(`conditions.${c.value.toUpperCase().replace(/-/g, "_")}`)}
              </SelectItem>
            ))}
          </CustomFormField>

          <CustomFormField
            control={control}
            fieldType={FormFieldType.DATE_PICKER}
            name="lastInspectionDate"
            label={t("lastInspectionDate")}
            placeholder={t("datePlaceholder")}
          />

          <div className="grid grid-cols-2 gap-3">
            <CustomFormField
              control={control}
              fieldType={FormFieldType.SELECT}
              name="registrationMonth"
              label={t("registrationMonth")}
              placeholder={t("registrationMonthPlaceholder")}
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
              label={t("registrationYear")}
              placeholder={t("registrationYearPlaceholder")}
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
            label={t("kilometer")}
            placeholder={t("kilometerPlaceholder")}
          />

          <CustomFormField
            control={control}
            fieldType={FormFieldType.SELECT}
            name="warranty"
            label={t("warranty")}
            placeholder={t("warrantyPlaceholder")}
          >
            {WarrantyEnum.map((warranty_item) => (
              <SelectItem key={warranty_item.value} value={warranty_item.value}>
                {t_vehicle(`warranty.${warranty_item.value.replace(/-/g, "_").toUpperCase()}`)}
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
                  label={t("warrantyStartDateLabel")}
                  placeholder={t("datePlaceholder")}
                />
              )}

              {showWarrantyDetails && (
                <div className="grid grid-cols-2 gap-3">
                  <CustomFormField
                    control={control}
                    fieldType={FormFieldType.INPUT_GROUP}
                    inputType="number"
                    name="duration"
                    label={t("warrantyDurationLabel")}
                    inputGroupText={t("warrantyDurationMonths")}
                    placeholder="0"
                  />
                  <CustomFormField
                    control={control}
                    fieldType={FormFieldType.INPUT}
                    inputType="number"
                    name="maxKm"
                    label={t("maxKm")}
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
              label={t("mainInspectionPassed")}
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      <Separator />

      <AccordionItem value="price">
        <AccordionTrigger className="flex items-center text-xl text-primary font-bold cursor-pointer hover:no-underline">
          {t("priceSection")}
        </AccordionTrigger>
        <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 px-1">
          <CustomFormField
            control={control}
            fieldType={FormFieldType.INPUT_GROUP}
            inputType="number"
            name="price"
            label={t("salePrice")}
            inputGroupText={t("units.chf")}
            placeholder={t("pricePlaceholder")}
          />
          <CustomFormField
            control={control}
            fieldType={FormFieldType.INPUT_GROUP}
            inputType="number"
            name="newPrice"
            label={t("newPrice")}
            inputGroupText={t("units.chf")}
            placeholder={t("newPricePlaceholder")}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
