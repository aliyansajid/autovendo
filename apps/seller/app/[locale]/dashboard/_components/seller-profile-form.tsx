"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSellerProfileSchema } from "@/schema/profile-schema";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@repo/ui/components/card";
import { FieldGroup } from "@repo/ui/components/field";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/components/custom-form-field";
import { useTranslations } from "next-intl";
import { authClient } from "@repo/auth/client";
import { useTransition } from "react";
import { toast } from "sonner";
import { getPresignedUploadUrl } from "@/app/actions/storage.actions";
import { updateSellerProfile } from "@/app/actions/seller.actions";
import { Spinner } from "@repo/ui/components/spinner";
import { SellerProfile } from "@/types/seller";
import { swissCities } from "@/lib/constants/swiss-cities";
import { SelectItem } from "@repo/ui/components/select";

type FormValues = z.infer<ReturnType<typeof createSellerProfileSchema>>;

interface SellerProfileFormProps {
  initialData: SellerProfile | null;
}

export function SellerProfileForm({ initialData }: SellerProfileFormProps) {
  const t = useTranslations("SellerProfileForm");
  const tSchema = useTranslations("ProfileSchema");
  const [isPending, startTransition] = useTransition();

  const schema = createSellerProfileSchema(tSchema);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.user.name ?? "",
      email: initialData?.user.email ?? "",
      image: initialData?.user.image ?? undefined,
      firstName: initialData?.firstName ?? "",
      lastName: initialData?.lastName ?? "",
      phoneNumber: initialData?.phoneNumber ?? "",
      sellerEmail: initialData?.email ?? "",
      streetAddress: initialData?.streetAddress ?? "",
      zipCode: initialData?.zipCode ?? "",
      city: initialData?.city ?? "",
      country: "Switzerland",
    },
  });

  async function uploadIfFile(value: File | string | null | undefined): Promise<string | null | undefined> {
    if (!(value instanceof File)) return value;
    const { uploadUrl, publicUrl } = await getPresignedUploadUrl({
      sellerId: initialData?.id ?? "new",
      fileName: value.name,
      contentType: value.type,
    });
    const res = await fetch(uploadUrl, { method: "PUT", body: value, headers: { "Content-Type": value.type } });
    if (!res.ok) throw new Error(t("uploadFailed"));
    return publicUrl;
  }

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      try {
        const image = await uploadIfFile(values.image);

        const currentUser = await authClient.getSession();
        if (!currentUser?.data?.user) {
          toast.error(t("missingUser"));
          return;
        }

        if (values.name !== currentUser.data.user.name) {
          const { error } = await authClient.updateUser({ name: values.name });
          if (error) { toast.error(t("userUpdateError")); return; }
        }

        if (values.email !== currentUser.data.user.email) {
          const { error } = await authClient.changeEmail({ newEmail: values.email, callbackURL: "/dashboard" });
          if (error) { toast.error(t("emailChangeError")); return; }
          toast.info(t("emailConfirmation"));
        }

        const result = await updateSellerProfile({ ...values, image });
        if (!result.success) {
          toast.error(t("profileUpdateError"));
          return;
        }

        toast.success(t("profileUpdateSuccess"));
      } catch {
        toast.error(t("unexpectedError"));
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Personal / Account */}
      <Card>
        <CardHeader>
          <CardTitle>{t("personalTitle")}</CardTitle>
          <CardDescription>{t("personalDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              inputType="file"
              name="image"
              label={t("profileImageLabel")}
              disabled={isPending}
            />
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              name="name"
              label={t("nameLabel")}
              placeholder={t("namePlaceholder")}
              disabled={isPending}
            />
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              inputType="email"
              name="email"
              label={t("emailLabel")}
              placeholder={t("emailPlaceholder")}
              disabled={isPending}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Seller Info */}
      <Card>
        <CardHeader>
          <CardTitle>{t("sellerTitle")}</CardTitle>
          <CardDescription>{t("sellerDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                name="firstName"
                label={t("firstNameLabel")}
                placeholder={t("firstNamePlaceholder")}
                disabled={isPending}
              />
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                name="lastName"
                label={t("lastNameLabel")}
                placeholder={t("lastNamePlaceholder")}
                disabled={isPending}
              />
            </div>
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              name="phoneNumber"
              label={t("phoneLabel")}
              disabled={isPending}
            />
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              inputType="email"
              name="sellerEmail"
              label={t("contactEmailLabel")}
              placeholder={t("emailPlaceholder")}
              disabled={isPending}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle>{t("addressTitle")}</CardTitle>
          <CardDescription>{t("addressDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              name="streetAddress"
              label={t("streetLabel")}
              placeholder={t("streetPlaceholder")}
              disabled={isPending}
            />
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              name="zipCode"
              label={t("zipLabel")}
              disabled={isPending}
            />
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.SELECT}
              name="city"
              label={t("cityLabel")}
              placeholder={t("cityPlaceholder")}
              disabled={isPending}
            >
              {swissCities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </CustomFormField>
          </FieldGroup>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <>
            <Spinner />
            {t("saving")}
          </>
        ) : (
          t("save")
        )}
      </Button>
    </form>
  );
}
