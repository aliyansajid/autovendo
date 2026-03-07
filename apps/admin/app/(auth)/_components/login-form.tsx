"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTransition } from "react";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Field, FieldGroup } from "@repo/ui/components/field";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/src/components/custom-form-field";
import { authClient } from "@repo/auth/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Spinner } from "@repo/ui/src/components/spinner";

const formSchema = z.object({
  email: z.email({ error: "Please enter a valid email" }),
  password: z.string().min(1, "Password is required"),
});

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const router = useRouter();

  async function onSubmit(data: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
        callbackURL: "/",
      });

      if (result.error) {
        toast.error(result.error.message);
        return;
      }

      router.push("/");
    });
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
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

            <Field>
              <Button type="submit" disabled={isPending} className="w-full">
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
}
