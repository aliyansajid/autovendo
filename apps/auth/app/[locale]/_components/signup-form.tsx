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
import { Link } from "@/i18n/routing";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/components/custom-form-field";
import { Spinner } from "@repo/ui/components/spinner";
import { signUp, resendVerificationEmail } from "@/lib/auth-client";
import { toast } from "sonner";
import { useTransition, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSignupSchema } from "@/schema/auth-schema";
import { useTranslations, useLocale } from "next-intl";

export const SignupForm = () => {
  const locale = useLocale();
  const t = useTranslations("SignupForm");
  const tSchema = useTranslations("AuthSchema");
  const searchParams = useSearchParams();
  const callbackUrl =
    searchParams.get("callbackUrl") ||
    `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/dashboard`;
  const [isPending, startTransition] = useTransition();
  const [isResending, startResendTransition] = useTransition();
  const [verifyEmail, setVerifyEmail] = useState<string | null>(null);

  const signupSchema = useMemo(() => createSignupSchema(tSchema), [tSchema]);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: z.infer<typeof signupSchema>) {
    startTransition(async () => {
      const { error } = await signUp({
        email: values.email,
        password: values.password,
        name: values.name,
        callbackURL: callbackUrl,
      });

      if (error) {
        toast.error(error.message || t("errorDefault"));
        return;
      }

      form.reset();
      setVerifyEmail(values.email);
    });
  }

  function onResend() {
    if (!verifyEmail) return;
    startResendTransition(async () => {
      const { error } = await resendVerificationEmail({
        email: verifyEmail,
        callbackURL: callbackUrl,
      });
      if (error) {
        toast.error(t("resendError"));
      } else {
        toast.success(t("resendSuccess"));
      }
    });
  }

  if (verifyEmail) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t("verifyTitle")}</CardTitle>
          <CardDescription>
            {t("verifyDescription", { email: verifyEmail })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isResending}
                onClick={onResend}
              >
                {isResending ? <Spinner /> : t("resend")}
              </Button>

              <FieldDescription className="text-center">
                {t("alreadyHaveAccount")}&nbsp;
                <Link href="/login" className="underline underline-offset-4">
                  {t("login")}
                </Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
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
              name="name"
              label={t("name")}
              placeholder={t("namePlaceholder")}
              disabled={isPending}
            />

            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              inputType="email"
              name="email"
              label={t("email")}
              placeholder={t("emailPlaceholder")}
              disabled={isPending}
            />

            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              inputType="password"
              name="password"
              label={t("password")}
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
                {t("alreadyHaveAccount")}&nbsp;
                <Link href="/login" className="underline underline-offset-4">
                  {t("login")}
                </Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};
