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

export function AppearanceSection() {
  const { control } = useFormContext();

  return (
    <AccordionItem value="appearance" className="border-none">
      <AccordionTrigger className="flex items-center text-xl font-bold text-primary hover:no-underline">
        Farbe
      </AccordionTrigger>
      <AccordionContent className="pt-6 space-y-12">
        <div className="space-y-4">
          <div className="flex flex-col">
            <Label className="text-base font-semibold">Aussenfarbe</Label>
            <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
              Zurücksetzen
            </span>
          </div>

          <div className="flex items-center">
            <CustomFormField
              control={control}
              fieldType={FormFieldType.CHECKBOX}
              name="metallic"
              label="Metallic"
            />
            <span className="text-sm text-muted-foreground">86&apos;371</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-3">
            {ColorEnum.map((color) => (
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
                      {color.label}
                    </span>
                  }
                />
                <span className="text-sm text-muted-foreground">
                  {Math.floor(Math.random() * 50000).toLocaleString("de-CH")}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex flex-col">
            <Label className="text-base font-semibold">Innenfarbe</Label>
            <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
              Zurücksetzen
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-12">
            {ColorEnum.map((color) => (
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
                      {color.label}
                    </span>
                  }
                />
                <span className="text-sm text-muted-foreground">
                  {Math.floor(Math.random() * 50000).toLocaleString("de-CH")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
