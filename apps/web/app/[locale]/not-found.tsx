import { MoveLeft, CarFront, AlertCircle } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("NotFound");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function LocaleNotFound() {
  const t = await getTranslations("NotFound");

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4 py-20 text-center overflow-hidden bg-background">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -z-10 animate-pulse" />

      <div className="w-full max-w-lg">
        <div className="relative bg-background/60 backdrop-blur-2xl border border-border/50 rounded-3xl p-10 md:p-16 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] transition-all duration-700 hover:shadow-[0_48px_96px_-24px_rgba(0,0,0,0.15)] flex flex-col items-center group">
          <div className="relative flex items-center justify-center w-24 h-24 rounded-2xl bg-primary/10 mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-inner">
            <CarFront className="w-12 h-12 text-primary" />
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-background border shadow-sm flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-destructive animate-pulse" />
            </div>
          </div>

          <div className="space-y-4 mb-10">
            <h1 className="text-8xl md:text-9xl font-black tracking-tighter bg-linear-to-b from-foreground to-foreground/30 bg-clip-text text-transparent select-none">
              404
            </h1>

            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                {t("title")}
              </h2>
              <p className="text-muted-foreground text-lg max-w-xs mx-auto leading-relaxed">
                {t("description")}
              </p>
            </div>
          </div>

          <Button
            className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] group"
            asChild
          >
            <Link href="/">
              <MoveLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              {t("button")}
            </Link>
          </Button>
        </div>

        <div className="mt-12 flex items-center justify-center gap-4 text-sm font-medium tracking-[0.2em] text-muted-foreground uppercase opacity-40 select-none">
          <span className="h-px w-8 bg-current" />
          <span>AutoVendo.ch</span>
          <span className="h-px w-8 bg-current" />
        </div>
      </div>
    </div>
  );
}
