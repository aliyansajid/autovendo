"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
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
import { carMakes, carModels } from "@/constants/cars";
import { getRegistrationYears } from "@/lib/utils";
import { Field, FieldGroup } from "@repo/ui/src/components/field";
import { Search, Settings2 } from "lucide-react";
import Link from "next/link";
import { prices } from "@/constants";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  query: z.string().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  price: z.string().optional(),
  registration: z.string().optional(),
});

export const SearchForm = () => {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "",
      make: "",
      model: "",
      price: "",
      registration: "",
    },
  });

  const selectedMake = form.watch("make");

  useEffect(() => {
    form.setValue("model", "");
  }, [selectedMake, form]);

  function onSubmit(data: z.infer<typeof formSchema>) {
    const params = new URLSearchParams();
    if (data.query?.trim()) params.set("search", data.query.trim());
    if (data.make) params.set("make", data.make);
    if (data.model) params.set("model", data.model);
    if (data.price) params.set("priceFrom", data.price);
    if (data.registration) params.set("registrationFrom", data.registration);
    const query = params.toString();
    router.push(query ? `/cars?${query}` : "/cars");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-center font-bold">
          Gebrauchte und neue Fahrzeuge finden
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-4">
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT_GROUP}
              name="query"
              placeholder="Suchen..."
              inputGroupIcon={<Search />}
              ariaLabel="Suchen"
            />

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.SELECT}
                name="make"
                placeholder="Marke"
                ariaLabel="Marke"
              >
                {carMakes.map((group) => (
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
                placeholder="Modell"
                ariaLabel="Modell"
                disabled={
                  !selectedMake ||
                  !carModels[selectedMake as keyof typeof carModels]
                }
              >
                {selectedMake &&
                  carModels[selectedMake as keyof typeof carModels]?.map(
                    (model) => (
                      <SelectItem
                        key={`${selectedMake}-${model.value}`}
                        value={model.value}
                      >
                        {model.label}
                      </SelectItem>
                    ),
                  )}
              </CustomFormField>

              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.SELECT}
                name="price"
                placeholder="Preis"
                ariaLabel="Preis"
              >
                {prices.map((price) => (
                  <SelectItem key={price.value} value={price.value}>
                    {price.label}
                  </SelectItem>
                ))}
              </CustomFormField>

              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.SELECT}
                name="registration"
                placeholder="Fahrzeugkennzeichen"
                ariaLabel="Fahrzeugkennzeichen"
              >
                {getRegistrationYears().map((year) => (
                  <SelectItem key={year.value} value={year.value}>
                    {year.label}
                  </SelectItem>
                ))}
              </CustomFormField>

              <Field>
                <Button type="submit">
                  <Search />
                  Suchen
                </Button>
              </Field>
            </div>

            <div className="flex justify-center md:justify-end">
              <Button variant="link" asChild>
                <Link href="advanced-search">
                  <Settings2 />
                  Erweiterte Suche
                </Link>
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};
