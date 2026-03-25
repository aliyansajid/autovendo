import { Button } from "@repo/ui/src/components/button";
import { Card, CardContent } from "@repo/ui/src/components/card";
import {
  FileText,
  UserPlus,
  UserCircle,
  CreditCard,
  PlusCircle,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";

export default async function HowItWorksPage() {
  const t = await getTranslations("HowItWorksPage");

  const steps = [
    {
      icon: FileText,
      title: t("steps.step1.title"),
      description: t("steps.step1.description"),
    },
    {
      icon: UserPlus,
      title: t("steps.step2.title"),
      description: t("steps.step2.description"),
    },
    {
      icon: UserCircle,
      title: t("steps.step3.title"),
      description: t("steps.step3.description"),
    },
    {
      icon: CreditCard,
      title: t("steps.step4.title"),
      description: t("steps.step4.description"),
    },
    {
      icon: PlusCircle,
      title: t("steps.step5.title"),
      description: t("steps.step5.description"),
    },
  ];

  return (
    <>
      <section className="relative w-full bg-[url('/sell-bg.jpeg')] bg-cover bg-position-[80%_20%]">
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 max-w-285 mx-auto px-4 py-16 sm:py-24 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-6">
            {t("title")}
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto font-medium">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <section className="max-w-285 mx-auto px-4 py-16 sm:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <Card className="w-full border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md transition-shadow h-full">
                <CardContent className="pt-8 text-center space-y-4 flex flex-col h-full">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                    <step.icon size={32} />
                  </div>
                  <div className="space-y-2 grow">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary/60">
                      Step {index + 1}
                    </span>
                    <h3 className="text-xl font-bold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  {index === 0 && (
                    <Button asChild className="w-full mt-4" variant="outline" size="sm">
                      <a href="/The-AV-Final Autovendo Vertrag-pdf.pdf" download="The-AV-Final Autovendo Vertrag-pdf.pdf">
                        {t("cta.download")}
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary px-4 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-2xl md:text-3xl font-bold">
            Ready to grow your dealership?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-center">
            <Button asChild size="lg">
              <Link href="/contact">{t("cta.contact")}</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="/The-AV-Final Autovendo Vertrag-pdf.pdf" download="The-AV-Final Autovendo Vertrag-pdf.pdf">
                  {t("cta.download")}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
