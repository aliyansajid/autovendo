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
import { useRouter } from "@/i18n/routing";
import { usePathname } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const formSchema = z.object({
  condition: z.array(z.string()),
});

export function ConditionDialog({ resultCount }: { resultCount?: number }) {
  void resultCount;
  const t = useTranslations("AdvancedSearch.FiltersSidebar.dialogs.condition");
  const tCommon = useTranslations("AdvancedSearch.FiltersSidebar.dialogs");
  const tVehicle = useTranslations("Vehicle.conditions");

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      condition: searchParams.get("condition")?.split(",") || [],
    },
  });

  // Sync form with URL changes
  useEffect(() => {
    form.reset({
      condition: searchParams.get("condition")?.split(",") || [],
    });
  }, [searchParams, form]);

  const [open, setOpen] = useState(false);

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (data.condition.length > 0) {
      params.set("condition", data.condition.join(","));
    } else {
      params.delete("condition");
    }
    params.delete("page");
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
    setOpen(false);
  };

  const conditionOptions = [
    { value: "NEW", label: tVehicle("NEW") },
    { value: "DEMONSTRATION", label: tVehicle("DEMONSTRATION") },
    { value: "PRE_REGISTERED", label: tVehicle("PRE_REGISTERED") },
    { value: "USED", label: tVehicle("USED") },
    { value: "OLDTIMER", label: tVehicle("OLDTIMER") },
  ];

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
              <DialogDescription>{t("description")}</DialogDescription>
            </DialogHeader>

            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.CHECKBOX_GROUP}
              name="condition"
              className="grid grid-cols-2 gap-3"
              options={conditionOptions}
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
