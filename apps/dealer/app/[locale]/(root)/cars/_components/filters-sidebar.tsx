"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "@/i18n/routing";
import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useEffect, useCallback } from "react";
import { Check } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/components/custom-form-field";
import { SelectItem } from "@repo/ui/components/select";
import {
  PRICING_OPTIONS,
  POWER_OPTIONS,
  getRegistrationYears,
  KILOMETER_OPTIONS,
  COLOR_OPTIONS,
  EQUIPMENT_LABELS,
} from "@/lib/constants/vehicle-constants";
import { carMakes } from "@repo/vehicle-constants";
import { FieldGroup, FieldLabel } from "@repo/ui/components/field";
import { Separator } from "@repo/ui/components/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { ConditionDialog } from "./filters/condition-dialog";
import { FuelTypeDialog } from "./filters/fuel-type-dialog";
import { VehicleTypeDialog } from "./filters/vehicle-type-dialog";
import { TransmissionDialog } from "./filters/transmission-dialog";
import { PowerDialog } from "./filters/power-dialog";
import { EvDialog } from "./filters/ev-dialog";
import { MakeModelDialog } from "./filters/make-model-dialog";
import type { VehicleFacets } from "@/types/vehicle";
import { createVehicleFiltersSchema } from "@/schema/vehicle-filters-schema";
import { useTranslations, useLocale } from "next-intl";
import { formatKilometers } from "@repo/ui/lib/helpers/format";
import { useMemo } from "react";

