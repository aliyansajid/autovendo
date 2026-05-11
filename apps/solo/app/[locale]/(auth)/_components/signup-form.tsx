"use client";

import { Button } from "@repo/ui/src/components/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@repo/ui/src/components/card";
import { FieldGroup, Field } from "@repo/ui/src/components/field";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@/i18n/routing";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/src/components/custom-form-field";
import { Spinner } from "@repo/ui/src/components/spinner";
import { authClient } from "@repo/auth/client";
import { toast } from "sonner";
import { useTransition, useMemo } from "react";
import { createSignupSchema } from "@/schema/auth-schema";
import { useTranslations } from "next-intl";

export const SignupForm = () => {
  const t = useTranslations("SignupForm");
  const tAuthErrors = useTranslations("AuthErrors");
  const tSchema = useTranslations("AuthSchema");
  const [isPending, startTransition] = useTransition();

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
      const { error } = await authClient.signUp.email({
        email: values.email,
        password: values.password,
        name: values.name,
        callbackURL: "/",
      });

      if (error) {
        const errorCode = (error as any).code || "UNKNOWN_ERROR";
        toast.error(tAuthErrors(errorCode) || error.message || t("errorDefault"));
        return;
      }

      toast.success("Account created successfully!");
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
            </Field>

            <div className="text-center text-sm">
              {t("alreadyHaveAccount")}{" "}
              <Link href="/login" className="underline underline-offset-4">
                {t("login")}
              </Link>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};
