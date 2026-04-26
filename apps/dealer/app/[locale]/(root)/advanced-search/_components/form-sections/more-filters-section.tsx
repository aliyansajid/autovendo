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
import { daysListedOptions } from "@/constants";
import { useTranslations } from "next-intl";

export function MoreFiltersSection() {
  const t = useTranslations("AdvancedSearch.sections.more");
  const { control, setValue } = useFormContext();

  const getOptionLabel = (value: string) => {
    switch (value) {
      case "any":
        return t("options.any");
      case "1 tag":
        return t("options.1-day");
      case "2 tage":
        return t("options.2-days");
      case "3 tage":
        return t("options.3-days");
      case "5 tage":
        return t("options.5-days");
      case "7 tage":
        return t("options.7-days");
      case "14 tage":
        return t("options.14-days");
      case "28 tage":
        return t("options.28-days");
      default:
        return value;
    }
  };

  return (
    <AccordionItem value="more" className="border-none">
      <AccordionTrigger className="flex items-center text-xl font-bold text-primary hover:no-underline">
        {t("title")}
      </AccordionTrigger>
      <AccordionContent className="pt-6 px-1">
        <div className="space-y-4">
          <div className="flex flex-col">
            <Label className="text-base font-semibold">{t("daysListed")}</Label>
            <span
              className="text-xs text-muted-foreground cursor-pointer hover:underline"
              onClick={() => setValue("daysListed", "any")}
            >
              {t("reset")}
            </span>
          </div>
          <CustomFormField
            control={control}
            fieldType={FormFieldType.RADIO_GROUP}
            name="daysListed"
            className="flex-col"
            options={daysListedOptions.map((o) => ({
              label: getOptionLabel(o.value),
              value: o.value,
            }))}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
