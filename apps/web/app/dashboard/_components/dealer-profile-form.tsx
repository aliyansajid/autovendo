"use client";

import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { dealerProfileSchema } from "@/schema/profile-schema";
import { Button } from "@repo/ui/src/components/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@repo/ui/src/components/card";
import { FieldGroup } from "@repo/ui/src/components/field";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/src/components/custom-form-field";
import { authClient } from "@repo/auth/client";
import { useTransition } from "react";
import { toast } from "sonner";
import { getPresignedUploadUrl } from "@/app/actions/storage-actions";
import { updateDealerProfile } from "@/app/actions/dealer-actions";
import { Spinner } from "@repo/ui/src/components/spinner";
import { DealerProfile } from "@/types";

interface DealerProfileFormProps {
  initialData: DealerProfile | null;
}

export const DealerProfileForm = ({ initialData }: DealerProfileFormProps) => {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof dealerProfileSchema>>({
    resolver: zodResolver(dealerProfileSchema),
    defaultValues: {
      name: initialData?.user?.name || "",
      email: initialData?.user?.email || "",
      image: initialData?.user?.image || undefined,
      companyName: initialData?.companyName || "",
      description: initialData?.description || "",
      website: initialData?.website || "",
      logo: initialData?.logo || undefined,
      address: initialData?.address || "",
      zipCode: initialData?.zipCode || "",
      city: initialData?.city || "",
      uidNumber: initialData?.uidNumber || "",
      contactPerson: initialData?.contactPerson || "",
      phoneNumber: initialData?.phoneNumber || "",
      businessEmail: initialData?.businessEmail || "",
      openingHours: initialData?.openingHours?.length
        ? initialData.openingHours.map((oh) => ({
            day: oh.day.charAt(0).toUpperCase() + oh.day.slice(1).toLowerCase(),
            isOpen: oh.isOpen,
            openTime: oh.openTime || "08:00",
            closeTime: oh.closeTime || "18:00",
          }))
        : [],
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "openingHours",
  });

  const uploadFile = async (file: File, type: "branding" | "profiles") => {
    const res = await getPresignedUploadUrl({
      country: "ch",
      dealerId: initialData?.id || "temp",
      type,
      filename: file.name,
      contentType: file.type,
    });

    if (!res.success || !res.uploadUrl) throw new Error(res.error);

    await fetch(res.uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });

    return res.publicUrl;
  };

  function onSubmit(values: z.infer<typeof dealerProfileSchema>) {
    startTransition(async () => {
      try {
        let imageUrl = values.image;
        let logoUrl = values.logo;

        if (values.image instanceof File) {
          imageUrl = await uploadFile(values.image, "profiles");
        }

        if (values.logo instanceof File) {
          logoUrl = await uploadFile(values.logo, "branding");
        }

        // Update user
        const userUpdates: { name?: string; image?: string } = {};
        if (values.name !== initialData?.user?.name)
          userUpdates.name = values.name;
        if (imageUrl !== initialData?.user?.image)
          userUpdates.image = imageUrl as string;

        if (Object.keys(userUpdates).length > 0) {
          const { error } = await authClient.updateUser(userUpdates);
          if (error) toast.error(error.message || "Failed to update user info");
        }

        // Handle email change
        if (values.email !== initialData?.user?.email) {
          const { error } = await authClient.changeEmail({
            newEmail: values.email,
            callbackURL: "/dashboard/settings/profile",
          });

          if (error)
            toast.error(error.message || "Failed to initiate email change");

          toast.info(
            "A verification email has been sent to your new email address.",
          );
        }

        // Update dealer
        if (!initialData?.user?.id) {
          toast.error("User information is missing.");
          return;
        }

        const result = await updateDealerProfile(initialData.user.id, {
          ...values,
          image: imageUrl as string,
          logo: logoUrl as string,
        });

        if (result.success) toast.success(result.message);
        else toast.error(result.error || "Failed to update business profile");
      } catch (error: any) {
        toast.error(error.message || "Something went wrong. Please try again.");
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your basic account details.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                name="name"
                label="Name"
                placeholder="e.g. John Doe"
              />
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                name="email"
                label="Email"
                placeholder="e.g. john@example.com"
              />
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                inputType="file"
                name="image"
                label="Image"
              />
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>Your company and contact details.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  name="companyName"
                  label="Company Name"
                  placeholder="e.g. ACME Corp"
                />
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  name="uidNumber"
                  label="UID Number"
                  placeholder="e.g. CHE-123.456.789"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  name="website"
                  label="Website"
                  placeholder="e.g. https://www.acme.com"
                />
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  inputType="file"
                  name="logo"
                  label="Company Logo"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  name="businessEmail"
                  label="Business Email"
                  placeholder="e.g. info@acme.com"
                />
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  name="phoneNumber"
                  label="Phone Number"
                  placeholder="e.g. +41 79 123 45 67"
                />
              </div>
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                name="contactPerson"
                label="Contact Person"
                placeholder="e.g. John Doe"
              />
            </FieldGroup>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
            <CardDescription>Where your business is located.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                name="address"
                label="Address"
                placeholder="e.g. Street 123"
              />
              <div className="grid grid-cols-2 gap-4">
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  name="zipCode"
                  label="ZIP Code"
                  placeholder="e.g. 8000"
                />
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  name="city"
                  label="City"
                  placeholder="e.g. Zurich"
                />
              </div>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
            <CardDescription>Tell us about your business.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.TEXTAREA}
                name="description"
                label="Description"
                className="min-h-[120px]"
                placeholder="Tell us about your business..."
              />
            </FieldGroup>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Opening Hours</CardTitle>
          <CardDescription>When you are available.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {fields && fields.length > 0 ? (
              fields.map((item, index) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4 p-3 rounded-lg border bg-muted/30"
                >
                  <span className="font-medium">{item.day}</span>
                  <div className="flex items-center gap-2">
                    <CustomFormField
                      control={form.control}
                      fieldType={FormFieldType.CHECKBOX}
                      name={`openingHours.${index}.isOpen`}
                      label={
                        form.watch(`openingHours.${index}.isOpen`)
                          ? "Open"
                          : "Closed"
                      }
                    />
                  </div>
                  {form.watch(`openingHours.${index}.isOpen`) && (
                    <>
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.INPUT}
                        inputType="text"
                        name={`openingHours.${index}.openTime`}
                        placeholder="08:00"
                        className="h-9"
                      />
                      <CustomFormField
                        control={form.control}
                        fieldType={FormFieldType.INPUT}
                        inputType="text"
                        name={`openingHours.${index}.closeTime`}
                        placeholder="18:00"
                        className="h-9"
                      />
                    </>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No opening hours defined.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button disabled={isPending} type="submit">
          {isPending ? (
            <>
              <Spinner />
              Saving...
            </>
          ) : (
            "Save Profile"
          )}
        </Button>
      </div>
    </form>
  );
};
