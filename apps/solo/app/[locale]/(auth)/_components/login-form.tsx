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
import { Link } from "@/i18n/routing";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/components/custom-form-field";
import { Spinner } from "@repo/ui/components/spinner";
import { signIn } from "@/lib/api/auth-client";
import { toast } from "sonner";
import { useTransition, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { createLoginSchema } from "@/schema/auth-schema";
import { useTranslations, useLocale } from "next-intl";

export const LoginForm = () => {
  const t = useTranslations("LoginForm");
  const tSchema = useTranslations("AuthSchema");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || `/${locale}/dashboard`;
  const [isPending, startTransition] = useTransition();

  const loginSchema = useMemo(() => createLoginSchema(tSchema), [tSchema]);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberme: false,
    },
  });

  function onSubmit(values: z.infer<typeof loginSchema>) {
    startTransition(async () => {
      const { error } = await signIn({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberme,
        callbackURL: callbackUrl,
      });

      if (error) {
        toast.error(error.message || t("errorDefault"));
        return;
      }

      window.location.href = callbackUrl;
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

            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              inputType="password"
              name="password"
              label={t("password")}
              placeholder="********"
              disabled={isPending}
            />

            <div className="flex items-center justify-between">
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.CHECKBOX}
                name="rememberme"
                label={t("rememberMe")}
                disabled={isPending}
              />
              <Link
                href="/forgot-password"
                className="text-sm underline-offset-4 hover:text-primary hover:underline whitespace-nowrap"
              >
                {t("forgotPassword")}
              </Link>
            </div>

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
            </Field>

            <div className="text-center text-sm">
              {t("noAccount")}&nbsp;
              <Link href="/signup" className="underline underline-offset-4">
                {t("signup")}
              </Link>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};
