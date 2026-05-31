import type { Metadata } from "next";
import { buildMetadata, PAGE_META } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { CheckCircle2, ShieldCheck } from "lucide-react";
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
import { formatPrice } from "@repo/ui/lib/helpers/format";

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
    name: "AutoSolo Pricing",
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

      {/* Hero */}
      <div className="bg-linear-to-r from-primary to-primary/80">
        <div className="w-full max-w-285 mx-auto px-4 py-12">
          <div className="text-center text-white space-y-4">
            <h1 className="text-2xl md:text-4xl font-bold">{t("title")}</h1>
            <p className="text-base md:text-lg max-w-3xl mx-auto opacity-90">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-285 mx-auto py-12 px-4 space-y-12">

        {/* Pricing Cards */}
        <div className="flex flex-col md:flex-row justify-center items-center md:items-stretch gap-8 max-w-2xl mx-auto">

          {/* Standard */}
          <Card className="w-full flex flex-col border-2 transition-all hover:border-primary/50">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl font-bold">{t("standard.name")}</CardTitle>
              <div className="pt-3">
                <span className="text-3xl font-bold text-primary">{formatPrice(19)}</span>
              </div>
              <CardDescription className="text-sm font-medium pt-1">
                {t("standard.duration")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pt-4">
              <ul className="space-y-3">
                {(t.raw("standard.features") as string[]).map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="pt-4">
              <Button asChild className="w-full" variant="outline">
                <Link href="/signup">{t("standard.button")}</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Best Value */}
          <Card className="w-full relative flex flex-col border-2 border-primary shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="px-3 py-0.5 text-xs font-semibold">
                {t("bestValue.badge")}
              </Badge>
            </div>
            <CardHeader className="text-center pb-2 pt-8">
              <CardTitle className="text-xl font-bold">{t("bestValue.name")}</CardTitle>
              <div className="pt-3">
                <span className="text-3xl font-bold text-primary">{formatPrice(49)}</span>
              </div>
              <CardDescription className="text-sm font-medium pt-1">
                {t("bestValue.duration")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pt-4">
              <ul className="space-y-3">
                {(t.raw("bestValue.features") as string[]).map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="pt-4">
              <Button asChild className="w-full">
                <Link href="/signup">{t("bestValue.button")}</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Trust & Safety */}
        <div className="max-w-2xl mx-auto">
          <section className="bg-muted/30 border rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-5 text-primary shrink-0" />
              <h2 className="text-base font-semibold">{t("trustSafety.title")}</h2>
            </div>
            <ul className="space-y-3">
              {(t.raw("trustSafety.features") as string[]).map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Urgency — static, no animation */}
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">{t("urgency.text")}</p>
        </div>

      </div>
    </>
  );
}
