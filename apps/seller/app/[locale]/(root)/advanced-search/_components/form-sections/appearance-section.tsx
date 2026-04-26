"use client";

import { useFormContext } from "react-hook-form";
import { Label } from "@repo/ui/src/components/label";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/src/components/accordion";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/src/components/custom-form-field";
import { ColorEnum } from "@/constants";
import { Separator } from "@repo/ui/src/components/separator";
import type { VehicleFacets } from "@/types/vehicle";
import { formatCount } from "@/lib/helpers/format";
import { useTranslations } from "next-intl";

export function AppearanceSection({
  facets,
}: {
  facets?: VehicleFacets | null;
}) {
  const t = useTranslations("AdvancedSearch.sections.appearance");
  const tColors = useTranslations("Vehicle.colors");
  const { control, setValue } = useFormContext();

  return (
    <AccordionItem value="appearance" className="border-none">
      <AccordionTrigger className="flex items-center text-xl font-bold text-primary hover:no-underline">
        {t("title")}
      </AccordionTrigger>
      <AccordionContent className="pt-6 px-1 space-y-12">
        <div className="space-y-4">
          <div className="flex flex-col">
            <Label className="text-base font-semibold">{t("exteriorColor")}</Label>
            <span
              className="text-xs text-muted-foreground cursor-pointer hover:underline"
              onClick={() => {
                setValue("metallic", false);
                ColorEnum.forEach((c) => setValue(`color-${c.value}`, false));
              }}
            >
              {t("reset")}
            </span>
          </div>

          <div className="flex items-center">
            <CustomFormField
              control={control}
              fieldType={FormFieldType.CHECKBOX}
              name="metallic"
              label={t("metallic")}
            />
            <span className="text-sm text-muted-foreground">
              {formatCount(facets?.metallic ?? 0)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-3">
            {ColorEnum.map((color) => {
              const count = facets?.color?.[color.value];
              return (
                <div
                  key={color.value}
                  className="flex items-center justify-between"
                >
                  <CustomFormField
                    control={control}
                    fieldType={FormFieldType.CHECKBOX}
                    name={`color-${color.value}`}
                    label={
                      <span className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full border border-border/20 ${"border" in color && color.border ? "border-border" : ""}`}
                          style={{
                            background:
                              "gradient" in color ? color.gradient : color.hex,
                          }}
                        />
                        {tColors(color.value.toUpperCase())}
                      </span>
                    }
                  />
                  <span className="text-sm text-muted-foreground">
                    {formatCount(count ?? 0)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex flex-col">
            <Label className="text-base font-semibold">{t("interiorColor")}</Label>
            <span
              className="text-xs text-muted-foreground cursor-pointer hover:underline"
              onClick={() =>
                ColorEnum.forEach((c) => setValue(`int-${c.value}`, false))
              }
            >
              {t("reset")}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-12">
            {ColorEnum.map((color) => {
              const count = facets?.interiorColor?.[color.value];
              return (
                <div
                  key={color.value}
                  className="flex items-center justify-between"
                >
                  <CustomFormField
                    control={control}
                    fieldType={FormFieldType.CHECKBOX}
                    name={`int-${color.value}`}
                    label={
                      <span className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full border border-border/20 ${"border" in color && color.border ? "border-border" : ""}`}
                          style={{
                            background:
                              "gradient" in color ? color.gradient : color.hex,
                          }}
                        />
                        {tColors(color.value.toUpperCase())}
                      </span>
                    }
                  />
                  <span className="text-sm text-muted-foreground">
                    {formatCount(count ?? 0)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
