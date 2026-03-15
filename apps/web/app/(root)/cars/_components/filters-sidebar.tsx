"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useCallback } from "react";
import { Check } from "lucide-react";
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
  TransmissionTypeEnum,
  prices,
  powerOptions,
  evOptions,
} from "@/constants";
import {
  carBodyTypeEnum,
  carFuelTypeEnum,
  carMakes,
} from "@/constants/cars";
import { FieldGroup, FieldLabel } from "@repo/ui/components/field";
import { Separator } from "@repo/ui/components/separator";
import { getRegistrationYears, kilometers } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/src/components/card";
import { ConditionDialog } from "./filters/condition-dialog";
import { FuelTypeDialog } from "./filters/fuel-type-dialog";
import { VehicleTypeDialog } from "./filters/vehicle-type-dialog";
import { TransmissionDialog } from "./filters/transmission-dialog";
import { PowerDialog } from "./filters/power-dialog";
import { EvDialog } from "./filters/ev-dialog";
import { MakeModelDialog } from "./filters/make-model-dialog";
import type { VehicleFacets } from "@/lib/schemas/vehicle.schema";

const formSchema = z.object({
  priceFrom: z.string().optional(),
  priceTo: z.string().optional(),
  registrationFrom: z.string().optional(),
  registrationTo: z.string().optional(),
  kilometerFrom: z.string().optional(),
  kilometerTo: z.string().optional(),
  condition: z.array(z.string()).optional(),
  make: z.array(z.string()).optional(),
  fuel: z.array(z.string()).optional(),
  power: z.array(z.string()).optional(),
  vehicleType: z.array(z.string()).optional(),
  bodyType: z.array(z.string()).optional(),
  evs: z.array(z.string()).optional(),
  transmission: z.array(z.string()).optional(),
  color: z.array(z.string()).optional(),
});

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

  const form = useForm<z.infer<typeof formSchema> & Record<string, any>>({
    resolver: zodResolver(formSchema),
    defaultValues: getInitialValues(),
  });

  // Sync form with URL changes (handle back/forward navigation)
  useEffect(() => {
    form.reset(getInitialValues());
  }, [searchParams, getInitialValues, form]);

  // Handle URL updates
  const updateUrl = useCallback(
    (values: Record<string, any>) => {
      const params = new URLSearchParams(window.location.search);

      const equipment: string[] = [];

      Object.entries(values).forEach(([key, value]) => {
        // Handle equipment (individual checkbox keys)
        if (EquipmentEnum.some((e) => e.value === key)) {
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
    const subscription = form.watch((values: any) => {
      const timer = setTimeout(() => {
        updateUrl(values);
      }, 500);
      return () => clearTimeout(timer);
    });
    return () => subscription.unsubscribe();
  }, [form, updateUrl]);

  const watchCondition = form.watch("condition");
  const watchMake = form.watch("make");
  const watchFuel = form.watch("fuel");
  const watchPower = form.watch("power");
  const watchVehicleType = form.watch("vehicleType");
  const watchBodyType = form.watch("bodyType");
  const watchEvs = form.watch("evs");
  const watchTransmission = form.watch("transmission");
  const watchColor = form.watch("color") || [];

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
        <div className="flex flex-col">
          <FieldGroup className="gap-6">
            <Button asChild variant="outline">
              <Link href="/advanced-search">Mehr Filter</Link>
            </Button>

            <Separator />

            <div className="space-y-3">
              <FieldLabel>Fahrzeugzustand</FieldLabel>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                {renderSelectedText(watchCondition, VehicleConditionEnum)}
                <ConditionDialog resultCount={resultCount} />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <FieldLabel>Marke, Modell</FieldLabel>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                {renderSelectedText(watchMake, allMakeOptions)}
                <MakeModelDialog makeCounts={facets?.make} />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <FieldLabel>Preis</FieldLabel>
              <div className="flex flex-col gap-2">
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
              <div className="flex flex-col gap-2">
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.SELECT}
                  name="kilometerFrom"
                  placeholder="von"
                >
                  <SelectItem value="any">Beliebig</SelectItem>
                  {kilometers.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </CustomFormField>
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.SELECT}
                  name="kilometerTo"
                  placeholder="bis"
                >
                  <SelectItem value="any">Beliebig</SelectItem>
                  {kilometers.map((m) => (
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
                {renderSelectedText(watchFuel, carFuelTypeEnum)}
                <FuelTypeDialog counts={facets?.fuelType} />
              </div>
            </div>

            <div className="space-y-3">
              <FieldLabel>Leistung</FieldLabel>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                {renderSelectedText(watchPower, powerOptions)}
                <PowerDialog />
              </div>
            </div>

            <div className="space-y-3">
              <FieldLabel>Fahrzeugtyp</FieldLabel>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                {renderSelectedText(watchBodyType, carBodyTypeEnum)}
                <VehicleTypeDialog counts={facets?.bodyType} />
              </div>
            </div>

            <div className="space-y-3">
              <FieldLabel>E-Autos</FieldLabel>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                {renderSelectedText(watchEvs, evOptions)}
                <EvDialog />
              </div>
            </div>

            <div className="space-y-3">
              <FieldLabel>Getriebe</FieldLabel>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                {renderSelectedText(watchTransmission, TransmissionTypeEnum)}
                <TransmissionDialog counts={facets?.transmissionType} />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <FieldLabel>Außenfarbe</FieldLabel>
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.CHECKBOX}
                name="metallic"
                label="Metallic"
              />
              <div className="flex flex-wrap gap-1">
                {ColorEnum.map((color) => {
                  const isSelected = watchColor.includes(color.value);
                  return (
                    <div
                      key={color.value}
                      className={`w-8 h-8 rounded-md cursor-pointer border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? "border-primary scale-110 shadow-md"
                          : "border-border hover:border-muted-foreground/30"
                      }`}
                      title={color.label}
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
                href={"/advanced-search"}
                className="text-primary cursor-pointer text-sm font-medium hover:underline"
              >
                Mehr...
              </Link>
            </div>
          </FieldGroup>
        </div>
      </CardContent>
    </Card>
  );
};
