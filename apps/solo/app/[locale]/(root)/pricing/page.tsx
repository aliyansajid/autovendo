import type { Metadata } from "next";
import { buildMetadata, PAGE_META } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Zap,
  Info,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@repo/ui/src/components/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@repo/ui/src/components/card";
import { Button } from "@repo/ui/src/components/button";
import { SubscribeButton } from "./_components/subscribe-button";
import { getTranslations } from "next-intl/server";
import { formatPrice } from "@/lib/helpers/format";
import { Link } from "@/i18n/routing";

interface PricingFeature {
  name: string;
  included: boolean;
}

interface PricingTier {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: PricingFeature[];
  buttonText: string;
  popular: boolean;
}

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
  const rawTiers = (await t.raw("tiers")) as PricingTier[];
  const trustSafety = await t.raw("trustSafety");
  const urgency = await t.raw("urgency");

  const tiers = rawTiers.map((tier) => ({
    ...tier,
    price: formatPrice(Number(tier.price.replace(/[^\d.-]/g, "")), locale),
  }));

  const pricingSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "AutoSolo Inserate-Pakete",
    description:
      "Faire Inserate-Pakete für private Autoverkäufer in der Schweiz – einfach und erfolgreich verkaufen",
    itemListElement: rawTiers.map((tier, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Offer",
        name: `AutoSolo ${tier.name}`,
        description: tier.description,
        price: Number(tier.price.replace(/[^\d.-]/g, "")),
        priceCurrency: "CHF",
        availability: "https://schema.org/InStock",
        url: `https://autosolo.ch/${locale}/pricing`,
        seller: {
          "@type": "Organization",
          name: "AutoSolo",
          url: "https://autosolo.ch",
        },
      },
    })),
  };

  return (
    <>
      <JsonLd data={pricingSchema} />
      <div className="bg-linear-to-b from-primary to-primary/90">
        <div className="w-full max-w-285 mx-auto px-4 py-20 md:py-32">
          <div className="text-center text-white space-y-6">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              {t("title")}
            </h1>
            <p className="text-xl md:text-2xl max-w-2xl mx-auto opacity-90 leading-relaxed">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-285 mx-auto -mt-12 md:-mt-20 pb-24 px-4">
        <section className="space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {tiers.map((tier) => (
              <Card
                key={tier.name}
                className={`flex flex-col relative overflow-hidden transition-all duration-500 hover:shadow-2xl ${
                  tier.popular
                    ? "border-primary shadow-xl ring-4 ring-primary/10 scale-105 z-10 md:py-4"
                    : "border-border/50 bg-white/50 backdrop-blur-sm"
                }`}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-0 left-0">
                    <div className="bg-primary text-primary-foreground text-xs font-bold py-2 text-center uppercase tracking-widest">
                      ⭐ {t("popular")} ⭐
                    </div>
                  </div>
                )}
                <CardHeader
                  className={`pb-8 ${tier.popular ? "pt-12" : "pt-8"}`}
                >
                  <CardTitle className="text-3xl font-extrabold">
                    {tier.name}
                  </CardTitle>
                  <CardDescription className="text-lg font-medium text-muted-foreground mt-2">
                    {tier.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-10">
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-6xl font-black ${tier.popular ? "text-primary" : "text-foreground"}`}
                    >
                      {tier.price}
                    </span>
                    {tier.period && (
                      <span className="text-xl text-muted-foreground font-semibold">
                        {tier.period}
                      </span>
                    )}
                  </div>
                  <div className="space-y-5">
                    {tier.features.map((feature: PricingFeature) => (
                      <div
                        key={feature.name}
                        className="flex items-start gap-4"
                      >
                        <div
                          className={`rounded-full p-1 ${feature.included ? "bg-primary/10" : "bg-muted"}`}
                        >
                          {feature.included ? (
                            <CheckCircle2 className="size-5 text-primary shrink-0" />
                          ) : (
                            <XCircle className="size-5 text-muted-foreground shrink-0" />
                          )}
                        </div>
                        <span
                          className={`text-lg ${
                            feature.included
                              ? "text-foreground font-semibold"
                              : "text-muted-foreground line-through"
                          }`}
                        >
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-10 pb-8 px-8">
                  <SubscribeButton
                    planName={tier.name}
                    label={tier.buttonText}
                    variant={tier.popular ? "default" : "outline"}
                    className={`w-full h-14 text-xl font-black shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] ${
                      tier.popular ? "bg-primary hover:bg-primary/90" : ""
                    }`}
                  />
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Trust & Safety Section */}
          <div className="max-w-4xl mx-auto py-16 border-y border-border/50">
            <div className="flex items-center justify-center gap-3 mb-12">
              <ShieldCheck className="size-8 text-primary" />
              <h2 className="text-3xl font-black text-center">
                {trustSafety.title}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {trustSafety.items.map((item: any, i: number) => (
                <div
                  key={i}
                  className="flex flex-col items-center text-center space-y-4"
                >
                  <div className="size-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                    <Badge className="bg-primary/10 text-primary border-none text-lg font-bold">
                      {i + 1}
                    </Badge>
                  </div>
                  <h4 className="text-xl font-bold">{item.title}</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Urgency Trigger */}
          <div className="max-w-4xl mx-auto">
            <div className="rounded-3xl bg-linear-to-r from-primary/5 via-primary/10 to-primary/5 p-12 text-center space-y-8 border border-primary/20 shadow-inner">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-primary text-white animate-pulse">
                  <Zap className="size-8 fill-current" />
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-black max-w-2xl mx-auto leading-tight">
                {urgency.title}
              </h2>
              <Button
                asChild
                size="lg"
                className="h-14 px-10 text-xl font-bold shadow-xl"
              >
                <Link href="/signup">
                  {urgency.button}
                  <ArrowRight className="ml-2 size-6" />
                </Link>
              </Button>
            </div>
          </div>

          {/* FAQ/Contact Helper */}
          <div className="max-w-xl mx-auto text-center space-y-6 opacity-60 hover:opacity-100 transition-opacity">
            <div className="flex items-center justify-center gap-2">
              <Info className="size-5" />
              <p className="text-lg font-medium">Haben Sie noch Fragen?</p>
            </div>
            <div className="flex justify-center gap-8">
              <Link
                href="/contact"
                className="hover:text-primary font-bold transition-colors"
              >
                Kontakt
              </Link>
              <Link
                href="/faq"
                className="hover:text-primary font-bold transition-colors"
              >
                FAQ
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
