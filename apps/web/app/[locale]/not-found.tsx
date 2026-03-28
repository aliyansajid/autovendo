import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@repo/ui/components/button";
import { MoveLeft, CarFront, AlertCircle } from "lucide-react";

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="relative mb-8">
        <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full" />
        <div className="relative bg-background border rounded-2xl p-8 shadow-2xl flex flex-col items-center max-w-md">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6 group transition-all duration-500 hover:bg-primary/20">
            <CarFront className="w-10 h-10 text-primary transition-transform duration-500 group-hover:scale-110" />
            <AlertCircle className="absolute top-6 right-6 w-6 h-6 text-destructive animate-pulse" />
          </div>

          <h1 className="text-7xl font-black mb-2 tracking-tighter bg-linear-to-b from-foreground to-foreground/50 bg-clip-text text-transparent">
            404
          </h1>

          <h2 className="text-2xl font-bold mb-4">{t("title")}</h2>

          <p className="text-muted-foreground mb-8 leading-relaxed">
            {t("description")}
          </p>

          <Button asChild className="w-full group">
            <Link href="/">
              <MoveLeft />
              {t("button")}
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-8 text-sm text-muted-foreground flex items-center gap-2 opacity-50">
        <span className="w-1 h-1 rounded-full bg-current" />
        <span>AutoVendo.ch</span>
        <span className="w-1 h-1 rounded-full bg-current" />
      </div>
    </div>
  );
}
