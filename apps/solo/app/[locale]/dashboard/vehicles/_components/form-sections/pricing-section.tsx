"use client";

import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Check, Star } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";

export function PricingSection() {
  const t = useTranslations("PricingPage");
  const { setValue, watch } = useFormContext();
  const selectedPlan = watch("planId");

  const plans = [
    {
      id: "standard",
      title: t("standard.title"),
      price: "19",
      duration: t("standard.duration"),
      features: [
        t("standard.feature1"),
        t("standard.feature2"),
        t("standard.feature3"),
      ],
      buttonText: t("standard.button"),
      color: "blue",
    },
    {
      id: "best_value",
      title: t("bestValue.title"),
      price: "49",
      duration: t("bestValue.duration"),
      features: [
        t("bestValue.feature1"),
        t("bestValue.feature2"),
        t("bestValue.feature3"),
        t("bestValue.feature4"),
      ],
      buttonText: t("bestValue.button"),
      highlight: true,
      color: "green",
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select your listing plan</CardTitle>
          <CardDescription>
            Choose how you want to sell your vehicle. Each listing is paid individually.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan) => {
              const isActive = selectedPlan === plan.id;
              
              return (
                <div
                  key={plan.id}
                  onClick={() => setValue("planId", plan.id, { shouldDirty: true })}
                  className={cn(
                    "relative cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-lg",
                    isActive 
                      ? plan.id === "best_value" ? "border-green-500 bg-green-50/30 shadow-md" : "border-primary bg-primary/5 shadow-md"
                      : "border-border hover:border-muted-foreground/50",
                    plan.highlight && !isActive && "bg-muted/10"
                  )}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 shadow-sm flex items-center gap-1">
                        <Star className="size-3 fill-current" />
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <div className="flex flex-col h-full">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold">{plan.title}</h3>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold tracking-tight">CHF {plan.price}</span>
                        <span className="text-sm font-medium text-muted-foreground">/{plan.duration}</span>
                      </div>
                    </div>

                    <ul className="mb-6 space-y-3 flex-1">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className={cn("size-4 mt-0.5 shrink-0", plan.id === "best_value" ? "text-green-600" : "text-primary")} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className={cn(
                      "w-full rounded-xl py-2.5 text-center font-bold transition-colors",
                      isActive 
                        ? plan.id === "best_value" ? "bg-green-600 text-white" : "bg-primary text-white"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {isActive ? "Selected" : "Select Plan"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 flex items-start gap-3">
        <Check className="size-5 shrink-0 mt-0.5" />
        <p>
          <strong>VIN Security:</strong> Your listing is tied to the VIN you entered. You can lower the price or update photos anytime, but you cannot change the car's identity once published.
        </p>
      </div>
    </div>
  );
}
