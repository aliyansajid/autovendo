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
import Link from "next/link";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/src/components/custom-form-field";
import { Spinner } from "@repo/ui/src/components/spinner";
import { authClient } from "@repo/auth/client";
import { toast } from "sonner";
import { useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { loginSchema } from "@/schema/auth-schema";

export const LoginForm = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [isPending, startTransition] = useTransition();

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
      const { error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberme,
        callbackURL: callbackUrl,
      });

      if (error) {
        toast.error(
          error.message ??
            "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
        );
        return;
      }
    });
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Willkommen zurück</CardTitle>
        <CardDescription>
          Geben Sie unten Ihre E-Mail-Adresse ein, um sich in Ihr Konto
          einzuloggen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              inputType="email"
              name="email"
              label="E-Mail"
              placeholder="m@beispiel.ch"
              disabled={isPending}
            />

            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              inputType="password"
              name="password"
              label="Passwort"
              placeholder="********"
              disabled={isPending}
            />

            <div className="flex items-center justify-between">
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.CHECKBOX}
                name="rememberme"
                label="Angemeldet bleiben"
                disabled={isPending}
              />
              <Link
                href="/forgot-password"
                className="text-sm underline-offset-4 hover:text-primary hover:underline whitespace-nowrap"
              >
                Passwort vergessen?
              </Link>
            </div>

            <Field>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Spinner />
                    Wird angemeldet...
                  </>
                ) : (
                  "Anmelden"
                )}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};
