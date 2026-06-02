"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Car, Truck, Caravan, X } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Accordion } from "@repo/ui/components/accordion";
import { Separator } from "@repo/ui/components/separator";
import { z } from "zod";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "@/i18n/routing";
import { createAdvancedSearchFormSchema } from "@/schema/advanced-search-schema";
import { MakeModelSection } from "./form-sections/make-model-section";
import { BasicDataSection } from "./form-sections/basic-data-section";
import { TechnicalDataSection } from "./form-sections/technical-data-section";
import { EquipmentSection } from "./form-sections/equipment-section";
import { ExtrasSection } from "./form-sections/extras-section";
import { AppearanceSection } from "./form-sections/appearance-section";
import { EnergySection } from "./form-sections/energy-section";
import { MoreFiltersSection } from "./form-sections/more-filters-section";
import { buildSearchParams } from "../_lib/build-search-params";
import { getVehicleFacetsFromApi } from "@/lib/api/vehicles";
import type { VehicleFacets } from "@/types/vehicle";
import { formatCount } from "@repo/ui/lib/helpers/format";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

function paramsToQueryString(
  params: Record<string, string | string[]>,
): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      value.forEach((v) => sp.append(key, String(v)));
    } else {
      sp.set(key, String(value));
    }
  }
  return sp.toString();
}

export const AdvancedSearchForm = () => {
  const t = useTranslations("AdvancedSearch");
  const t_schema = useTranslations("AdvancedSearchSchema");
  const schema = useMemo(() => createAdvancedSearchFormSchema(t_schema), [t_schema]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const dealerId = searchParams.get("dealer");

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema) as any,
    defaultValues: { make: [], powerType: "ps", daysListed: "any" },
  });

  const [vehicleType, setVehicleType] = useState("CAR");
  const [total, setTotal] = useState<number | null>(null);
  const [facets, setFacets] = useState<VehicleFacets | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevVehicleTypeRef = useRef(vehicleType);

  useEffect(() => {
    // If vehicleType changed, reset form filters to avoid contradictory filters
    if (prevVehicleTypeRef.current !== vehicleType) {
      prevVehicleTypeRef.current = vehicleType;
      form.reset({ make: [], powerType: "ps", daysListed: "any" });
    }

    // Fetch immediately on mount and whenever vehicleType changes
    const params = {
      ...buildSearchParams(
        form.getValues() as Record<string, unknown>,
        vehicleType,
      ),
      ...(dealerId ? { dealerId } : {}),
    };

    getVehicleFacetsFromApi(params)
      .then(({ total: t, facets: f }) => {
        setTotal(t);
        setFacets(f);
      })
      .catch(() => {
        setTotal(null);
        setFacets(null);
      });

    const subscription = form.watch((values) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const params = {
          ...buildSearchParams(values as Record<string, unknown>, vehicleType),
          ...(dealerId ? { dealerId } : {}),
        };
        getVehicleFacetsFromApi(params)
          .then(({ total: t, facets: f }) => {
            setTotal(t);
            setFacets(f);
          })
          .catch(() => {
            setTotal(null);
            setFacets(null);
          });
      }, 300);
    });

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      subscription.unsubscribe();
    };
  }, [form, vehicleType, dealerId]);

  function onSubmit(data: z.infer<typeof schema>) {
    const params = buildSearchParams(
      data as Record<string, unknown>,
      vehicleType,
    );
    const query = paramsToQueryString(params);

    if (dealerId) {
      router.push(`/dealers/${dealerId}?tab=cars&${query}`);
    } else {
      router.push(query ? `/cars?${query}` : "/cars");
    }
  }

  return (
    <div className="w-full max-w-285 mx-auto px-4 py-12">
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex items-center justify-between pb-3 border-b">
            <h1 className="text-2xl font-bold">{t("title")}</h1>
            <Button type="button" variant="ghost" onClick={() => form.reset()}>
              {t("close")} <X />
            </Button>
          </div>

          <div className="flex overflow-x-auto gap-8 mb-8 pt-8 scrollbar-hide border-b">
            {[
              { id: "CAR", label: t("vehicleTypes.car"), icon: Car },
              { id: "CAMPER", label: t("vehicleTypes.camper"), icon: Caravan },
              { id: "UTILITY", label: t("vehicleTypes.utility"), icon: Truck },
              { id: "TRUCK", label: t("vehicleTypes.truck"), icon: Truck },
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
            <BasicDataSection vehicleType={vehicleType} facets={facets} />
            <Separator />
            <TechnicalDataSection vehicleType={vehicleType} facets={facets} />
            <Separator />
            <EquipmentSection />
            <Separator />
            <ExtrasSection vehicleType={vehicleType} />
            <Separator />
            <AppearanceSection facets={facets} />
            <Separator />
            <EnergySection facets={facets} />
            <Separator />
            <MoreFiltersSection />
          </Accordion>

          <div className="fixed bottom-0 left-0 right-0 py-4 px-4 md:px-0 bg-background flex justify-center items-center z-50 shadow-2xl border-t">
            <Button
              type="submit"
              size="lg"
              className="w-full max-w-xl bg-rating hover:bg-rating/90 text-black"
            >
              {total != null
                ? t("showVehicles", { count: total })
                : t("showVehiclesSimple")}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};
