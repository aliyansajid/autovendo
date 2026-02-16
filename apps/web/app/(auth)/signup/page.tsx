import { SignupForm } from "@/components/auth/signup-form";
import Link from "next/link";
import { Car } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="flex items-center justify-center py-12 pb-16 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2 text-2xl font-bold text-primary mb-2">
            <Car className="h-8 w-8" />
            Autovendo
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Konto erstellen</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Geben Sie unten Ihre E-Mail-Adresse ein, um Ihr Konto zu erstellen
          </p>
        </div>

        <SignupForm />

        <p className="px-8 text-center text-sm text-muted-foreground">
          Indem Sie auf Weiter klicken, stimmen Sie unseren&nbsp;
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-primary"
          >
            Nutzungsbedingungen
          </Link>
          &nbsp;und&nbsp;
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-primary"
          >
            Datenschutzrichtlinien
          </Link>
          &nbsp;zu.
        </p>
      </div>
    </div>
  );
}
