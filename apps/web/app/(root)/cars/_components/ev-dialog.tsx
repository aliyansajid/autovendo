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
import { SelectItem } from "@repo/ui/components/select";
import { FieldGroup } from "@repo/ui/components/field";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/src/components/custom-form-field";

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
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      batteryCapacityFrom: "",
      batteryCapacityTo: "",
      rangeFrom: "",
      chargeTime: "",
      fastChargeTime: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    console.log(data);
  }

  return (
    <Dialog>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <DialogTrigger asChild>
          <Button variant="link">ändern</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Elektrofahrzeug</DialogTitle>
            <DialogDescription>
              Filtern Sie nach Batteriekapazität, Reichweite und Ladezeit.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Reichweite</div>
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.SELECT}
                  name="rangeFrom"
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
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Batteriekapazität</div>
                <div className="flex gap-2">
                  <CustomFormField
                    control={form.control}
                    fieldType={FormFieldType.SELECT}
                    name="batteryCapacityFrom"
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
              </div>

              <div className="flex gap-2">
                <div className="w-1/2 space-y-2">
                  <div className="text-sm font-medium">Ladezeit (bis)</div>
                  <CustomFormField
                    control={form.control}
                    fieldType={FormFieldType.INPUT_GROUP}
                    name="chargeTime"
                    placeholder="Minuten"
                    inputGroupText="min"
                  />
                </div>

                <div className="w-1/2 space-y-2">
                  <div className="text-sm font-medium text-nowrap overflow-hidden text-ellipsis">
                    Schnellladezeit (bis)
                  </div>
                  <CustomFormField
                    control={form.control}
                    fieldType={FormFieldType.INPUT_GROUP}
                    name="fastChargeTime"
                    placeholder="Minuten"
                    inputGroupText="min"
                  />
                </div>
              </div>
            </div>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Abbrechen</Button>
            </DialogClose>
            <Button type="submit">1'409'625 Angebote</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
