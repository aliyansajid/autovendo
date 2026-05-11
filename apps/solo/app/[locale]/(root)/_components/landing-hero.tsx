"use client";

import { useTranslations } from "next-intl";
import { SearchForm } from "./search-form";
import { Button } from "@repo/ui/src/components/button";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";

export function LandingHero() {
  const t = useTranslations("HomePage.hero");

  return (
    <section className="relative bg-linear-to-b from-primary to-primary/90 text-white overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-white/5 to-transparent skew-x-12 transform translate-x-1/4" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

      <div className="w-full max-w-285 mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium tracking-wide uppercase">
              {t("title").split(".")[0]}
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
              {t("title")}
            </h1>
            <div className="space-y-4 text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl">
              {t("description").split("\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 font-bold px-8 h-14 text-lg">
                <Link href="/signup">
                  {t("cta")}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -inset-4 bg-white/10 blur-2xl rounded-3xl" />
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-1 bg-linear-to-r from-white/20 to-transparent">
                 <SearchForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
