"use client";

import { Card, CardContent } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/src/components/badge";
import { User, Store, Check, ArrowRight, type LucideIcon } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

interface SellAudienceCardProps {
  icon: LucideIcon;
  badge: string;
  title: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
}

export const HomeSell = () => {
  const t = useTranslations("HomeSell");

  return (
    <section className="bg-secondary">
      <div className="w-full max-w-285 mx-auto px-4 py-12">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl font-bold mb-3">{t("title")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto font-semibold">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SellAudienceCard
            icon={User}
            badge={t("private.badge")}
            title={t("private.title")}
            description={t("private.description")}
            features={[
              t("private.feature1"),
              t("private.feature2"),
              t("private.feature3"),
            ]}
            cta={t("private.cta")}
            href="/sell"
          />

          <SellAudienceCard
            icon={Store}
            badge={t("dealer.badge")}
            title={t("dealer.title")}
            description={t("dealer.description")}
            features={[
              t("dealer.feature1"),
              t("dealer.feature2"),
              t("dealer.feature3"),
            ]}
            cta={t("dealer.cta")}
            href="/pricing"
          />
        </div>
      </div>
    </section>
  );
};

const SellAudienceCard = ({
  icon: Icon,
  badge,
  title,
  description,
  features,
  cta,
  href,
}: SellAudienceCardProps) => {
  return (
    <Card className="flex flex-col h-full">
      <CardContent className="flex flex-col h-full gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-full shrink-0">
            <Icon className="size-7 text-primary" />
          </div>
          <Badge className="px-3 py-1 text-sm font-bold">{badge}</Badge>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>

        <ul className="space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex gap-3 items-start">
              <div className="bg-primary/10 rounded-full p-1 size-6 flex items-center justify-center shrink-0">
                <Check className="size-4 text-primary" strokeWidth={3} />
              </div>
              <span className="text-sm md:text-base">{feature}</span>
            </li>
          ))}
        </ul>

        <Button asChild className="w-full mt-auto">
          <Link href={href}>
            {cta}
            <ArrowRight />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};
