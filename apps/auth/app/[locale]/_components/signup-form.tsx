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
  // const [socialPending, setSocialPending] = useState<"google" | "apple" | null>(
  //   null,
  // );

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

  // async function handleSocialSignIn(provider: "google" | "apple") {
  //   setSocialPending(provider);
  //   const { url, error } = await signInSocial({
  //     provider,
  //     callbackURL: callbackUrl,
  //   });
  //   if (error || !url) {
  //     toast.error(t("errorDefault"));
  //     setSocialPending(null);
  //     return;
  //   }
  //   window.location.href = url;
  // }

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
            {/* <Field>
              <Button
                variant="outline"
                type="button"
                className="w-full"
                disabled={!!socialPending || isPending}
                onClick={() => handleSocialSignIn("apple")}
              >
                {socialPending === "apple" ? (
                  <Spinner />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                      fill="currentColor"
                    />
                  </svg>
                )}
                {t("appleButton")}
              </Button>
              <Button
                variant="outline"
                type="button"
                className="w-full"
                disabled={!!socialPending || isPending}
                onClick={() => handleSocialSignIn("google")}
              >
                {socialPending === "google" ? (
                  <Spinner />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="-3 0 262 262"
                    preserveAspectRatio="xMidYMid"
                  >
                    <path
                      d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                      fill="#4285F4"
                    />
                    <path
                      d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                      fill="#34A853"
                    />
                    <path
                      d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
                      fill="#FBBC05"
                    />
                    <path
                      d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                      fill="#EB4335"
                    />
                  </svg>
                )}
                {t("googleButton")}
              </Button>
            </Field>
            <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
              Or continue with
            </FieldSeparator> */}
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
