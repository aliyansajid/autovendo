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

const formSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberme: z.boolean(),
});

export const LoginForm = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberme: false,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const { error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberme,
        callbackURL: callbackUrl,
      });

      if (error) {
        toast.error(error.message);
        return;
      }
    });
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>
          Login with your Apple or Google account
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
              label="Email"
              placeholder="m@example.com"
              disabled={isPending}
            />

            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              inputType="password"
              name="password"
              label="Password"
              placeholder="********"
              disabled={isPending}
            />

            <div className="flex items-center justify-between">
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.CHECKBOX}
                name="rememberme"
                label="Remember Me"
                disabled={isPending}
              />
              <Link
                href="/forgot-password"
                className="text-sm underline-offset-4 hover:text-primary hover:underline whitespace-nowrap"
              >
                Forgot your password?
              </Link>
            </div>

            <Field>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Spinner />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};
