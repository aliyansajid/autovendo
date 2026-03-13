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
import { TransmissionTypeEnum } from "@/constants";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect } from "react";

const formSchema = z.object({
  transmission: z.array(z.string()),
});

function formatCount(n: number) {
  return new Intl.NumberFormat("de-CH").format(n);
}

export function TransmissionDialog({
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
      transmission: searchParams.get("transmission")?.split(",") || [],
    },
  });

  // Sync form with URL
  useEffect(() => {
    form.reset({
      transmission: searchParams.get("transmission")?.split(",") || [],
    });
  }, [searchParams, form]);

  function onSubmit(data: z.infer<typeof formSchema>) {
    const params = new URLSearchParams(searchParams.toString());
    if (data.transmission.length > 0) {
      params.set("transmission", data.transmission.join(","));
    } else {
      params.delete("transmission");
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
            <DialogTitle>Typ der Getriebe</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.CHECKBOX_GROUP}
              name="transmission"
              className="grid grid-cols-2 gap-3"
              options={TransmissionTypeEnum.map((transmission) => {
                const key = transmission.value.toUpperCase().replace(/-/g, "_");
                const count = counts?.[key];
                return {
                  label:
                    count !== undefined
                      ? `${transmission.label} (${formatCount(count)})`
                      : transmission.label,
                  value: transmission.value,
                };
              })}
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
