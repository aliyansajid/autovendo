"use client";

import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@repo/ui/components/card";
import { FieldGroup, Field } from "@repo/ui/components/field";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@repo/auth/client";
import { toast } from "sonner";
import { useTransition } from "react";
import { Spinner } from "@repo/ui/components/spinner";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/components/custom-form-field";
import { createUpdatePasswordSchema } from "@/schema/auth-schema";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

export const UpdatePasswordForm = () => {
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("UpdatePasswordForm");
  const t_schema = useTranslations("AuthSchema");
  
  const schema = useMemo(() => createUpdatePasswordSchema(t_schema), [t_schema]);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: z.infer<typeof schema>) {
    startTransition(async () => {
      const { error } = await authClient.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        toast.error(error.message || t("errorDefault"));
        return;
      }

      toast.success(t("successDefault"));
      form.reset();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("cardTitle")}</CardTitle>
        <CardDescription>{t("cardDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              inputType="password"
              name="currentPassword"
              label={t("currentPassword")}
              placeholder="••••••••"
              disabled={isPending}
            />
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              inputType="password"
              name="newPassword"
              label={t("newPassword")}
              placeholder="••••••••"
              disabled={isPending}
            />
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              inputType="password"
              name="confirmPassword"
              label={t("confirmPassword")}
              placeholder="••••••••"
              disabled={isPending}
            />
            <Field>
              <Button
                type="submit"
                disabled={isPending || !form.formState.isDirty}
              >
                {isPending ? (
                  <>
                    <Spinner />
                    {t("saving")}
                  </>
                ) : (
                  t("save")
                )}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};
