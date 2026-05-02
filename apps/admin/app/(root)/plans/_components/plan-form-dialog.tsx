"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { planSchema } from "@/schema";
import { createPlan, updatePlan } from "@/app/actions/plan.actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@repo/ui/components/dialog";
import { Button } from "@repo/ui/components/button";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/src/components/custom-form-field";
import { FieldGroup } from "@repo/ui/components/field";
import { Spinner } from "@repo/ui/src/components/spinner";
import { Switch } from "@repo/ui/components/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from "@repo/ui/components/form";
import { useForm } from "react-hook-form";

interface PlanFormDialogProps {
  children: React.ReactNode;
  plan?: any;
}

export function PlanFormDialog({ children, plan }: PlanFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof planSchema>>({
    resolver: zodResolver(planSchema) as any,
    defaultValues: {
      name: plan?.name || "",
      description: plan?.description || "",
      price: plan?.price || 0,
      priceId: plan?.priceId || "",
      vehicles: (plan?.limits as any)?.vehicles || 5,
      popular: plan?.popular || false,
    },
  });

  async function onSubmit(values: z.infer<typeof planSchema>) {
    startTransition(async () => {
      try {
        const result = plan
          ? await updatePlan(plan.id, values)
          : await createPlan(values);

        if (result.success) {
          toast.success(result.message);
          setOpen(false);
          form.reset();
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        toast.error("Something went wrong");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{plan ? "Edit Plan" : "Create New Plan"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit as any)}
            className="space-y-6"
          >
            <FieldGroup>
              <CustomFormField
                control={form.control as any}
                fieldType={FormFieldType.INPUT}
                name="name"
                label="Name"
                placeholder="e.g. Bronze"
                disabled={isPending}
              />
              <CustomFormField
                control={form.control as any}
                fieldType={FormFieldType.TEXTAREA}
                name="description"
                label="Description"
                placeholder="Plan details..."
                disabled={isPending}
              />
              <div className="grid grid-cols-2 gap-2">
                <CustomFormField
                  control={form.control as any}
                  fieldType={FormFieldType.INPUT}
                  inputType="number"
                  name="price"
                  label="Price (Rappen)"
                  placeholder="18000"
                  disabled={isPending}
                />
                <CustomFormField
                  control={form.control as any}
                  fieldType={FormFieldType.INPUT}
                  inputType="number"
                  name="vehicles"
                  label="Vehicle Limit"
                  placeholder="5"
                  disabled={isPending}
                />
              </div>
              <CustomFormField
                control={form.control as any}
                fieldType={FormFieldType.INPUT}
                name="priceId"
                label="Stripe Price ID"
                placeholder="price_..."
                disabled={isPending}
              />

              <FormField
                control={form.control as any}
                name="popular"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Popular Plan</FormLabel>
                      <FormDescription>
                        Show a "Popular" badge on this plan.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </FieldGroup>

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Spinner /> : plan ? "Update Plan" : "Create Plan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
