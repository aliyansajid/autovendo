import * as React from "react";
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
import { VehicleConditionEnum } from "@/constants";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect } from "react";

const formSchema = z.object({
  condition: z.array(z.string()),
});

function formatCount(n: number) {
  return new Intl.NumberFormat("de-CH").format(n);
}

export function ConditionDialog({ resultCount }: { resultCount?: number }) {
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

  const [open, setOpen] = React.useState(false);

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
            <DialogTitle>Bedingungen</DialogTitle>
            <DialogDescription>
              Wählen Sie den gewünschten Fahrzeugzustand aus.
            </DialogDescription>
          </DialogHeader>
          
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.RADIO_GROUP}
              name="condition"
              className="flex-col"
              options={VehicleConditionEnum.map((condition) => ({
                label: condition.label,
                value: condition.value,
              }))}
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
