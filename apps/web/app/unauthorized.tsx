import Link from "next/link";
import { Button } from "@repo/ui/src/components/button";
import { Lock } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <Lock className="h-10 w-10 text-muted-foreground" />
      </div>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">Access Denied</h1>
      <p className="mt-2 text-muted-foreground">
        Please log in to your account to access the dashboard.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild variant="default">
          <Link href="/login">Login</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Go to Home</Link>
        </Button>
      </div>
    </main>
  );
}
