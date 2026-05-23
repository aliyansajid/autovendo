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
import { useTranslations, useLocale } from "next-intl";
import { authClient } from "@repo/auth/client";
import { useTransition } from "react";
import { toast } from "sonner";
import { updateSellerProfile } from "@/app/actions/dealer.actions";
import { Spinner } from "@repo/ui/components/spinner";
import type { SellerProfile } from "@/app/actions/dealer.actions";
import { SelectItem } from "@repo/ui/components/select";
import { swissCities } from "@/lib/constants/swiss-cities";

type FormValues = z.infer<ReturnType<typeof createSellerProfileSchema>>;

interface SellerProfileFormProps {
  initialData: SellerProfile | null;
}

export const SellerProfileForm = ({ initialData }: SellerProfileFormProps) => {
  const t = useTranslations("DealerProfileForm");
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  const tSchema = useTranslations("ProfileSchema");
  const schema = createSellerProfileSchema(tSchema);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.user?.name || "",
      email: initialData?.user?.email || "",
      phoneNumber: initialData?.phoneNumber || "",
      streetAddress: initialData?.streetAddress || "",
      zipCode: initialData?.zipCode || "",
      city: initialData?.city || "",
    },
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      try {
        const result = await updateSellerProfile(values);

        if (!result.success) {
          toast.error(t("profileUpdateError"));
          return;
        }

        const userUpdates: { name?: string } = {};
        if (values.name !== initialData?.user?.name) {
          userUpdates.name = values.name;
        }

        if (Object.keys(userUpdates).length > 0) {
          const { error } = await authClient.updateUser(userUpdates);
          if (error) {
            toast.error(error.message || t("userUpdateError"));
            return;
          }
        }

        if (values.email !== initialData?.user?.email) {
          const { error } = await authClient.changeEmail({
            newEmail: values.email,
            callbackURL: `/${locale}/dashboard/settings/profile`,
          });

          if (error) {
            toast.error(error.message || t("emailChangeError"));
            return;
          }

          toast.info(t("emailConfirmation"));
        }

        toast.success(t("profileUpdateSuccess"));
        form.reset(values);
      } catch (error: any) {
        toast.error(error?.message || t("unexpectedError"));
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                inputType="text"
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
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                inputType="tel"
                name="phoneNumber"
                label={t("phoneLabel")}
                placeholder="+41 79 123 45 67"
                disabled={isPending}
              />
            </FieldGroup>
          </CardContent>
        </Card>

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
                inputType="text"
                name="streetAddress"
                label={t("streetLabel")}
                placeholder={t("streetPlaceholder")}
                disabled={isPending}
              />
              <div className="grid grid-cols-2 gap-4">
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  inputType="text"
                  name="zipCode"
                  label={t("zipLabel")}
                  placeholder="8000"
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
              </div>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button disabled={isPending || !form.formState.isDirty} type="submit">
          {isPending ? (
            <>
              <Spinner />
              {t("saving")}
            </>
          ) : (
            t("save")
          )}
        </Button>
      </div>
    </form>
  );
};
