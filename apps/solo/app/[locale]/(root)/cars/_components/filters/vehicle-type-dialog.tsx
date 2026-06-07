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
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { carBodyTypeEnum } from "@repo/vehicle-constants";
import { formatCount } from "@repo/ui/lib/helpers/format";

const formSchema = z.object({
  bodyType: z.array(z.string()),
});

export function VehicleTypeDialog({
  counts,
}: {
  counts?: Record<string, number>;
}) {
  const t = useTranslations("AdvancedSearch.FiltersSidebar.dialogs.vehicleType");
  const tCommon = useTranslations("AdvancedSearch.FiltersSidebar.dialogs");
  const tVehicle = useTranslations("Vehicle");

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bodyType: searchParams.get("bodyType")?.split(",").filter(Boolean) || [],
    },
  });

  // Sync form with URL
  useEffect(() => {
    form.reset({
      bodyType: searchParams.get("bodyType")?.split(",").filter(Boolean) || [],
    });
  }, [searchParams, form]);

  const [open, setOpen] = useState(false);

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (data.bodyType.length > 0) {
      params.set("bodyType", data.bodyType.join(","));
    } else {
      params.delete("bodyType");
    }
    params.delete("page");
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
    setOpen(false);
  };

  const bodyTypeOptions = carBodyTypeEnum.map(({ value }) => {
    const count = counts?.[value];
    const label = tVehicle(`types.${value}`);
    return {
      label: count !== undefined ? `${label} (${formatCount(count)})` : label,
      value,
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
              name="bodyType"
              className="grid grid-cols-2 gap-3"
              options={bodyTypeOptions}
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
