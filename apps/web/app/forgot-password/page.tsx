import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import Link from "next/link";
import { Car } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2 text-2xl font-bold text-primary mb-2">
            <Car className="h-8 w-8" />
            Autovendo
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Forgot Password
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Enter your email address and we will send you a link to reset your
            password.
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-gray-100">
          <ForgotPasswordForm />
        </div>

        <p className="px-8 text-center text-sm text-muted-foreground">
          By clicking continue, you agree to our{" "}
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-primary"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-primary"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
