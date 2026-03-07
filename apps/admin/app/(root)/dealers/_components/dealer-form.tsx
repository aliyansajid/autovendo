"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { FieldGroup } from "@repo/ui/components/field";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/src/components/custom-form-field";
import { Spinner } from "@repo/ui/src/components/spinner";
import { createDealerAction } from "@/app/actions/dealer-actions";
import { PlusCircle } from "lucide-react";
import { dealerSchema } from "@/schema";

export function DealerForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof dealerSchema>>({
    resolver: zodResolver(dealerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      companyName: "",
      address: "",
      zipCode: "",
      city: "",
      uidNumber: "",
      contactPerson: "",
      phoneNumber: "",
      businessEmail: "",
    },
  });

  function onSubmit(data: z.infer<typeof dealerSchema>) {
    startTransition(async () => {
      const result = await createDealerAction(data);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message);
      router.push("/dealers");
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                name="name"
                label="Name"
                placeholder="e.g. John Doe"
                disabled={isPending}
              />
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                inputType="email"
                name="email"
                label="Email"
                placeholder="e.g. john@example.com"
                disabled={isPending}
              />
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                inputType="password"
                name="password"
                label="Password"
                placeholder="********"
                disabled={isPending}
              />
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                name="companyName"
                label="Company Name"
                placeholder="e.g. AutoVendo"
                disabled={isPending}
              />
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                name="uidNumber"
                label="UID-Nr. (Tax ID)"
                placeholder="e.g. CHE-123.456.789"
                disabled={isPending}
              />
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                inputType="email"
                name="businessEmail"
                label="Business Email"
                placeholder="e.g. info@autovendo.ch"
                disabled={isPending}
              />
            </FieldGroup>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact & Address</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FieldGroup>
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                name="address"
                label="Street Address"
                placeholder="e.g. Main Street 1"
                disabled={isPending}
              />
              <div className="grid grid-cols-2 gap-2">
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  name="zipCode"
                  label="Zip"
                  placeholder="e.g. 8000"
                  disabled={isPending}
                />
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  name="city"
                  label="City"
                  placeholder="e.g. Zurich"
                  disabled={isPending}
                />
              </div>
            </FieldGroup>
            <FieldGroup>
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                name="contactPerson"
                label="Contact Person"
                placeholder="e.g. Jane Smith"
                disabled={isPending}
              />
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                name="phoneNumber"
                label="Phone Number"
                placeholder="e.g. +41 79 123 45 67"
                disabled={isPending}
              />
            </FieldGroup>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending} className="w-full md:w-auto">
          {isPending ? (
            <>
              <Spinner />
              Creating...
            </>
          ) : (
            <>
              <PlusCircle />
              Create Dealer
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
