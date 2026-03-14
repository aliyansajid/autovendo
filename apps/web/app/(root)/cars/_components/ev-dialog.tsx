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
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const formSchema = z.object({
  batteryCapacityFrom: z.string().optional(),
  batteryCapacityTo: z.string().optional(),
  rangeFrom: z.string().optional(),
  chargeTime: z.string().optional(),
  fastChargeTime: z.string().optional(),
});

const rangeOptions = [
  { value: "50", label: "ab 50 km" },
  { value: "100", label: "ab 100 km" },
  { value: "200", label: "ab 200 km" },
  { value: "300", label: "ab 300 km" },
  { value: "400", label: "ab 400 km" },
  { value: "500", label: "ab 500 km" },
  { value: "600", label: "ab 600 km +" },
];

const batteryCapacityOptions = Array.from({ length: 15 }, (_, i) => {
  const value = ((i + 1) * 10).toString();
  return { value, label: `${value} kWh` };
});

export function EvDialog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

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
          ändern
        </span>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup>
            <DialogHeader>
              <DialogTitle>Elektrofahrzeug</DialogTitle>
              <DialogDescription>
                Filtern Sie nach Batteriekapazität, Reichweite und Ladezeit.
              </DialogDescription>
            </DialogHeader>

            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.SELECT}
              name="rangeFrom"
              label="Reichweite"
              placeholder="Beliebig"
              className="w-full"
            >
              <SelectItem value="any">Beliebig</SelectItem>
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
                label="Batteriekapazität"
                placeholder="von"
                className="w-full"
              >
                <SelectItem value="any">Beliebig</SelectItem>
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
                placeholder="bis"
                className="w-full"
              >
                <SelectItem value="any">Beliebig</SelectItem>
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
                label="Ladezeit (bis)"
                placeholder="Minuten"
                inputGroupText="min"
              />

              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT_GROUP}
                name="fastChargeTime"
                label="Schnellladezeit (bis)"
                placeholder="Minuten"
                inputGroupText="min"
              />
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
