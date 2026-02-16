import { LoginForm } from "@/components/auth/login-form";
import { Car } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center py-12 pb-16 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2 text-2xl font-bold text-primary mb-2">
            <Car className="h-8 w-8" />
            Autovendo
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Melden Sie sich bei Ihrem Konto an
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Geben Sie unten Ihre E-Mail-Adresse ein, um sich bei Ihrem Konto
            anzumelden
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
