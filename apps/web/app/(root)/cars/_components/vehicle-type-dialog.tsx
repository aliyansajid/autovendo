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
import { carBodyTypeEnum } from "@/constants/cars";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect } from "react";

const formSchema = z.object({
  vehicleType: z.array(z.string()),
});

function formatCount(n: number) {
  return new Intl.NumberFormat("de-CH").format(n);
}

export function VehicleTypeDialog({
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
      vehicleType: searchParams.get("vehicleType")?.split(",") || [],
    },
  });

  // Sync form with URL
  useEffect(() => {
    form.reset({
      vehicleType: searchParams.get("vehicleType")?.split(",") || [],
    });
  }, [searchParams, form]);

  function onSubmit(data: z.infer<typeof formSchema>) {
    const params = new URLSearchParams(searchParams.toString());
    if (data.vehicleType.length > 0) {
      params.set("vehicleType", data.vehicleType.join(","));
    } else {
      params.delete("vehicleType");
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
            <DialogTitle>Typ des Fahrzeugs</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.CHECKBOX_GROUP}
              name="vehicleType"
              className="grid grid-cols-2 gap-3"
              options={carBodyTypeEnum.map(
                (body: { value: string; label: string }) => {
                  const key = body.value.trim().toUpperCase();
                  const count = counts?.[key];
                  return {
                    label:
                      count !== undefined
                        ? `${body.label} (${formatCount(count)})`
                        : body.label,
                    value: body.value,
                  };
                },
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
