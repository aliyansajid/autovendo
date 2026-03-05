import Image from "next/image";
import { LoginForm } from "../_components/login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex self-center">
          <Image src="/logo.svg" alt="Logo" width={250} height={250} />
        </Link>
        <LoginForm />
      </div>
    </div>
  );
}
