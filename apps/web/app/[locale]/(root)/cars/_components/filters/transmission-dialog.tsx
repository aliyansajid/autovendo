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
import { FieldGroup } from "@repo/ui/components/field";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/src/components/custom-form-field";
import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

const formSchema = z.object({
  transmission: z.array(z.string()),
});

export function TransmissionDialog({
  counts,
}: {
  counts?: Record<string, number>;
}) {
  const t = useTranslations("AdvancedSearch.FiltersSidebar.dialogs.transmission");
  const tCommon = useTranslations("AdvancedSearch.FiltersSidebar.dialogs");
  const tVehicle = useTranslations("Vehicle.transmissionTypes");
  const locale = useLocale();

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  function formatCount(n: number) {
    return new Intl.NumberFormat(locale === "de" ? "de-CH" : locale).format(n);
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transmission: searchParams.get("transmission")?.split(",") || [],
    },
  });

  // Sync form with URL
  useEffect(() => {
    form.reset({
      transmission: searchParams.get("transmission")?.split(",") || [],
    });
  }, [searchParams, form]);

  const [open, setOpen] = useState(false);

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (data.transmission.length > 0) {
      params.set("transmission", data.transmission.join(","));
    } else {
      params.delete("transmission");
    }
    params.delete("page");
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
    setOpen(false);
  };

  const transmissionOptions = [
    "MANUAL", "AUTOMATIC", "SEMI_AUTOMATIC"
  ].map((value) => {
    const count = counts?.[value];
    const label = tVehicle(value);
    return {
      label: count !== undefined ? `${label} (${formatCount(count)})` : label,
      value: value,
    };
  });

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
              fieldType={FormFieldType.CHECKBOX_GROUP}
              name="transmission"
              className="grid grid-cols-2 gap-3"
              options={transmissionOptions}
            />

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