export const FiltersSidebar = ({
  onClose,
  showActions = true,
  resultCount,
  facets,
}: {
  onClose?: () => void;
  showActions?: boolean;
  resultCount?: number;
  facets?: VehicleFacets;
}) => {
  const t = useTranslations("AdvancedSearch.FiltersSidebar");
  const tVehicle = useTranslations("Vehicle");
  const locale = useLocale();

  const t_schema = useTranslations("VehicleSchema");
  const schema = useMemo(
    () => createVehicleFiltersSchema(t_schema),
    [t_schema],
  );
  type Values = z.infer<typeof schema>;

  // Use variables to avoid lint warnings if passed but unused
  void onClose;
  void showActions;
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const getInitialValues = useCallback(() => {
    const params = Object.fromEntries(searchParams.entries());
    const parseArray = (key: string) => params[key]?.split(",") || [];

    const equipmentFromParams: Record<string, boolean> = {};
    const equipmentArray = params.equipment?.split(",") || [];
    equipmentArray.forEach((key) => {
      equipmentFromParams[key] = true;
    });

    return {
      priceFrom: params.priceFrom || "any",
      priceTo: params.priceTo || "any",
      registrationFrom: params.registrationFrom || "any",
      registrationTo: params.registrationTo || "any",
      kilometerFrom: params.kilometerFrom || "any",
      kilometerTo: params.kilometerTo || "any",
      condition: parseArray("condition"),
      make: parseArray("make"),
      fuel: parseArray("fuel"),
      power: parseArray("power"),
      vehicleType: parseArray("vehicleType"),
      bodyType: parseArray("bodyType"),
      evs: parseArray("evs"),
      transmission: parseArray("transmission"),
      color: parseArray("color"),
      ...equipmentFromParams,
    };
  }, [searchParams]);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: getInitialValues(),
  });

  // Sync form with URL changes (handle back/forward navigation)
  useEffect(() => {
    form.reset(getInitialValues());
  }, [searchParams, getInitialValues, form]);

  // Handle URL updates
  const updateUrl = useCallback(
    (values: Values) => {
      const params = new URLSearchParams(window.location.search);

      const equipment: string[] = [];

      Object.entries(values).forEach(([key, value]) => {
        // Handle equipment (individual checkbox keys)
        if (key in EQUIPMENT_LABELS) {
          if (value === true) equipment.push(key);
          return;
        }

        // Handle other fields
        if (Array.isArray(value)) {
          if (value.length > 0) {
            params.set(key, value.join(","));
          } else {
            params.delete(key);
          }
        } else if (
          value !== undefined &&
          value !== null &&
          value !== "any" &&
          value !== ""
        ) {
          params.set(key, value.toString());
        } else if (key !== "page" && key !== "sort" && key !== "search") {
          params.delete(key);
        }
      });

      if (equipment.length > 0) {
        params.set("equipment", equipment.join(","));
      } else {
        params.delete("equipment");
      }

      // Reset to page 1 on filter change, but don't add page=1 to URL
      params.delete("page");
      const newSearch = params.toString();
      const currentSearch = window.location.search.replace(/^\?/, "");

      if (newSearch !== currentSearch) {
        router.push(newSearch ? `${pathname}?${newSearch}` : pathname, {
          scroll: false,
        });
      }
    },
    [pathname, router],
  );

  // Watch for changes and update URL
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const subscription = form.watch((values) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        updateUrl(values);
      }, 500);
    });
    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [form, updateUrl]);

  const watchCondition = useWatch({ control: form.control, name: "condition" });
  const watchMake = useWatch({ control: form.control, name: "make" });
  const watchFuel = useWatch({ control: form.control, name: "fuel" });
  const watchPower = useWatch({ control: form.control, name: "power" });
  // const watchVehicleType = useWatch({
  //   control: form.control,
  //   name: "vehicleType",
  // });
  const watchBodyType = useWatch({ control: form.control, name: "bodyType" });
  const watchEvs = useWatch({ control: form.control, name: "evs" });
  const watchTransmission = useWatch({
    control: form.control,
    name: "transmission",
  });
  const watchColor = useWatch({ control: form.control, name: "color" }) || [];

  const handleColorToggle = (colorValue: string) => {
    const current = form.getValues("color") || [];
    if (current.includes(colorValue)) {
      form.setValue(
        "color",
        (current as string[]).filter((c: string) => c !== colorValue),
      );
    } else {
      form.setValue("color", [...(current as string[]), colorValue]);
    }
  };

  const allMakeOptions: { value: string; label: string }[] = carMakes.flatMap(
    (g) => [...g.items],
  );

  const renderSelectedText = (
    arr: string[] | undefined,
    options: readonly { value: string; label: string }[],
  ) => {
    if (!arr || arr.length === 0) return t("any");
    if (arr.length === 1) {
      return options.find((o) => o.value === arr[0])?.label || arr[0];
    }
    return t("selected", { count: arr.length });
  };

  return (
    <Card>
      <CardHeader className="border-b gap-0">
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          <FieldGroup className="gap-6">
            <Button asChild variant="outline">
              <Link href="/advanced-search">{t("moreFilters")}</Link>
            </Button>

            <Separator />

            <div className="space-y-3">
              <FieldLabel>{t("condition")}</FieldLabel>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                {renderSelectedText(watchCondition, [
                  { value: "new", label: tVehicle("conditions.NEW") },
                  {
                    value: "demonstration",
                    label: tVehicle("conditions.DEMONSTRATION"),
                  },
                  {
                    value: "pre-registered",
                    label: tVehicle("conditions.PRE_REGISTERED"),
                  },
                  { value: "used", label: tVehicle("conditions.USED") },
                  { value: "oldtimer", label: tVehicle("conditions.OLDTIMER") },
                ])}
                <ConditionDialog resultCount={resultCount} />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <FieldLabel>{t("makeModel")}</FieldLabel>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                {renderSelectedText(watchMake, allMakeOptions)}
                <MakeModelDialog makeCounts={facets?.make} />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <FieldLabel>{t("price")}</FieldLabel>
              <div className="flex flex-col gap-2">
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.SELECT}
                  name="priceFrom"
                  placeholder={t("from")}
                >
                  <SelectItem value="any">{t("any")}</SelectItem>
                  {PRICING_OPTIONS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </CustomFormField>
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.SELECT}
                  name="priceTo"
                  placeholder={t("to")}
                >
                  <SelectItem value="any">{t("any")}</SelectItem>
                  {PRICING_OPTIONS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </CustomFormField>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <FieldLabel>{t("registration")}</FieldLabel>
              <div className="flex gap-2">
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.SELECT}
                  name="registrationFrom"
                  placeholder={t("from")}
                >
                  <SelectItem value="any">{t("any")}</SelectItem>
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
                  placeholder={t("to")}
                >
                  <SelectItem value="any">{t("any")}</SelectItem>
                  {getRegistrationYears().map((y) => (
                    <SelectItem key={y.value} value={y.value}>
                      {y.label}
                    </SelectItem>
                  ))}
                </CustomFormField>
              </div>
            </div>

            <div className="space-y-3">
              <FieldLabel>{t("mileage")}</FieldLabel>
              <div className="flex flex-col gap-2">
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.SELECT}
                  name="kilometerFrom"
                  placeholder={t("from")}
                >
                  <SelectItem value="any">{t("any")}</SelectItem>
                  {KILOMETER_OPTIONS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {formatKilometers(Number(m.value))}
                    </SelectItem>
                  ))}
                </CustomFormField>
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.SELECT}
                  name="kilometerTo"
                  placeholder={t("to")}
                >
                  <SelectItem value="any">{t("any")}</SelectItem>
                  {KILOMETER_OPTIONS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {formatKilometers(Number(m.value))}
                    </SelectItem>
                  ))}
                </CustomFormField>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <FieldLabel>{t("fuel")}</FieldLabel>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                {renderSelectedText(
                  watchFuel,
                  [
                    "PETROL",
                    "DIESEL",
                    "ELECTRIC",
                    "HYBRID",
                    "GAS",
                    "HYDROGEN",
                    "OTHER",
                  ].map((v) => ({
                    value: v,
                    label: tVehicle(`fuelTypes.${v}`),
                  })),
                )}
                <FuelTypeDialog counts={facets?.fuelType} />
              </div>
            </div>

            <div className="space-y-3">
              <FieldLabel>{t("power")}</FieldLabel>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                {renderSelectedText(
                  watchPower,
                  POWER_OPTIONS.map((o) => ({
                    value: o.value,
                    label: t("from") + " " + o.label.replace("ab ", ""),
                  })),
                )}
                <PowerDialog />
              </div>
            </div>

            <div className="space-y-3">
              <FieldLabel>{t("vehicleType")}</FieldLabel>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                {renderSelectedText(
                  watchBodyType,
                  [
                    "bus",
                    "cabriolet",
                    "coupe",
                    "small-car",
                    "estate",
                    "minivan",
                    "saloon",
                    "pickup",
                    "suv",
                  ].map((v) => ({
                    value: v,
                    label: tVehicle(
                      `types.${v.toUpperCase().replace(/-/g, "_")}`,
                    ),
                  })),
                )}
                <VehicleTypeDialog counts={facets?.bodyType} />
              </div>
            </div>

            <div className="space-y-3">
              <FieldLabel>{t("evs")}</FieldLabel>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                {renderSelectedText(watchEvs, [
                  { value: "only_ev", label: t("evOptions.only_ev") },
                  { value: "no_ev", label: t("evOptions.no_ev") },
                ])}
                <EvDialog />
              </div>
            </div>

            <div className="space-y-3">
              <FieldLabel>{t("transmission")}</FieldLabel>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                {renderSelectedText(
                  watchTransmission,
                  ["MANUAL", "AUTOMATIC", "SEMI_AUTOMATIC"].map((v) => ({
                    value: v,
                    label: tVehicle(`transmissionTypes.${v}`),
                  })),
                )}
                <TransmissionDialog counts={facets?.transmissionType} />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <FieldLabel>{t("exteriorColor")}</FieldLabel>
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.CHECKBOX}
                name="metallic"
                label={t("metallic")}
              />
              <div className="flex flex-wrap gap-1">
                {COLOR_OPTIONS.map((color) => {
                  const isSelected = watchColor.includes(color.value);
                  const colorLabel = tVehicle(
                    `colors.${color.value.toUpperCase()}`,
                  );
                  return (
                    <div
                      key={color.value}
                      className={`w-8 h-8 rounded-md cursor-pointer border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? "border-primary scale-110 shadow-md"
                          : "border-border hover:border-muted-foreground/30"
                      }`}
                      title={colorLabel}
                      onClick={() => handleColorToggle(color.value)}
                      style={{
                        background:
                          "gradient" in color ? color.gradient : color.hex,
                      }}
                    >
                      {isSelected && (
                        <Check
                          className={`h-5 w-5 ${
                            color.value === "white" ||
                            color.value === "yellow" ||
                            color.value === "beige" ||
                            color.value === "silver"
                              ? "text-black"
                              : "text-white"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <FieldLabel>{t("equipment")}</FieldLabel>
              <div className="space-y-3">
                {Object.keys(EQUIPMENT_LABELS)
                  .slice(0, 10)
                  .map((value) => (
                    <CustomFormField
                      key={value}
                      control={form.control}
                      fieldType={FormFieldType.CHECKBOX}
                      name={value}
                      label={tVehicle(
                        `equipment.${value.toUpperCase().replace(/-/g, "_")}`,
                      )}
                    />
                  ))}
              </div>
              <Link
                href={"/advanced-search"}
                className="text-primary cursor-pointer text-sm font-medium hover:underline"
              >
                {t("more")}
              </Link>
            </div>
          </FieldGroup>
        </div>
      </CardContent>
    </Card>
  );
};
