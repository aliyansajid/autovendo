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

const formSchema = z.object({
  power: z.string(),
  powerFrom: z.string().optional(),
  powerTo: z.string().optional(),
});

export function PowerDialog() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      power: "hp",
      powerFrom: "",
      powerTo: "",
    },
  });

  const selectedPowerUnit = form.watch("power");

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
            <DialogTitle>Leistung</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.RADIO_GROUP}
              wrapperClassName="w-fit"
              name="power"
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
            <div className="flex gap-2">
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT_GROUP}
                name="powerFrom"
                placeholder="from"
                inputGroupText={selectedPowerUnit}
              />
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT_GROUP}
                name="powerTo"
                placeholder="to"
                inputGroupText={selectedPowerUnit}
              />
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
