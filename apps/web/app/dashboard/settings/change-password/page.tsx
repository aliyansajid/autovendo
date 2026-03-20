"use client";

import { UpdatePasswordForm } from "../../_components/update-password-form";

export default function ChangePasswordPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Passwort ändern</h1>
        <p className="text-sm text-muted-foreground">
          Aktualisieren Sie Ihr Passwort für mehr Kontosicherheit.
        </p>
      </div>
      <UpdatePasswordForm />
    </div>
  );
}
