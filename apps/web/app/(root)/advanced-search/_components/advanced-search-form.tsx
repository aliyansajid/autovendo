"use client";

import { useState } from "react";
import { Car, Truck, Caravan, X } from "lucide-react";
import { Button } from "@repo/ui/src/components/button";
import { Accordion } from "@repo/ui/src/components/accordion";
import { Separator } from "@repo/ui/src/components/separator";
import { z } from "zod";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { advancedSearchFormSchema } from "@/schema/advanced-search-schema";
import { MakeModelSection } from "./form-sections/make-model-section";
import { BasicDataSection } from "./form-sections/basic-data-section";
import { TechnicalDataSection } from "./form-sections/technical-data-section";
import { EquipmentSection } from "./form-sections/equipment-section";
import { ExtrasSection } from "./form-sections/extras-section";
import { AppearanceSection } from "./form-sections/appearance-section";
import { EnergySection } from "./form-sections/energy-section";
import { MoreFiltersSection } from "./form-sections/more-filters-section";

export const AdvancedSearchForm = () => {
  const form = useForm<z.infer<typeof advancedSearchFormSchema>>({
    resolver: zodResolver(advancedSearchFormSchema) as any,
    defaultValues: { powerType: "ps", daysListed: "any" },
  });

  const [vehicleType, setVehicleType] = useState("car");

  function onSubmit(data: z.infer<typeof advancedSearchFormSchema>) {
    console.log("Advanced Search Filters:", data);
  }

  return (
    <div className="w-full max-w-285 mx-auto px-4 py-12">
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex items-center justify-between pb-3 border-b">
            <h1 className="text-2xl font-bold">Filter</h1>
            <Button type="button" variant="ghost" onClick={() => form.reset()}>
              Schliessen <X />
            </Button>
          </div>

          <div className="flex overflow-x-auto gap-8 mb-8 pt-8 scrollbar-hide border-b">
            {[
              { id: "car", label: "Personenwagen", icon: Car },
              { id: "camper", label: "Wohnmobil", icon: Caravan },
              { id: "utility", label: "Nutzfahrzeug", icon: Truck },
              { id: "truck", label: "Lastwagen", icon: Truck },
            ].map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setVehicleType(type.id)}
                className={`flex items-center gap-3 pb-4 min-w-max transition-all ${
                  vehicleType === type.id
                    ? "text-foreground border-b-2 border-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <type.icon className="w-6 h-6" />
                <span className="text-base font-medium">{type.label}</span>
              </button>
            ))}
          </div>

          <Accordion
            type="multiple"
            defaultValue={[
              "make",
              "basic",
              "tech",
              "equipment",
              "extras",
              "appearance",
              "energy",
              "more",
            ]}
            className="w-full space-y-8"
          >
            <MakeModelSection />
            <Separator />
            <BasicDataSection vehicleType={vehicleType} />
            <Separator />
            <TechnicalDataSection vehicleType={vehicleType} />
            <Separator />
            <EquipmentSection />
            <Separator />
            <ExtrasSection vehicleType={vehicleType} />
            <Separator />
            <AppearanceSection />
            <Separator />
            <EnergySection />
            <Separator />
            <MoreFiltersSection />
          </Accordion>

          <div className="fixed bottom-0 left-0 right-0 py-4 px-4 md:px-0 bg-background flex justify-center items-center z-50 shadow-2xl border-t">
            <Button
              type="submit"
              size="lg"
              className="w-full max-w-xl bg-rating hover:bg-rating/90 text-black"
            >
              155&apos;927 Fahrzeuge anzeigen
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};
