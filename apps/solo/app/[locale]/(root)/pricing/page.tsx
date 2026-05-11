import type { Metadata } from "next";
import { buildMetadata, PAGE_META } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { Separator } from "@repo/ui/src/components/separator";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@repo/ui/src/components/button";
import { Link } from "@/i18n/routing";
import { Badge } from "@repo/ui/src/components/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@repo/ui/src/components/card";
import { getTranslations } from "next-intl/server";
import { formatPrice } from "@/lib/helpers/format";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  return buildMetadata(locale, "/pricing", PAGE_META.pricing);
}

export default async function PricingPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const t = await getTranslations("PricingPage");

  const pricingSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "AutoVendo Solo Pricing",
    description: "Simple and transparent pricing for private car sellers in Switzerland.",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        item: {
          "@type": "Offer",
          name: "Standard",
          price: 19,
          priceCurrency: "CHF",
        },
      },
      {
        "@type": "ListItem",
        position: 2,
        item: {
          "@type": "Offer",
          name: "Best Value",
          price: 49,
          priceCurrency: "CHF",
        },
      },
    ],
  };

  return (
    <>
      <JsonLd data={pricingSchema} />
      <div className="bg-linear-to-r from-primary to-primary/80">
        <div className="w-full max-w-285 mx-auto px-4 py-12">
          <div className="text-center text-white space-y-4">
            <h1 className="text-2xl md:text-4xl font-bold">{t("title")}</h1>
            <p className="text-base md:text-lg max-w-3xl mx-auto">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-285 mx-auto py-12 px-4 space-y-16">
        {/* Pricing Cards */}
        <div className="flex flex-col md:flex-row justify-center items-center md:items-stretch gap-8 max-w-5xl mx-auto">
          {/* Standard Plan */}
          <Card className="w-full max-w-sm flex flex-col border-2 transition-all hover:border-primary/50">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold">{t("standard.name")}</CardTitle>
              <div className="pt-4">
                <span className="text-4xl font-bold text-primary">{formatPrice(19)}</span>
              </div>
              <CardDescription className="text-lg font-medium pt-2">
                {t("standard.duration")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pt-6">
              <ul className="space-y-4">
                {(t.raw("standard.features") as string[]).map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground">
                    <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="pt-6">
              <Button asChild className="w-full text-lg py-6" variant="outline">
                <Link href="/signup">
                  {t("standard.button")}
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Best Value Plan (Highlighted) */}
          <Card className="w-full max-w-sm md:scale-110 flex flex-col border-2 border-green-500 shadow-2xl z-10 bg-linear-to-b from-green-50/30 to-white dark:from-green-950/10 dark:to-background">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Badge className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 text-sm font-bold shadow-lg">
                {t("bestValue.badge")}
              </Badge>
            </div>
            <CardHeader className="text-center pb-2 pt-8">
              <CardTitle className="text-3xl font-black text-green-700 dark:text-green-400">
                ⭐ {t("bestValue.name")}
              </CardTitle>
              <div className="pt-4">
                <span className="text-5xl font-black text-primary">{formatPrice(49)}</span>
              </div>
              <CardDescription className="text-xl font-bold text-green-700 dark:text-green-400 pt-2">
                {t("bestValue.duration")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pt-6">
              <ul className="space-y-4">
                {(t.raw("bestValue.features") as string[]).map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 font-medium">
                    <CheckCircle2 className="size-6 text-green-600 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="pt-6 pb-8">
              <Button asChild className="w-full text-xl py-8 bg-green-600 hover:bg-green-700 text-white shadow-xl hover:scale-105 transition-transform">
                <Link href="/signup">
                  {t("bestValue.button")}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Psychological Triggers */}
        <div className="max-w-4xl mx-auto space-y-12 pt-8">
          {/* Trust & Safety Section */}
          <section className="bg-muted/30 border rounded-2xl p-8 md:p-12 space-y-8">
            <div className="flex items-center gap-4 border-b pb-6">
              <ShieldCheck className="size-10 text-primary" />
              <h2 className="text-2xl md:text-3xl font-bold">{t("trustSafety.title")}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              {(t.raw("trustSafety.features") as string[]).map((feature, i) => (
                <div key={i} className="flex items-start gap-4">
                  <CheckCircle2 className="size-6 text-green-600 shrink-0 mt-1" />
                  <p className="text-xl font-medium leading-relaxed">{feature}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Urgency Trigger */}
          <section className="text-center space-y-6 py-8">
            <div className="inline-flex items-center gap-3 bg-primary/10 text-primary px-6 py-3 rounded-full font-bold animate-pulse">
              <Zap className="size-6 fill-current" />
              <span className="text-xl">{t("urgency.text")}</span>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
