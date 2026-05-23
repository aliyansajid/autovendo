"use client";

import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { CheckCircle2 } from "lucide-react";

export function PricingSection() {
  const t = useTranslations("PricingPage");
  const { setValue, watch } = useFormContext();
  const selectedPlan = watch("planId");

  const plans = [
    {
      id: "standard",
      title: t("standard.name"),
      price: "19",
      duration: t("standard.duration"),
      description: t("standard.description"),
      features: [
        t("standard.features.0"),
        t("standard.features.1"),
        t("standard.features.2"),
      ],
      popular: false,
    },
    {
      id: "best_value",
      title: t("bestValue.name"),
      price: "49",
      duration: t("bestValue.duration"),
      description: t("bestValue.description"),
      features: [
        t("bestValue.features.0"),
        t("bestValue.features.1"),
        t("bestValue.features.2"),
        t("bestValue.features.3"),
      ],
      popular: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-base font-semibold">{t("selectPlanTitle")}</h2>
        <p className="text-sm text-muted-foreground">{t("selectPlanSubtitle")}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          return (
            <Card
              key={plan.id}
              className={`cursor-pointer ${plan.popular ? "border-primary" : ""}`}
              onClick={() => setValue("planId", plan.id, { shouldDirty: true })}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold">{plan.title}</CardTitle>
                  <div className="flex gap-2">
                    {isSelected && (
                      <Badge variant="outline" className="text-xs border-primary text-primary">
                        {t("selected")}
                      </Badge>
                    )}
                    {plan.popular && <Badge>{t("popular")}</Badge>}
                  </div>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-primary">CHF {plan.price}</span>
                  <span className="text-muted-foreground">/ {plan.duration}</span>
                </div>
                <div className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setValue("planId", plan.id, { shouldDirty: true })}
                >
                  {isSelected ? t("selected") : t("selectPlan")}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
