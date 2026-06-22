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
import { updateSellerProfile } from "@/lib/api/seller-vehicles";
import type { SellerProfile } from "@/lib/api/vehicles";
import { useMemo, useTransition } from "react";
import { useRouter } from "@/i18n/routing";
import { toast } from "sonner";
import { Spinner } from "@repo/ui/components/spinner";
import { SelectItem } from "@repo/ui/components/select";
import { swissCities } from "@repo/vehicle-constants";

interface SellerProfileFormProps {
  initialData: SellerProfile | null;
}

export const SellerProfileForm = ({ initialData }: SellerProfileFormProps) => {
  const router = useRouter();
  const t = useTranslations("SellerProfileForm");
  const tSchema = useTranslations("ProfileSchema");
  const [isPending, startTransition] = useTransition();

  const schema = useMemo(() => createSellerProfileSchema(tSchema), [tSchema]);

  const form = useForm<z.infer<typeof schema>>({
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

  function onSubmit(values: z.infer<typeof schema>) {
    startTransition(async () => {
      try {
        const emailChanged = values.email !== initialData?.user?.email;

        const result = await updateSellerProfile({
          name: values.name,
          email: values.email,
          phoneNumber: values.phoneNumber,
          streetAddress: values.streetAddress,
          zipCode: values.zipCode,
          city: values.city,
        });

        if (!result.success) {
          toast.error(result.error || t("profileUpdateError"));
          return;
        }

        if (emailChanged) {
          toast.info(t("emailConfirmation"));
        }

        toast.success(t("profileUpdateSuccess"));
        router.refresh();
        form.reset(values);
      } catch (error: unknown) {
        toast.error((error as Error)?.message || t("unexpectedError"));
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
                    <SelectItem key={city.value} value={city.value}>
                      {city.label}
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
