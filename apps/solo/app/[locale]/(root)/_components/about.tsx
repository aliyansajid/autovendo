"use client";

import {
  Handshake,
  Zap,
  ShieldCheck,
  CircleDollarSign,
  LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface FeatureItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const About = () => {
  const t = useTranslations("About");

  return (
    <section className="py-12">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold mb-4 text-foreground">
          {t("title")}
        </h2>

        <p className="text-xl font-semibold text-primary mb-6">
          {t("subtitle")}
        </p>

        <p className="text-lg text-muted-foreground w-full max-w-3xl mx-auto mb-12">
          {t("description")}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureItem
            icon={Zap}
            title={t("features.efficiency.title")}
            description={t("features.efficiency.description")}
          />
          <FeatureItem
            icon={Handshake}
            title={t("features.humanity.title")}
            description={t("features.humanity.description")}
          />
          <FeatureItem
            icon={ShieldCheck}
            title={t("features.reliability.title")}
            description={t("features.reliability.description")}
          />
          <FeatureItem
            icon={CircleDollarSign}
            title={t("features.transparency.title")}
            description={t("features.transparency.description")}
          />
        </div>
      </div>
    </section>
  );
};

const FeatureItem = ({ icon: Icon, title, description }: FeatureItemProps) => {
  return (
    <div className="flex flex-col items-center text-center space-y-4">
      <div className="bg-primary/10 p-4 rounded-full">
        <Icon className="size-8 text-primary" />
      </div>
      <h3 className="text-base font-bold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};
