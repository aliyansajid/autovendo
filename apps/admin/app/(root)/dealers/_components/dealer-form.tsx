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
import { createDealer, updateDealer } from "@/lib/api/dealers";
import { PlusCircle, Save } from "lucide-react";
import { dealerSchema, updateDealerSchema } from "@/schema";
import { swissCities } from "@/lib/swiss-cities";
import { SelectItem } from "@repo/ui/components/select";
import { Form } from "@repo/ui/src/components/form";

interface DealerFormProps {
  initialData?: any;
  dealerId?: string;
}

export function DealerForm({ initialData, dealerId }: DealerFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!dealerId;

  const currentSchema = isEditing ? updateDealerSchema : dealerSchema;

  const form = useForm<z.infer<typeof currentSchema>>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      name: initialData?.user?.name || "",
      email: initialData?.user?.email || "",
      password: "",
      companyName: initialData?.companyName || "",
      streetAddress: initialData?.streetAddress || "",
      zipCode: initialData?.zipCode || "",
      city: initialData?.city || "",
      uidNumber: initialData?.uidNumber || "",
      contactPerson: initialData?.contactPerson || "",
      phoneNumber: initialData?.phoneNumber || "",
      businessEmail: initialData?.businessEmail || "",
    },
  });

  function onSubmit(data: z.infer<typeof currentSchema>) {
    startTransition(async () => {
      let result;
      if (isEditing && dealerId) {
        result = await updateDealer(dealerId, data);
      } else {
        result = await createDealer(data as z.infer<typeof dealerSchema>);
      }

      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Success");
      router.push(`/dealers/${dealerId || ""}`);
    });
  }

  return (
    <Form {...form}>
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
                  placeholder="John Doe"
                  disabled={isPending}
                />
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  inputType="email"
                  name="email"
                  label="Email"
                  placeholder="john@example.com"
                  disabled={isPending}
                />
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  inputType="password"
                  name="password"
                  label={isEditing ? "New Password (optional)" : "Password"}
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
                  placeholder="AutoVendo"
                  disabled={isPending}
                />
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  name="uidNumber"
                  label="UID-Nr. (Tax ID)"
                  placeholder="CHE-123.456.789"
                  disabled={isPending}
                />
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  inputType="email"
                  name="businessEmail"
                  label="Business Email"
                  placeholder="info@autovendo.ch"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FieldGroup>
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  name="streetAddress"
                  label="Street Address"
                  placeholder="Main Street 1"
                  disabled={isPending}
                />
                <div className="grid grid-cols-2 gap-3">
                  <CustomFormField
                    control={form.control}
                    fieldType={FormFieldType.INPUT}
                    name="zipCode"
                    label="Zip"
                    placeholder="8000"
                    disabled={isPending}
                  />

                  <CustomFormField
                    control={form.control}
                    fieldType={FormFieldType.SELECT}
                    name="city"
                    label="City"
                    placeholder="Select City"
                    disabled={isPending}
                  >
                    {swissCities.map((city) => (
                      <SelectItem key={city.value} value={city.value}>
                        {city.label}
                      </SelectItem>
                    ))}
                  </CustomFormField>
                </div>
              </FieldGroup>
              <FieldGroup>
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  name="contactPerson"
                  label="Contact Person"
                  placeholder="Jane Smith"
                  disabled={isPending}
                />
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  inputType="tel"
                  name="phoneNumber"
                  label="Phone Number"
                  placeholder="+41 79 123 45 67"
                  disabled={isPending}
                />
              </FieldGroup>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full md:w-auto"
          >
            {isPending ? (
              <>
                <Spinner />
                {isEditing ? "Saving..." : "Creating..."}
              </>
            ) : (
              <>
                {isEditing ? <Save /> : <PlusCircle />}
                {isEditing ? "Save Changes" : "Create Dealer"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
