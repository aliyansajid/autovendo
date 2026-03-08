"use client";

import { UpdatePasswordForm } from "../../_components/update-password-form";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Einstellungen</h1>
        <p className="text-muted-foreground">
          Verwalten Sie Ihr Profil und Ihre Sicherheitseinstellungen.
        </p>
      </div>

      <UpdatePasswordForm />
    </div>
  );
}
