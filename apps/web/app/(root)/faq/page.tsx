import { faqData } from "@/constants/faq-data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/src/components/accordion";
import { Button } from "@repo/ui/src/components/button";
import Link from "next/link";

export default function FaqPage() {
  return (
    <>
      <div className="bg-linear-to-r from-primary to-primary/80">
        <div className="w-full max-w-285 mx-auto px-4 py-12">
          <div className="text-center text-white space-y-4">
            <h1 className="text-2xl md:text-4xl font-bold">
              Häufig gestellte Fragen
            </h1>
            <p className="text-base md:text-lg max-w-3xl mx-auto">
              Finden Sie schnelle Antworten auf die wichtigsten Fragen rund um
              Autovendo.ch.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-12">
          {faqData.map((categoryGroup, index) => (
            <div key={index} className="space-y-6">
              <h2 className="text-2xl font-bold">{categoryGroup.category}</h2>
              <Accordion type="single" collapsible className="w-full">
                {categoryGroup.items.map((faq, faqIndex) => (
                  <AccordionItem
                    key={faqIndex}
                    value={`item-${index}-${faqIndex}`}
                  >
                    <AccordionTrigger className="flex items-center text-base lg:text-lg font-semibold hover:no-underline hover:text-primary transition-colors">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-secondary p-8 rounded-xl text-center space-y-4">
          <h3 className="text-xl font-bold">Ihre Frage war nicht dabei?</h3>
          <p className="text-muted-foreground">
            Unser Support-Team hilft Ihnen gerne weiter. Kontaktieren Sie uns
            jederzeit!
          </p>
          <Button asChild>
            <Link href="contact">Kontakt</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
