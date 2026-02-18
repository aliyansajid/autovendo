"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Form } from "@repo/ui/src/components/form";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/src/components/custom-form-field";
import {
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@repo/ui/src/components/select";
import { Button } from "@repo/ui/src/components/button";
import {
  makes,
  models,
  prices,
  BodyTypeEnum,
  FuelTypeEnum,
  TransmissionTypeEnum,
  DriveTypeEnum,
  ColorEnum,
} from "@/constants";
import { getRegistrationYears } from "@/lib/utils";
import { Filter, ChevronDown, ChevronUp, X } from "lucide-react";

const formSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  priceFrom: z.string().optional(),
  yearFrom: z.string().optional(),
  bodyType: z.string().optional(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  driveType: z.string().optional(),
  color: z.string().optional(),
  seats: z.string().optional(),
  doors: z.string().optional(),
  power: z.string().optional(),
  mileageFrom: z.string().optional(),
});

export default function GarageFilters() {
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      make: "",
      model: "",
      priceFrom: "",
      yearFrom: "",
      bodyType: "",
      fuelType: "",
      transmission: "",
      driveType: "",
      color: "",
      seats: "",
      doors: "",
      power: "",
      mileageFrom: "",
    },
  });

  const selectedMake = form.watch("make");

  useEffect(() => {
    if (selectedMake) {
      form.setValue("model", "");
    }
  }, [selectedMake, form.setValue]);

  function onSubmit(data: z.infer<typeof formSchema>) {
    console.log(data);
    // Handle filter application logic here
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Find your perfect car</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.SELECT}
                name="make"
                placeholder="Make"
                className="w-full"
              >
                {makes.map((group) => (
                  <SelectGroup key={group.label}>
                    <SelectLabel>{group.label}</SelectLabel>
                    {group.items.map((make) => (
                      <SelectItem
                        key={`${group.label}-${make.value}`}
                        value={make.value}
                      >
                        {make.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </CustomFormField>

              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.SELECT}
                name="model"
                placeholder="Model"
                disabled={!selectedMake}
                className="w-full"
              >
                {selectedMake &&
                  models[selectedMake as keyof typeof models]?.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label}
                    </SelectItem>
                  ))}
              </CustomFormField>

              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.SELECT}
                name="yearFrom"
                placeholder="Year from"
                className="w-full"
              >
                {getRegistrationYears().map((year) => (
                  <SelectItem key={year.value} value={year.value}>
                    {year.label}
                  </SelectItem>
                ))}
              </CustomFormField>

              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.SELECT}
                name="priceFrom"
                placeholder="Price from (€)"
                className="w-full"
              >
                {prices.map((price) => (
                  <SelectItem key={price.value} value={price.value}>
                    {price.label}
                  </SelectItem>
                ))}
              </CustomFormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.SELECT}
                name="bodyType"
                placeholder="Body Type"
                className="w-full"
              >
                {BodyTypeEnum.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </CustomFormField>

              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.SELECT}
                name="fuelType"
                placeholder="Fuel Type"
                className="w-full"
              >
                {FuelTypeEnum.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </CustomFormField>

              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.SELECT}
                name="transmission"
                placeholder="Transmission"
                className="w-full"
              >
                {TransmissionTypeEnum.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </CustomFormField>

              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                name="mileageFrom"
                placeholder="Mileage from (km)"
                className="w-full"
              />
            </div>

            {showMoreFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2">
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.SELECT}
                  name="driveType"
                  placeholder="Drive Type"
                  className="w-full"
                >
                  {DriveTypeEnum.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </CustomFormField>

                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.SELECT}
                  name="color"
                  placeholder="Color"
                  className="w-full"
                >
                  {ColorEnum.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      {color.label}
                    </SelectItem>
                  ))}
                </CustomFormField>

                {/* <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.SELECT}
                  name="seats"
                  placeholder="Seats"
                  className="w-full"
                >
                  {seats.map((seat) => (
                    <SelectItem key={seat.value} value={seat.value}>
                      {seat.label}
                    </SelectItem>
                  ))}
                </CustomFormField>

                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.SELECT}
                  name="doors"
                  placeholder="Doors"
                  className="w-full"
                >
                  {doors.map((door) => (
                    <SelectItem key={door.value} value={door.value}>
                      {door.label}
                    </SelectItem>
                  ))}
                </CustomFormField> */}

                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  name="power"
                  placeholder="Power (kW/hp)"
                  className="w-full"
                />
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="w-full sm:w-auto">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowMoreFilters(!showMoreFilters)}
                >
                  {showMoreFilters ? (
                    <>
                      <ChevronUp /> Less filters
                    </>
                  ) : (
                    <>
                      <ChevronDown /> More filters
                    </>
                  )}
                </Button>
              </div>

              <div className="flex gap-4 w-full sm:w-auto justify-end">
                <Button type="submit">Show Results</Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
