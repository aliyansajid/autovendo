"use client";

import Link from "next/link";
import { Badge } from "@repo/ui/src/components/badge";
import { Button } from "@repo/ui/src/components/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@repo/ui/src/components/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@repo/ui/src/components/tabs";
import { CheckCircle2 } from "lucide-react";
import { formatPrice } from "@repo/ui/lib/helpers/format";
import { useTranslations } from "next-intl";

type Plan = {
  name: string;
  description: string;
  price: number;
  limits: { vehicles: number };
  popular: boolean;
  hasTrial: boolean;
  trialDays: number;
};

type Props = {
  plans: readonly Plan[];
  locale: string;
  authUrl: string;
};

const PRIVATE_PLANS = [
  { key: "standard", price: 19, popular: false },
  { key: "bestValue", price: 49, popular: true },
] as const;

export function PricingTabs({ plans, locale, authUrl }: Props) {
  const t = useTranslations("PricingPage");
  const loginUrl = `${authUrl}/${locale}/login`;

  return (
    <section className="space-y-10">
      <h2 className="text-2xl font-bold text-center">{t("choosePlan")}</h2>

      <Tabs defaultValue="dealer" className="space-y-10">
        <TabsList className="mx-auto">
          <TabsTrigger
            value="dealer"
            className="font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            {t("tabs.dealers")}
          </TabsTrigger>
          <TabsTrigger
            value="private"
            className="font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            {t("tabs.private")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dealer">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={plan.popular ? "border-primary" : ""}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold">
                      {t.has(`plans.${plan.name.toLowerCase()}`)
                        ? t(`plans.${plan.name.toLowerCase()}`)
                        : plan.name}
                    </CardTitle>
                    {plan.popular && <Badge>{t("popular")}</Badge>}
                  </div>
                  <CardDescription>
                    {t.has(`planDescription.${plan.name.toLowerCase()}`)
                      ? t(`planDescription.${plan.name.toLowerCase()}`)
                      : plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-primary">
                      {formatPrice(plan.price)}
                    </span>
                    <span className="text-muted-foreground">
                      / {t("month")}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-foreground">
                        {plan.limits.vehicles} {t("vehiclesIncluded")}
                      </span>
                    </div>
                    {plan.hasTrial && plan.trialDays && (
                      <div className="flex items-start gap-2 text-green-600 font-medium">
                        <CheckCircle2 className="size-5 shrink-0 mt-0.5" />
                        <span>
                          {t("trialDaysLabel", { days: plan.trialDays })}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link href={loginUrl}>{t("getStarted")}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="private">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {PRIVATE_PLANS.map((plan) => (
              <Card
                key={plan.key}
                className={plan.popular ? "border-primary shadow-lg" : ""}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold">
                      {t(`privateSeller.${plan.key}.title`)}
                    </CardTitle>
                    {plan.popular && (
                      <Badge className="bg-primary text-primary-foreground">
                        {t(`privateSeller.${plan.key}.badge`)}
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    {t(`privateSeller.${plan.key}.description`)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-primary">
                      CHF {plan.price}
                    </span>
                    <span className="text-muted-foreground">
                      / {t(`privateSeller.${plan.key}.period`)}
                    </span>
                  </div>
                  <ul className="space-y-3">
                    {(
                      t.raw(`privateSeller.${plan.key}.features`) as string[]
                    ).map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link href={loginUrl}>
                      {t(`privateSeller.${plan.key}.button`)}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
