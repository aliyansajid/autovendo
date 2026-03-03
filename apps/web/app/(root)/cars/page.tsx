"use client";

import { FiltersSidebar } from "./_components/filters-sidebar";
import { ListingListCard } from "./_components/listing-list-card";
import { listings } from "@/lib/mock-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/src/components/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/src/components/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@repo/ui/src/components/input-group";
import { Search } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const formSchema = z.object({
  title: z
    .string()
    .min(5, "Bug title must be at least 5 characters.")
    .max(32, "Bug title must be at most 32 characters."),
});

const sortOptions = [
  { label: "Standard-Sortierung", value: "relevance" },
  { label: "Preis (niedrigster zuerst)", value: "price-asc" },
  { label: "Preis (höchster zuerst)", value: "price-desc" },
  { label: "Kilometerstand (niedrigster zuerst)", value: "mileage-asc" },
  { label: "Kilometerstand (höchster zuerst)", value: "mileage-desc" },
  { label: "Erstzulassung (älteste zuerst)", value: "registration-asc" },
  { label: "Erstzulassung (jüngste zuerst)", value: "registration-desc" },
  { label: "Inserate (älteste zuerst)", value: "created-asc" },
  { label: "Inserate (neueste zuerst)", value: "created-desc" },
];

export default function CarsPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    console.log(data);
  }

  return (
    <>
      <div className="bg-linear-to-r from-primary to-primary/80">
        <div className="w-full max-w-285 mx-auto py-12 px-4">
          <div className="text-center text-white space-y-4">
            <h1 className="text-2xl md:text-4xl font-bold">Fahrzeuge finden</h1>
            <p className="text-base md:text-lg max-w-3xl mx-auto">
              Entdecken Sie unser breites Angebot an Fahrzeugen
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-285 mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="hidden lg:block lg:col-span-1">
            <FiltersSidebar showActions={false} />
          </aside>

          <div className="lg:col-span-3 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{listings.length} Angebote</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                  <InputGroup>
                    <InputGroupInput placeholder="Search..." />
                    <InputGroupAddon>
                      <Search />
                    </InputGroupAddon>
                  </InputGroup>
                </form>

                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sortieren nach" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-6">
              {listings.map((item) => (
                <ListingListCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
