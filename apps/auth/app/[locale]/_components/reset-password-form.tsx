"use client";

import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@repo/ui/components/card";
import { FieldGroup, Field, FieldDescription } from "@repo/ui/components/field";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPassword } from "@/lib/auth-client";
import { toast } from "sonner";
import { useTransition, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Spinner } from "@repo/ui/components/spinner";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/components/custom-form-field";
import { Link } from "@/i18n/routing";
import { createResetPasswordSchema } from "@/schema/auth-schema";
import { useTranslations } from "next-intl";

export const ResetPasswordForm = () => {
  const t = useTranslations("ResetPasswordForm");
  const tSchema = useTranslations("AuthSchema");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isPending, startTransition] = useTransition();

  const resetPasswordSchema = useMemo(
    () => createResetPasswordSchema(tSchema),
    [tSchema],
  );

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
    if (!token) {
      toast.error(t("invalidTokenToast"));
      return;
    }

    startTransition(async () => {
      const { error } = await resetPassword({
        newPassword: values.password,
        token: token,
      });

      if (error) {
        toast.error(error.message || t("errorDefault"));
        return;
      }

      toast.success(t("successReset"));
    });
  }

  if (!token) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t("invalidLinkTitle")}</CardTitle>
          <CardDescription>{t("invalidLinkDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" asChild>
            <Link href="/forgot-password">{t("requestNewLink")}</Link>
          </Button>
        </CardContent>
      </Card>
    );
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
              inputType="password"
              name="password"
              label={t("newPassword")}
              placeholder="********"
              disabled={isPending}
            />

            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              inputType="password"
              name="confirmPassword"
              label={t("confirmPassword")}
              placeholder="********"
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
                <Link href="/login" className="underline underline-offset-4">
                  {t("backToLogin")}
                </Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};
