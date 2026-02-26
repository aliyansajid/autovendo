"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/components/custom-form-field";
import { SelectItem } from "@repo/ui/components/select";
import {
  ColorEnum,
  EquipmentEnum,
  VehicleConditionEnum,
  FuelTypeEnum,
  BodyTypeEnum,
  TransmissionTypeEnum,
  prices,
  powerOptions,
  evOptions,
} from "@/constants";
import { FieldGroup, FieldLabel } from "@repo/ui/components/field";
import { Separator } from "@repo/ui/components/separator";
import { getRegistrationYears, mileages } from "@/lib/utils";
import { GenericFilterDialog } from "./generic-filter-dialog";
import { MakeSelectorDialog } from "@/components/make-selector-dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/src/components/card";

const formSchema = z.object({
  paymentType: z.string().optional(),
  priceFrom: z.string().optional(),
  priceTo: z.string().optional(),
  registrationFrom: z.string().optional(),
  registrationTo: z.string().optional(),
  mileageFrom: z.string().optional(),
  mileageTo: z.string().optional(),
  condition: z.array(z.string()).optional(),
  make: z.string().optional(),
  fuel: z.array(z.string()).optional(),
  power: z.array(z.string()).optional(),
  vehicleType: z.array(z.string()).optional(),
  evs: z.array(z.string()).optional(),
  transmission: z.array(z.string()).optional(),
});

