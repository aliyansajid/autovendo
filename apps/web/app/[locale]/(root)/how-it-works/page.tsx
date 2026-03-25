import { Button } from "@repo/ui/src/components/button";
import {
  FileText,
  UserPlus,
  UserCircle,
  CreditCard,
  PlusCircle,
  ArrowRight,
  Download,
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
      cta: (
        <Button variant="outline" className="mt-4" asChild>
          <Link
            href="/The-AV-Final Autovendo Vertrag-pdf.pdf"
            download="The-AV-Final Autovendo Vertrag-pdf.pdf"
          >
            <Download />
            {t("cta.download")}
          </Link>
        </Button>
      ),
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
      <div className="bg-linear-to-r from-primary to-primary/80">
        <div className="w-full max-w-285 mx-auto px-4 py-12">
          <div className="text-center text-white space-y-4">
            <h1 className="text-2xl md:text-4xl font-bold">{t("title")}</h1>
            <p className="text-base md:text-lg max-w-3xl mx-auto">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </div>

      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="relative space-y-24">
          {/* Vertical Line - stop before the last box by using a better height control */}
          <div className="absolute left-[31px] top-8 bottom-32 w-px bg-slate-200 hidden md:block" />
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative flex flex-col md:flex-row gap-8 md:gap-16 items-start"
            >
              <div className="relative z-10 flex items-center justify-center w-[64px] h-[64px] rounded-2xl bg-white border border-border shadow-sm text-primary shrink-0 transition-all hover:scale-105 hover:shadow-md">
                <step.icon size={32} strokeWidth={1.5} />
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shadow-lg border-2 border-white">
                  {index + 1}
                </div>
              </div>

              <div className="space-y-4 pt-1 group">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold tracking-tight group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed max-w-2xl">
                    {step.description}
                  </p>
                </div>
                {step.cta}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-secondary p-8 rounded-xl text-center space-y-4">
          <h3 className="text-xl font-bold">Ready to grow your dealership?</h3>
          <p className="text-muted-foreground">
            Join the Swiss platform designed specifically for professional car
            dealers.
          </p>
          <Button asChild>
            <Link href="/contact">
              {t("cta.contact")}
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
