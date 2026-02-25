"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@repo/ui/src/components/button";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/src/components/custom-form-field";
import {
  BodyTypeEnum,
  ColorEnum,
  DriveTypeEnum,
  EquipmentEnum,
  FuelTypeEnum,
  TransmissionTypeEnum,
} from "@/constants";
import { Field, FieldGroup, FieldLabel } from "@repo/ui/src/components/field";

const formSchema = z.object({
  email: z.email("Invalid email address"),
});

export function FiltersSidebar({
  onClose,
  showActions = true,
}: {
  onClose?: () => void;
  showActions?: boolean;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    console.log(data);
  }

  return (
    <div className="flex flex-col bg-background border rounded-lg shadow-sm p-4">
      <form className="space-y-6">
        <FieldGroup>
          <div className="space-y-3">
            <FieldLabel>Price</FieldLabel>
            <div className="flex gap-2">
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                name="price-from"
                placeholder="From"
              />
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                name="price-to"
                placeholder="To"
              />
            </div>
          </div>

          <div className="space-y-3">
            <FieldLabel>Registration</FieldLabel>
            <div className="flex gap-2">
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                name="registration-from"
                placeholder="From"
              />
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                name="registration-to"
                placeholder="To"
              />
            </div>
          </div>

          <div className="space-y-3">
            <FieldLabel>Mileage</FieldLabel>
            <div className="flex gap-2">
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                name="mileage-from"
                placeholder="From"
              />
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                name="mileage-to"
                placeholder="To"
              />
            </div>
          </div>

          <div className="space-y-3">
            <FieldLabel>Transmission Type</FieldLabel>
            <div className="space-y-2">
              {TransmissionTypeEnum.map((transmission) => (
                <CustomFormField
                  key={transmission.value}
                  control={form.control}
                  fieldType={FormFieldType.CHECKBOX}
                  name={transmission.value}
                  label={transmission.label}
                />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <FieldLabel>Fuel</FieldLabel>
            <div className="space-y-2">
              {FuelTypeEnum.map((fuel) => (
                <CustomFormField
                  key={fuel.value}
                  control={form.control}
                  fieldType={FormFieldType.CHECKBOX}
                  name={fuel.value}
                  label={fuel.label}
                />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <FieldLabel>Vehicle Type</FieldLabel>
            <div className="space-y-2">
              {BodyTypeEnum.map((bodyType) => (
                <CustomFormField
                  key={bodyType.value}
                  control={form.control}
                  fieldType={FormFieldType.CHECKBOX}
                  name={bodyType.value}
                  label={bodyType.label}
                />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <FieldLabel>Drive Type</FieldLabel>
            <div className="space-y-2">
              {DriveTypeEnum.map((driveType) => (
                <CustomFormField
                  key={driveType.value}
                  control={form.control}
                  fieldType={FormFieldType.CHECKBOX}
                  name={driveType.value}
                  label={driveType.label}
                />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <FieldLabel>Exterior color</FieldLabel>
            <div className="space-y-2">
              {ColorEnum.map((color) => (
                <CustomFormField
                  key={color.value}
                  control={form.control}
                  fieldType={FormFieldType.CHECKBOX}
                  name={color.value}
                  label={
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-4 w-4 border rounded-full ${"border" in color && color.border ? "border-border" : "border-transparent"}`}
                        style={{
                          background:
                            "gradient" in color ? color.gradient : color.hex,
                        }}
                      />
                      {color.label}
                    </div>
                  }
                />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <FieldLabel>Features</FieldLabel>
            <div className="space-y-2">
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
          </div>

          <Field>
            <Button variant="outline" asChild>
              <Link href="/advance-search">Advanced Search</Link>
            </Button>
            <Button variant="outline">Reset</Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
