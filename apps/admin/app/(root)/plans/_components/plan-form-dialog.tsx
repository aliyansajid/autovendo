"use client";
import { useRouter } from "next/navigation";

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
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@repo/ui/components/field";
import { Spinner } from "@repo/ui/src/components/spinner";
import { Switch } from "@repo/ui/components/switch";
import { Form, FormField } from "@repo/ui/components/form";
import { useForm } from "react-hook-form";

interface PlanFormDialogProps {
  children: React.ReactNode;
  plan?: any;
}

export function PlanFormDialog({ children, plan }: PlanFormDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
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
      hasTrial: plan?.hasTrial || false,
      trialDays: plan?.trialDays || 14,
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
          window.location.reload();
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
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
              <div className="grid grid-cols-2 gap-3">
                <CustomFormField
                  control={form.control as any}
                  fieldType={FormFieldType.INPUT}
                  inputType="number"
                  name="price"
                  label="Price (CHF)"
                  placeholder="180"
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
                control={form.control}
                name="popular"
                render={({ field }) => (
                  <FieldLabel htmlFor="switch-popular">
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldTitle>Popular Plan</FieldTitle>
                        <FieldDescription>
                          Show a "Popular" badge on this plan.
                        </FieldDescription>
                      </FieldContent>
                      <Switch
                        id="switch-popular"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                      />
                    </Field>
                  </FieldLabel>
                )}
              />

              <FormField
                control={form.control}
                name="hasTrial"
                render={({ field }) => (
                  <FieldLabel htmlFor="switch-hasTrial">
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldTitle>Free Trial</FieldTitle>
                        <FieldDescription>
                          Enable a free trial period for this plan.
                        </FieldDescription>
                      </FieldContent>
                      <Switch
                        id="switch-hasTrial"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                      />
                    </Field>
                  </FieldLabel>
                )}
              />

              {form.watch("hasTrial") && (
                <CustomFormField
                  control={form.control as any}
                  fieldType={FormFieldType.INPUT}
                  inputType="number"
                  name="trialDays"
                  label="Trial Duration (Days)"
                  placeholder="14"
                  disabled={isPending}
                />
              )}
            </FieldGroup>

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Spinner />
                    {plan ? "Updating..." : "Creating..."}
                  </>
                ) : plan ? (
                  "Update Plan"
                ) : (
                  "Create Plan"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
