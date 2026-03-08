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
import { authClient } from "@repo/auth/client";
import { toast } from "sonner";
import { useTransition } from "react";
import { Spinner } from "@repo/ui/src/components/spinner";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/src/components/custom-form-field";
import { updatePasswordSchema } from "@/schema/auth-schema";

export const UpdatePasswordForm = () => {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof updatePasswordSchema>>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: z.infer<typeof updatePasswordSchema>) {
    startTransition(async () => {
      const { error } = await authClient.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        toast.error(error.message || "Failed to update password");
        return;
      }

      toast.success("Password updated successfully");
      form.reset();
    });
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Update Password</CardTitle>
        <CardDescription>
          Change your password to keep your account secure.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              inputType="password"
              name="currentPassword"
              label="Current Password"
              placeholder="********"
              disabled={isPending}
            />

            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              inputType="password"
              name="newPassword"
              label="New Password"
              placeholder="********"
              disabled={isPending}
            />

            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              inputType="password"
              name="confirmPassword"
              label="Confirm Password"
              placeholder="********"
              disabled={isPending}
            />

            <Field>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Spinner />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};
