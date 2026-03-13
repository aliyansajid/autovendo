import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogClose,
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
import { useEffect } from "react";

const formSchema = z.object({
  fuel: z.array(z.string()),
});

function formatCount(n: number) {
  return new Intl.NumberFormat("de-CH").format(n);
}

export function FuelTypeDialog({
  resultCount,
  counts,
}: {
  resultCount?: number;
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

  function onSubmit(data: z.infer<typeof formSchema>) {
    const params = new URLSearchParams(searchParams.toString());
    if (data.fuel.length > 0) {
      params.set("fuel", data.fuel.join(","));
    } else {
      params.delete("fuel");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <Dialog>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <DialogTrigger asChild>
          <span className="text-primary font-medium hover:underline cursor-pointer">
            ändern
          </span>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Typ des Kraftstoffes</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.CHECKBOX_GROUP}
              name="fuel"
              className="grid grid-cols-2 gap-3"
              options={carFuelTypeEnum.map(
                (fuel: { value: string; label: string }) => ({
                  label:
                    counts?.[fuel.value.toUpperCase().replace(/-/g, "_")] !==
                    undefined
                      ? `${fuel.label} (${formatCount(counts[fuel.value.toUpperCase().replace(/-/g, "_")])})`
                      : fuel.label,
                  value: fuel.value,
                }),
              )}
            />
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Abbrechen</Button>
            </DialogClose>
            <Button type="submit">
              {resultCount !== undefined
                ? `${formatCount(resultCount)} Angebote`
                : "Anwenden"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
