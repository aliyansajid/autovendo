"use client";

import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@repo/ui/components/card";
import {
  FieldGroup,
  Field,
  FieldDescription,
} from "@repo/ui/components/field";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestPasswordReset } from "@/lib/api/auth-client";
import { toast } from "sonner";
import { useTransition, useMemo } from "react";
import { Spinner } from "@repo/ui/components/spinner";
import { Link } from "@/i18n/routing";
import { useLocale } from "next-intl";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/components/custom-form-field";
import { createForgotPasswordSchema } from "@/schema/auth-schema";
import { useTranslations } from "next-intl";

export const ForgotPasswordForm = () => {
  const t = useTranslations("ForgotPasswordForm");
  const locale = useLocale();
  const tSchema = useTranslations("AuthSchema");
  const [isPending, startTransition] = useTransition();

  const forgotPasswordSchema = useMemo(
    () => createForgotPasswordSchema(tSchema),
    [tSchema],
  );

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    startTransition(async () => {
      const { data, error } = await requestPasswordReset({
        email: values.email,
        redirectTo: `/${locale}/reset-password`,
      });

      if (error) {
        toast.error(error.message || t("errorDefault"));
        return;
      }

      toast.success(data?.message ?? t("successDefault"));
    });
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              inputType="email"
              name="email"
              label={t("email")}
              placeholder={t("emailPlaceholder")}
              disabled={isPending}
            />

            <Field>
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? (
                  <>
                    <Spinner />
                    {t("submitting")}
                  </>
                ) : (
                  t("submit")
                )}
              </Button>
              <FieldDescription className="text-center">
                {t("rememberPassword")}&nbsp;
                <Link href="/login">{t("backToLogin")}</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};
