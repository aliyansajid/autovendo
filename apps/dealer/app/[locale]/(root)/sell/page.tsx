import { Badge } from "@repo/ui/src/components/badge";
import { Button } from "@repo/ui/src/components/button";
import { Card, CardContent } from "@repo/ui/src/components/card";
import { Separator } from "@repo/ui/src/components/separator";
import {
  Check,
  Car,
  Camera,
  Sun,
  Zap,
  MessageSquare,
  ClipboardList,
  BarChart3,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";

export default async function SellPage() {
  const t = await getTranslations("SellPage");

  return (
    <>
      <section className="relative w-full bg-[url('/sell-bg.jpeg')] bg-cover bg-position-[80%_20%]">
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 max-w-285 mx-auto px-4 py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {t("hero.title")}
          </h1>

          <p className="text-lg text-white/90 mb-8 font-medium">
            {t("hero.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild>
              <Link href="/dashboard/vehicles/new">{t("hero.ctaList")}</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/pricing">{t("hero.ctaPricing")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="max-w-285 mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
          {t("reach.title")}&nbsp;
          <span className="inline-block border-b-4 border-primary pb-1">
            {t("reach.titleHighlight")}
          </span>
          &nbsp;{t("reach.titleSuffix")}
        </h2>

        <Card className="max-w-2xl mx-auto">
          <CardContent className="space-y-6 text-center">
            <Users className="size-24 mx-auto text-primary" strokeWidth={1} />

            <div className="space-y-1">
              <h3 className="text-xl md:text-2xl font-bold">
                {t("reach.cardTitle")}
              </h3>
              <p className="text-sm text-muted-foreground font-semibold uppercase">
                {t("reach.cardSubtitle")}
              </p>
            </div>

            <p className="text-muted-foreground max-w-lg mx-auto">
              {t("reach.cardDescription")}
            </p>

            <Badge
              variant="secondary"
              className="px-3 py-1 text-sm font-medium"
            >
              {t("reach.badge")}
            </Badge>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href="/dashboard/vehicles/new">
                  {t("reach.ctaFirst")}
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/how-it-works">{t("reach.ctaHow")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="bg-secondary">
        <div className="max-w-285 mx-auto px-4 py-12">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
              {t("advantages.title")}&nbsp;
              <span className="inline-block border-b-4 border-primary pb-1">
                {t("advantages.titleHighlight")}
              </span>
            </h2>

            <div className="grid md:grid-cols-2 gap-x-12 gap-y-12">
              <div className="space-y-6">
                <div className="flex flex-col gap-3">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-primary">
                    <Check />
                    {t("advantages.performanceTitle")}
                  </h3>
                </div>

                <Separator />

                <ul className="space-y-4">
                  <FeatureItem isIncluded={true} text={t("advantages.features.leads")} />
                  <FeatureItem isIncluded={true} text={t("advantages.features.reach")} />
                  <FeatureItem isIncluded={true} text={t("advantages.features.regional")} />
                  <FeatureItem isIncluded={true} text={t("advantages.features.brand")} />
                </ul>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col gap-3">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-primary">
                    <Check />
                    {t("advantages.efficiencyTitle")}
                  </h3>
                </div>

                <Separator />

                <ul className="space-y-4">
                  <FeatureItem isIncluded={true} text={t("advantages.features.sync")} />
                  <FeatureItem isIncluded={true} text={t("advantages.features.smart")} />
                  <FeatureItem isIncluded={true} text={t("advantages.features.tracking")} />
                  <FeatureItem isIncluded={true} text={t("advantages.features.leads2")} />
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-285 mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
          {t("services.title")}&nbsp;
          <span className="inline-block border-b-4 border-primary pb-1">
            {t("services.titleHighlight")}
          </span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          <ServiceDetail
            title={t("services.sync.title")}
            description={t("services.sync.description")}
            icon={BarChart3}
          />

          <ServiceDetail
            title={t("services.autoFill.title")}
            description={t("services.autoFill.description")}
            icon={ClipboardList}
          />

          <ServiceDetail
            title={t("services.compliance.title")}
            description={t("services.compliance.description")}
            icon={Zap}
          />

          <ServiceDetail
            title={t("services.leads.title")}
            description={t("services.leads.description")}
            icon={MessageSquare}
          />
        </div>
      </section>

      <section className="bg-secondary px-4 py-12">
        <div className="max-w-285 mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
            {t("photos.title")}&nbsp;
            <span className="inline-block border-b-4 border-primary pb-1">
              {t("photos.titleHighlight")}
            </span>
            &nbsp;{t("photos.titleSuffix")}
          </h2>

          <div className="flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-24">
            <div className="w-full max-w-[300px]">
              <div className="aspect-square bg-white rounded-3xl p-8 shadow-xl flex items-center justify-center rotate-3">
                <Camera className="size-32 text-primary" strokeWidth={1} />
              </div>
            </div>

            <div className="w-full md:w-1/2 space-y-8">
              <PhotoTip
                number={1}
                title={t("photos.tip1Title")}
                description={t("photos.tip1Description")}
                icon={Sun}
              />
              <PhotoTip
                number={2}
                title={t("photos.tip2Title")}
                description={t("photos.tip2Description")}
                icon={Camera}
              />
              <PhotoTip
                number={3}
                title={t("photos.tip3Title")}
                description={t("photos.tip3Description")}
                icon={Car}
              />
              <p className="text-sm text-muted-foreground italic pl-12">
                {t("photos.expertTip")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-285 mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">
          {t("cta.title")}&nbsp;
          <span className="inline-block border-b-4 border-primary pb-1">
            {t("cta.titleHighlight")}
          </span>
          &nbsp;{t("cta.titleSuffix")}
        </h2>

        <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
          <div className="space-y-2">
            <h3 className="text-xl md:text-2xl font-bold">
              {t("cta.subtitle")}
            </h3>
            <p className="text-lg text-muted-foreground font-medium uppercase">
              {t("cta.subtitleBadge")}
            </p>
          </div>
          <p className="text-muted-foreground text-lg max-w-lg">
            {t("cta.description")}
          </p>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/dashboard/vehicles/new">{t("cta.ctaStart")}</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/contact">{t("cta.ctaContact")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function PhotoTip({
  number,
  title,
  description,
  icon: Icon,
}: {
  number: number;
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="flex gap-4">
      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center shrink-0 font-bold mt-1">
        {number}
      </div>
      <div>
        <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
          <Icon className="size-5 text-primary" />
          {title}
        </h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function ServiceDetail({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="flex flex-col items-center">
      <Icon className="size-16 text-primary mb-4" strokeWidth={1} />
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function FeatureItem({
  isIncluded,
  text,
}: {
  isIncluded: boolean;
  text: string;
}) {
  return (
    <li className={`flex gap-3 ${!isIncluded ? "text-muted-foreground" : ""}`}>
      <div
        className={`${
          isIncluded ? "bg-green-100" : "bg-muted"
        } rounded-full p-1 size-6 flex items-center justify-center`}
      >
        <Check className="size-4 text-green-700" strokeWidth={3} />
      </div>
      <span className="text-sm md:text-base">{text}</span>
    </li>
  );
}
