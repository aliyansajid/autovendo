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
import { carFuelTypeEnum } from "@/constants/cars";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const formSchema = z.object({
  fuel: z.array(z.string()),
});

function formatCount(n: number) {
  return new Intl.NumberFormat("de-CH").format(n);
}

export function FuelTypeDialog({
  counts,
}: {
  counts?: Record<string, number>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fuel: searchParams.get("fuel")?.split(",") || [],
    },
  });

  // Sync form with URL
  useEffect(() => {
    form.reset({
      fuel: searchParams.get("fuel")?.split(",") || [],
    });
  }, [searchParams, form]);

  const [open, setOpen] = useState(false);

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (data.fuel.length > 0) {
      params.set("fuel", data.fuel.join(","));
    } else {
      params.delete("fuel");
    }
    // Reset to first page when filters change, but don't add page=1 to URL
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
          ändern
        </span>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup>
            <DialogHeader>
              <DialogTitle>Typ des Kraftstoffes</DialogTitle>
              <DialogDescription>
                Wählen Sie die gewünschten Kraftstofftypen aus.
              </DialogDescription>
            </DialogHeader>

            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.CHECKBOX_GROUP}
              name="fuel"
              className="grid grid-cols-2 gap-3"
              options={carFuelTypeEnum.map(
                (fuel: { value: string; label: string }) => {
                  const count = counts?.[fuel.value];
                  return {
                    label:
                      count !== undefined
                        ? `${fuel.label} (${formatCount(count)})`
                        : fuel.label,
                    value: fuel.value,
                  };
                },
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Abbrechen
              </Button>
              <Button type="submit">Anwenden</Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
