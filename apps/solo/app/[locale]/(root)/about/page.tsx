import type { Metadata } from "next";
import { buildMetadata, PAGE_META } from "@/lib/seo";
import { Separator } from "@repo/ui/src/components/separator";
import { CheckCircle2 } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  return buildMetadata(locale, "/about", PAGE_META.about);
}

export default async function AboutPage() {
  const t = await getTranslations("AboutPage");

  return (
    <>
      <div className="bg-linear-to-r from-primary to-primary/80">
        <div className="w-full max-w-285 mx-auto py-12 px-4">
          <div className="text-center text-white space-y-4">
            <h1 className="text-2xl md:text-4xl font-bold">
              {t("heroTitle")}
            </h1>
            <p className="text-lg md:text-xl font-semibold">
              {t("heroSubtitle")}
            </p>
            <p className="text-base md:text-lg max-w-3xl mx-auto">
              {t("heroPlatform")}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-285 mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          <section className="space-y-6">
            <h2 className="text-2xl font-bold">{t("missionTitle")}</h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <p>{t("missionText1")}</p>
              <p className="font-semibold text-foreground">
                {t("missionText2")}
              </p>
              <p>{t("missionText3")}</p>
            </div>
          </section>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <section className="space-y-4">
              <h2 className="text-xl font-bold">{t("humanTitle")}</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>{t("humanText1")}</p>
                <p className="font-semibold text-foreground">
                  {t("humanText2")}
                </p>
                <p>{t("humanText3")}</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold">{t("reachableTitle")}</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>{t("reachableText1")}</p>
                <p>{t("reachableText2")}</p>
                <p>{t("reachableText3")}</p>
              </div>
            </section>
          </div>

          <Separator />

          <section className="space-y-6">
            <h2 className="text-2xl font-bold">{t("pricingTitle")}</h2>
            <div className="space-y-6 text-lg">
              <p className="text-muted-foreground">{t("pricingText1")}</p>
              <div>
                <p className="font-semibold mb-4">{t("pricingIntro")}</p>
                <div className="grid gap-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-primary shrink-0" />
                    <span>{t("pricingFeature1")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-primary shrink-0" />
                    <span>{t("pricingFeature2")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-primary shrink-0" />
                    <span>{t("pricingFeature3")}</span>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground">{t("pricingText2")}</p>
            </div>
          </section>

          <Separator />

          <section className="space-y-6 bg-secondary p-8 rounded-xl">
            <div>
              <h2 className="text-2xl font-bold mb-3">{t("whyTitle")}</h2>
              <p className="text-muted-foreground text-lg">{t("whyText")}</p>
            </div>

            <div className="space-y-6">
              <p className="font-semibold text-lg">{t("whyConnect")}</p>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-lg mb-2 text-primary">
                    {t("efficiencyTitle")}
                  </h3>
                  <p className="text-muted-foreground">{t("efficiencyDesc")}</p>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-2 text-primary">
                    {t("humanityTitle")}
                  </h3>
                  <p className="text-muted-foreground">{t("humanityDesc")}</p>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-2 text-primary">
                    {t("reliabilityTitle")}
                  </h3>
                  <p className="text-muted-foreground">
                    {t("reliabilityDesc")}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <p className="text-muted-foreground text-lg">
              {t("whyAllSellers")}
            </p>
          </section>

          <section className="bg-linear-to-r from-primary to-primary/80 text-white p-8 rounded-xl space-y-4">
            <h2 className="text-2xl font-bold">{t("closingTitle")}</h2>
            <p className="text-xl font-semibold">{t("closingText1")}</p>
            <p className="text-lg">{t("closingText2")}</p>
          </section>
        </div>
      </div>
    </>
  );
}
