import { Button } from "@repo/ui/src/components/button";
import {
  FileText,
  UserPlus,
  UserCircle,
  CreditCard,
  PlusCircle,
  ArrowRight,
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
        <Button asChild variant="outline" size="sm" className="mt-4">
          <a href="/The-AV-Final Autovendo Vertrag-pdf.pdf" download="The-AV-Final Autovendo Vertrag-pdf.pdf">
            {t("cta.download")}
          </a>
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
      <section className="relative w-full bg-[#0F172A] py-16 sm:py-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-primary/20 to-transparent blur-3xl opacity-50" />
        
        <div className="relative z-10 max-w-285 mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white mb-6 tracking-tight">
            {t("title")}
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-medium">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-20 sm:py-32">
        <div className="relative space-y-24">
          {/* Vertical Line */}
          <div className="absolute left-[31px] top-12 bottom-12 w-px bg-slate-200 hidden md:block" />

          {steps.map((step, index) => (
            <div key={index} className="relative flex flex-col md:flex-row gap-8 md:gap-16 items-start">
              {/* Step Number/Icon Bubble */}
              <div className="relative z-10 flex items-center justify-center w-[64px] h-[64px] rounded-2xl bg-white border border-slate-200 shadow-sm text-primary shrink-0 transition-all hover:scale-105 hover:shadow-md">
                <step.icon size={32} strokeWidth={1.5} />
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shadow-lg border-2 border-white">
                  {index + 1}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4 pt-2 group">
                <div className="space-y-2">
                   <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
                    {step.description}
                  </p>
                </div>
                {step.cta}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-285 mx-auto px-4 mb-20 sm:mb-32">
        <div className="bg-primary rounded-[3rem] p-8 sm:p-20 text-white text-center space-y-10 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_5s_infinite_linear]" />
          
          <div className="space-y-4 relative z-10">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
              Ready to grow your dealership?
            </h2>
            <p className="text-white/80 text-lg max-w-xl mx-auto">
              Join the Swiss platform designed specifically for professional car dealers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Button asChild size="lg" variant="secondary" className="px-10 py-7 rounded-2xl font-bold text-lg transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.35)] hover:-translate-y-1">
              <Link href="/contact">
                {t("cta.contact")}
                <ArrowRight className="ml-2 size-6" />
              </Link>
            </Button>
            <Button variant="ghost" size="lg" className="px-10 py-7 rounded-2xl font-bold text-lg hover:bg-white/10 text-white border border-white/20" asChild>
              <a href="/The-AV-Final Autovendo Vertrag-pdf.pdf" download="The-AV-Final Autovendo Vertrag-pdf.pdf">
                  {t("cta.download")}
              </a>
            </Button>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: -250% 0; }
          100% { background-position: 250% 0; }
        }
      `}</style>
    </>
  );
}
