import { Link } from "@/i18n/routing";
import { Button } from "@repo/ui/src/components/button";
import { Lock } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function UnauthorizedPage() {
  const t = await getTranslations("Unauthorized");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <Lock className="h-10 w-10 text-muted-foreground" />
      </div>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-2 text-muted-foreground">{t("description")}</p>
      <div className="mt-8 flex gap-3">
        <Button asChild variant="default">
          <Link href="/login">{t("login")}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">{t("goHome")}</Link>
        </Button>
      </div>
    </main>
  );
}