export const FiltersSidebar = ({
  onClose,
  showActions = true,
}: {
  onClose?: () => void;
  showActions?: boolean;
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paymentType: "buy",
      condition: [],
      fuel: [],
      power: [],
      vehicleType: [],
      evs: [],
      transmission: [],
    },
  });

  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  const watchCondition = form.watch("condition");
  const watchMake = form.watch("make");
  const watchFuel = form.watch("fuel");
  const watchPower = form.watch("power");
  const watchVehicleType = form.watch("vehicleType");
  const watchEvs = form.watch("evs");
  const watchTransmission = form.watch("transmission");

  const renderSelectedText = (
    arr: string[] | undefined,
    options: readonly any[],
  ) => {
    if (!arr || arr.length === 0) return "Beliebig";
    if (arr.length === 1) {
      return options.find((o) => o.value === arr[0])?.label || arr[0];
    }
    return `${arr.length} ausgewählt`;
  };

  return (
    <Card>
      <CardHeader className="border-b gap-0">
        <CardTitle>Weitere Filter</CardTitle>
      </CardHeader>
      <CardContent>
        <form>
          <FieldGroup className="gap-6">
            <Button asChild variant="outline">
              <Link href="/advance-search">Mehr Filter</Link>
            </Button>

            <Separator />

            <div className="space-y-3">
              <FieldLabel>Fahrzeugzustand</FieldLabel>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                {renderSelectedText(watchCondition, VehicleConditionEnum)}
                <span
                  className="text-primary cursor-pointer hover:underline"
                  onClick={() => setActiveDialog("condition")}
                >
                  ändern
                </span>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <FieldLabel>Marke, Modell</FieldLabel>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                {watchMake || "Beliebig"}
                <span
                  className="text-primary cursor-pointer hover:underline"
                  onClick={() => setActiveDialog("make")}
                >
                  ändern
                </span>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <FieldLabel>Preis</FieldLabel>
              <div className="flex gap-2">
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.SELECT}
                  name="priceFrom"
                  placeholder="von"
                >
                  <SelectItem value="any">Beliebig</SelectItem>
                  {prices.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </CustomFormField>
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.SELECT}
                  name="priceTo"
                  placeholder="bis"
                >
                  <SelectItem value="any">Beliebig</SelectItem>
                  {prices.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </CustomFormField>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <FieldLabel>Erstzulassung</FieldLabel>
              <div className="flex gap-2">
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.SELECT}
                  name="registrationFrom"
                  placeholder="von"
                >
                  <SelectItem value="any">Beliebig</SelectItem>
                  {getRegistrationYears().map((y) => (
                    <SelectItem key={y.value} value={y.value}>
                      {y.label}
                    </SelectItem>
                  ))}
                </CustomFormField>
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.SELECT}
                  name="registrationTo"
                  placeholder="bis"
                >
                  <SelectItem value="any">Beliebig</SelectItem>
                  {getRegistrationYears().map((y) => (
                    <SelectItem key={y.value} value={y.value}>
                      {y.label}
                    </SelectItem>
                  ))}
                </CustomFormField>
              </div>
            </div>

            <div className="space-y-3">
              <FieldLabel>Kilometerstand</FieldLabel>
              <div className="flex gap-2">
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.SELECT}
                  name="mileageFrom"
                  placeholder="von"
                >
                  <SelectItem value="any">Beliebig</SelectItem>
                  {mileages.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </CustomFormField>
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.SELECT}
                  name="mileageTo"
                  placeholder="bis"
                >
                  <SelectItem value="any">Beliebig</SelectItem>
                  {mileages.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </CustomFormField>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <FieldLabel>Kraftstoffart</FieldLabel>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                {renderSelectedText(watchFuel, FuelTypeEnum)}
                <span
                  className="text-primary cursor-pointer hover:underline"
                  onClick={() => setActiveDialog("fuel")}
                >
                  ändern
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <FieldLabel>Leistung</FieldLabel>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                {renderSelectedText(watchPower, powerOptions)}
                <span
                  className="text-primary cursor-pointer hover:underline"
                  onClick={() => setActiveDialog("power")}
                >
                  ändern
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <FieldLabel>Fahrzeugtyp</FieldLabel>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                {renderSelectedText(watchVehicleType, BodyTypeEnum)}
                <span
                  className="text-primary cursor-pointer hover:underline"
                  onClick={() => setActiveDialog("vehicleType")}
                >
                  ändern
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <FieldLabel>E-Autos</FieldLabel>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                {renderSelectedText(watchEvs, evOptions)}
                <span
                  className="text-primary cursor-pointer hover:underline"
                  onClick={() => setActiveDialog("evs")}
                >
                  ändern
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <FieldLabel>Getriebe</FieldLabel>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                {renderSelectedText(watchTransmission, TransmissionTypeEnum)}
                <span
                  className="text-primary cursor-pointer hover:underline"
                  onClick={() => setActiveDialog("transmission")}
                >
                  ändern
                </span>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <FieldLabel>Außenfarbe</FieldLabel>
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.CHECKBOX}
                name="color-metallic"
                label="Metallic"
              />
              <div className="flex flex-wrap gap-1">
                {ColorEnum.map((color) => (
                  <div
                    key={color.value}
                    className="w-8 h-8 rounded-md cursor-pointer border border-border flex items-center justify-center"
                    title={color.label}
                    style={{
                      background:
                        "gradient" in color ? color.gradient : color.hex,
                    }}
                  ></div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <FieldLabel>Ausstattung</FieldLabel>
              <div className="space-y-3">
                {EquipmentEnum.slice(0, 10).map((equipment) => (
                  <CustomFormField
                    key={equipment.value}
                    control={form.control}
                    fieldType={FormFieldType.CHECKBOX}
                    name={equipment.value}
                    label={equipment.label}
                  />
                ))}
              </div>
              <Link
                href={"/advance-search"}
                className="text-primary cursor-pointer text-sm font-medium hover:underline"
              >
                Mehr...
              </Link>
            </div>
          </FieldGroup>
        </form>

        <GenericFilterDialog
          open={activeDialog === "condition"}
          onOpenChange={(val) => !val && setActiveDialog(null)}
          title="Fahrzeugzustand"
          options={VehicleConditionEnum}
          selectedValues={watchCondition || []}
          onApply={(vals) => form.setValue("condition", vals)}
        />
        <GenericFilterDialog
          open={activeDialog === "fuel"}
          onOpenChange={(val) => !val && setActiveDialog(null)}
          title="Kraftstoffart"
          options={FuelTypeEnum}
          selectedValues={watchFuel || []}
          onApply={(vals) => form.setValue("fuel", vals)}
        />
        <GenericFilterDialog
          open={activeDialog === "power"}
          onOpenChange={(val) => !val && setActiveDialog(null)}
          title="Leistung"
          options={powerOptions}
          selectedValues={watchPower || []}
          onApply={(vals) => form.setValue("power", vals)}
        />
        <GenericFilterDialog
          open={activeDialog === "vehicleType"}
          onOpenChange={(val) => !val && setActiveDialog(null)}
          title="Fahrzeugtyp"
          options={BodyTypeEnum}
          selectedValues={watchVehicleType || []}
          onApply={(vals) => form.setValue("vehicleType", vals)}
        />
        <GenericFilterDialog
          open={activeDialog === "evs"}
          onOpenChange={(val) => !val && setActiveDialog(null)}
          title="E-Autos"
          options={evOptions}
          selectedValues={watchEvs || []}
          maxSelections={1}
          onApply={(vals) => form.setValue("evs", vals)}
        />
        <GenericFilterDialog
          open={activeDialog === "transmission"}
          onOpenChange={(val) => !val && setActiveDialog(null)}
          title="Getriebe"
          options={TransmissionTypeEnum}
          selectedValues={watchTransmission || []}
          onApply={(vals) => form.setValue("transmission", vals)}
        />

        <MakeSelectorDialog
          open={activeDialog === "make"}
          onOpenChange={(val) => !val && setActiveDialog(null)}
          onSelect={(make) => {
            form.setValue("make", make);
            setActiveDialog(null);
          }}
        />
      </CardContent>
    </Card>
  );
};
