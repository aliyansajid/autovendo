import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { SelectItem } from "@repo/ui/components/select";
import { FieldGroup } from "@repo/ui/components/field";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/src/components/custom-form-field";
import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { formatNumber } from "@repo/ui/lib/helpers/format";

const formSchema = z.object({
  batteryCapacityFrom: z.string().optional(),
  batteryCapacityTo: z.string().optional(),
  rangeFrom: z.string().optional(),
  chargeTime: z.string().optional(),
  fastChargeTime: z.string().optional(),
});

export function EvDialog() {
  const t = useTranslations("AdvancedSearch.FiltersSidebar.dialogs.ev");
  const tCommon = useTranslations("AdvancedSearch.FiltersSidebar.dialogs");
  const tSidebar = useTranslations("AdvancedSearch.FiltersSidebar");

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const rangeOptions = [
    { value: "50", label: `${t("fromLabel")} 50 km` },
    { value: "100", label: `${t("fromLabel")} 100 km` },
    { value: "200", label: `${t("fromLabel")} 200 km` },
    { value: "300", label: `${t("fromLabel")} 300 km` },
    { value: "400", label: `${t("fromLabel")} 400 km` },
    { value: "500", label: `${t("fromLabel")} 500 km` },
    { value: "600", label: `${t("fromLabel")} 600 km +` },
  ];

  const batteryCapacityOptions = Array.from({ length: 15 }, (_, i) => {
    const val = (i + 1) * 10;
    const value = val.toString();
    return { value, label: `${formatNumber(val)} kWh` };
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      batteryCapacityFrom: searchParams.get("batteryCapacityFrom") || "",
      batteryCapacityTo: searchParams.get("batteryCapacityTo") || "",
      rangeFrom: searchParams.get("rangeFrom") || "",
      chargeTime: searchParams.get("chargeTime") || "",
      fastChargeTime: searchParams.get("fastChargeTime") || "",
    },
  });

  // Sync form with URL
  useEffect(() => {
    form.reset({
      batteryCapacityFrom: searchParams.get("batteryCapacityFrom") || "",
      batteryCapacityTo: searchParams.get("batteryCapacityTo") || "",
      rangeFrom: searchParams.get("rangeFrom") || "",
      chargeTime: searchParams.get("chargeTime") || "",
      fastChargeTime: searchParams.get("fastChargeTime") || "",
    });
  }, [searchParams, form]);

  const [open, setOpen] = useState(false);

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    const params = new URLSearchParams(searchParams.toString());

    if (data.batteryCapacityFrom && data.batteryCapacityFrom !== "any")
      params.set("batteryCapacityFrom", data.batteryCapacityFrom);
    else params.delete("batteryCapacityFrom");

    if (data.batteryCapacityTo && data.batteryCapacityTo !== "any")
      params.set("batteryCapacityTo", data.batteryCapacityTo);
    else params.delete("batteryCapacityTo");

    if (data.rangeFrom && data.rangeFrom !== "any")
      params.set("rangeFrom", data.rangeFrom);
    else params.delete("rangeFrom");

    if (data.chargeTime) params.set("chargeTime", data.chargeTime);
    else params.delete("chargeTime");

    if (data.fastChargeTime) params.set("fastChargeTime", data.fastChargeTime);
    else params.delete("fastChargeTime");

    params.delete("page");
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <span className="text-primary font-medium hover:underline cursor-pointer">
          {tCommon("change")}
        </span>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup>
            <DialogHeader>
              <DialogTitle>{t("title")}</DialogTitle>
              <DialogDescription>
                {t("description")}
              </DialogDescription>
            </DialogHeader>

            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.SELECT}
              name="rangeFrom"
              label={t("range")}
              placeholder={tSidebar("any")}
              className="w-full"
            >
              <SelectItem value="any">{tSidebar("any")}</SelectItem>
              {rangeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </CustomFormField>

            <div className="flex items-end gap-3">
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.SELECT}
                name="batteryCapacityFrom"
                label={t("batteryCapacity")}
                placeholder={tSidebar("from")}
                className="w-full"
              >
                <SelectItem value="any">{tSidebar("any")}</SelectItem>
                {batteryCapacityOptions.map((opt) => (
                  <SelectItem key={`from-${opt.value}`} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </CustomFormField>

              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.SELECT}
                name="batteryCapacityTo"
                placeholder={tSidebar("to")}
                className="w-full"
              >
                <SelectItem value="any">{tSidebar("any")}</SelectItem>
                {batteryCapacityOptions.map((opt) => (
                  <SelectItem key={`to-${opt.value}`} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </CustomFormField>
            </div>

            <div className="flex gap-3">
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT_GROUP}
                name="chargeTime"
                label={t("chargeTime")}
                placeholder={t("minutes")}
                inputGroupText="min"
              />

              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT_GROUP}
                name="fastChargeTime"
                label={t("fastChargeTime")}
                placeholder={t("minutes")}
                inputGroupText="min"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                {tCommon("cancel")}
              </Button>
              <Button type="submit">{tCommon("apply")}</Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
