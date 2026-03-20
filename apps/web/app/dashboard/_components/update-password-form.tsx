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
        toast.error(
          error.message || "Passwort konnte nicht aktualisiert werden.",
        );
        return;
      }

      toast.success("Passwort erfolgreich aktualisiert.");
      form.reset();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Passwort ändern</CardTitle>
        <CardDescription>
          Aktualisieren Sie Ihr Passwort, um Ihr Konto zu schützen.
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
              label="Aktuelles Passwort"
              placeholder="••••••••"
              disabled={isPending}
            />
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              inputType="password"
              name="newPassword"
              label="Neues Passwort"
              placeholder="••••••••"
              disabled={isPending}
            />
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              inputType="password"
              name="confirmPassword"
              label="Passwort bestätigen"
              placeholder="••••••••"
              disabled={isPending}
            />
            <Field>
              <Button type="submit" disabled={isPending || !form.formState.isDirty}>
                {isPending ? (
                  <>
                    <Spinner />
                    Wird gespeichert...
                  </>
                ) : (
                  "Passwort speichern"
                )}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};
