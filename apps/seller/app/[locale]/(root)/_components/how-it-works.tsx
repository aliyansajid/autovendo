"use client";

import { UserPlus, CreditCard, Car, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";

const icons = [UserPlus, CreditCard, Car, MessageCircle];

export function HowItWorks() {
  const t = useTranslations("HowItWorksSection");

  const steps = [
    { icon: icons[0], title: t("step1.title"), description: t("step1.description") },
    { icon: icons[1], title: t("step2.title"), description: t("step2.description") },
    { icon: icons[2], title: t("step3.title"), description: t("step3.description") },
    { icon: icons[3], title: t("step4.title"), description: t("step4.description") },
  ];

  return (
    <section className="bg-muted/50 py-16">
      <div className="w-full max-w-285 mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold">{t("title")}</h2>
          <p className="text-muted-foreground mt-2">{t("subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="flex flex-col items-center text-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
