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
import { Mail } from "lucide-react";
import { Card, CardContent } from "@repo/ui/src/components/card";

const formSchema = z
  .object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export function SignupForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // Handle signup logic here
  }

  return (
    <Card>
      <CardContent className="grid gap-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              name="name"
              label="Full Name"
              placeholder="John Doe"
              inputType="text"
            />
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
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              name="confirmPassword"
              label="Confirm Password"
              inputType="password"
            />
            <Button type="submit" className="w-full">
              Create Account
            </Button>
          </form>
        </Form>

        <div className="text-center text-sm">
          Already have an account?&nbsp;
          <Link href="/login" className="underline font-medium text-primary">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
