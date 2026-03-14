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

const formSchema = z.object({
  powerFrom: z.string().optional(),
  powerTo: z.string().optional(),
  unit: z.enum(["hp", "kW"]),
});

export function PowerDialog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      powerFrom: searchParams.get("powerFrom") || "",
      powerTo: searchParams.get("powerTo") || "",
      unit: (searchParams.get("powerUnit") as "hp" | "kW") || "hp",
    },
  });

  // Sync form with URL
  useEffect(() => {
    form.reset({
      powerFrom: searchParams.get("powerFrom") || "",
      powerTo: searchParams.get("powerTo") || "",
      unit: (searchParams.get("powerUnit") as "hp" | "kW") || "hp",
    });
  }, [searchParams, form]);

  const selectedPowerUnit = form.watch("unit");

  const [open, setOpen] = useState(false);

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    const params = new URLSearchParams(searchParams.toString());

    if (data.powerFrom) params.set("powerFrom", data.powerFrom);
    else params.delete("powerFrom");

    if (data.powerTo) params.set("powerTo", data.powerTo);
    else params.delete("powerTo");

    params.set("powerUnit", data.unit);

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
              <DialogTitle>Leistung</DialogTitle>
              <DialogDescription>
                Geben Sie den gewünschten Leistungsbereich ein.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.RADIO_GROUP}
                wrapperClassName="w-fit"
                name="unit"
                options={[
                  {
                    label: "hp",
                    value: "hp",
                  },
                  {
                    label: "kW",
                    value: "kW",
                  },
                ]}
              />

              <div className="flex gap-3">
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT_GROUP}
                  inputType="number"
                  name="powerFrom"
                  placeholder="from"
                  inputGroupText={selectedPowerUnit}
                />
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT_GROUP}
                  inputType="number"
                  name="powerTo"
                  placeholder="to"
                  inputGroupText={selectedPowerUnit}
                />
              </div>
            </div>

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
