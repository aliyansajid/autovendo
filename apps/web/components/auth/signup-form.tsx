"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Field, FieldDescription, FieldGroup } from "@repo/ui/components/field";
import Link from "next/link";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/src/components/custom-form-field";

const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const SignupForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    console.log(data);
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Enter your email below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                inputType="text"
                name="name"
                label="Full Name"
                placeholder="John Doe"
              />

              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                inputType="email"
                name="email"
                label="Email"
                placeholder="m@example.com"
              />

              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                inputType="password"
                name="password"
                label="Password"
                placeholder="********"
              />

              <Field>
                <Button type="submit">Create Account</Button>
                <FieldDescription className="text-center">
                  Already have an account? <Link href="/login">Login</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our&nbsp;
        <Link href="#">Terms of Service</Link>&nbsp;and&nbsp;
        <Link href="#">Privacy Policy</Link>.
      </FieldDescription>
    </div>
  );
};

export default SignupForm;
