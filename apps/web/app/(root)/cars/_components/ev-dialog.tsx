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

function formatCount(n: number) {
  return new Intl.NumberFormat("de-CH").format(n);
}

export function EvDialog({ resultCount }: { resultCount?: number }) {
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
          <span className="text-primary font-medium hover:underline cursor-pointer">
            ändern
          </span>
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
              </div>

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
            </div>
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
