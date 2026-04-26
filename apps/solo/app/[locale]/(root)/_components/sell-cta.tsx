"use client";

import { Link } from "@/i18n/routing";
import { Button } from "@repo/ui/src/components/button";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { useTranslations } from "next-intl";

export function SellCta() {
  const t = useTranslations("SellCta");

  return (
    <section className="w-full max-w-285 mx-auto px-4 py-16">
      <div className="rounded-2xl bg-primary px-8 py-12 md:px-16 md:py-14 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col gap-4 text-white max-w-lg">
          <h2 className="text-2xl md:text-3xl font-bold leading-tight">{t("title")}</h2>
          <p className="text-white/75 text-sm leading-relaxed">{t("subtitle")}</p>
          <ul className="flex flex-col gap-2">
            {["free", "fast", "direct"].map((key) => (
              <li key={key} className="flex items-center gap-2 text-sm text-white/90">
                <BadgeCheck className="w-4 h-4 shrink-0 text-white" />
                {t(`perk.${key}`)}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
          <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold">
            <Link href="/signup">
              {t("cta")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
