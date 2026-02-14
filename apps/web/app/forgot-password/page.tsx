import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Car } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <div className="flex items-center justify-center py-12 pb-16 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2 text-2xl font-bold text-primary mb-2">
            <Car className="h-8 w-8" />
            Autovendo
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Passwort vergessen</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.
          </p>
        </div>

        <ForgotPasswordForm />
      </div>
    </div>
  );
}
