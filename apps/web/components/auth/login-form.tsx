"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Form } from "@repo/ui/components/form";
import { Button } from "@repo/ui/components/button";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/src/components/custom-form-field";
import Link from "next/link";
import { Card, CardContent } from "@repo/ui/src/components/card";

const formSchema = z.object({
  email: z.email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
  rememberMe: z.boolean().default(false).optional(),
});

export function LoginForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // Handle login logic here
  }

  return (
    <Card>
      <CardContent className="grid gap-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              name="email"
              label="Email"
              placeholder="m@example.com"
              inputType="email"
            />
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              name="password"
              label="Password"
              inputType="password"
            />
            <div className="flex items-center justify-between">
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.CHECKBOX}
                name="rememberMe"
                label="Remember me"
              />
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </Form>
        <div className="text-center text-sm">
          Don&apos;t have an account?&nbsp;
          <Link
            href="/signup"
            className="hover:underline font-medium text-primary"
          >
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
