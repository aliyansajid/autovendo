"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { useEffect } from "react";
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
import { makes, models, prices, countries } from "@/constants";
import FeaturedListings from "@/components/featured-listings";
import FeaturedGarage from "@/components/featured-garage";
import About from "@/components/about";
import Link from "next/link";
import { Filter, SearchIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@repo/ui/src/components/input-group";
import { getRegistrationYears } from "@/lib/utils";

const formSchema = z.object({
  query: z.string().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  price: z.string().optional(),
  registration: z.string().optional(),
  country: z.string().optional(),
  zipcode: z.string().optional(),
});

const page = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "",
      make: "",
      model: "",
      price: "",
      registration: "",
      country: "europe",
      zipcode: "",
    },
  });

  const selectedMake = form.watch("make");

  useEffect(() => {
    form.setValue("model", "");
  }, [selectedMake, form]);

  function onSubmit(data: z.infer<typeof formSchema>) {
    toast("You submitted the following values:");
  }

  return (
    <>
      <div className="bg-linear-to-r from-primary to-primary/80">
        <div className="w-full max-w-285 mx-auto py-12 md:py-20 px-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl font-bold text-center">
                Gebrauchte und neue Fahrzeuge finden
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  className="flex flex-col gap-4"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <div className="grid grid-cols-1">
                    <div className="w-full">
                      <InputGroup>
                        <InputGroupInput placeholder="Suchen..." />
                        <InputGroupAddon>
                          <SearchIcon />
                        </InputGroupAddon>
                      </InputGroup>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex-1">
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.SELECT}
                        name="make"
                        className="w-full"
                        placeholder="Marke"
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
                    </div>
                    <div className="flex-1">
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.SELECT}
                        name="model"
                        className="w-full"
                        placeholder="Modell"
                        disabled={!selectedMake}
                      >
                        {selectedMake &&
                          models[selectedMake as keyof typeof models]?.map(
                            (model: { value: string; label: string }) => (
                              <SelectItem key={model.value} value={model.value}>
                                {model.label}
                              </SelectItem>
                            ),
                          )}
                      </CustomFormField>
                    </div>
                    <div className="flex-1">
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.SELECT}
                        name="price"
                        className="w-full"
                        placeholder="Preis €"
                      >
                        {prices.map((price) => (
                          <SelectItem key={price.value} value={price.value}>
                            {price.label}
                          </SelectItem>
                        ))}
                      </CustomFormField>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex-1">
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.SELECT}
                        name="registration"
                        className="w-full"
                        placeholder="Erstzulassung ab"
                      >
                        {getRegistrationYears().map((year) => (
                          <SelectItem key={year.value} value={year.value}>
                            {year.label}
                          </SelectItem>
                        ))}
                      </CustomFormField>
                    </div>
                    <div className="flex flex-1 gap-4">
                      <div className="flex-1">
                        <CustomFormField
                          control={form.control}
                          fieldType={FormFieldType.SELECT}
                          name="country"
                          className="w-full"
                          placeholder="Land"
                        >
                          {countries.map((country) => (
                            <SelectItem
                              key={country.value}
                              value={country.value}
                            >
                              {country.flag} {country.label}
                            </SelectItem>
                          ))}
                        </CustomFormField>
                      </div>
                      <div className="flex-1">
                        <CustomFormField
                          control={form.control}
                          fieldType={FormFieldType.INPUT}
                          name="zipcode"
                          className="w-full"
                          placeholder="PLZ"
                        />
                      </div>
                    </div>
                    <div className="flex-1 flex gap-4">
                      <div className="flex-1">
                        <Link href="/advanced-search" className="w-full">
                          <Button
                            variant="outline"
                            type="button"
                            className="w-full"
                          >
                            <Filter /> Erweiterte Suche
                          </Button>
                        </Link>
                      </div>
                      <div className="flex-1">
                        <Button className="w-full">2.029.498 Ergebnisse</Button>
                      </div>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
      <FeaturedListings />
      <FeaturedGarage />
      <About />
    </>
  );
};

export default page;
