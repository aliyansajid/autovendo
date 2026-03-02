import { pricingTiers } from "@/constants/pricing-tiers";
import { Badge } from "@repo/ui/src/components/badge";
import { Button } from "@repo/ui/src/components/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@repo/ui/src/components/card";
import { CheckCircle2, XCircle } from "lucide-react";
import { Separator } from "@repo/ui/src/components/separator";

export default function PricingPage() {
  return (
    <>
      <div className="bg-linear-to-r from-primary to-primary/80">
        <div className="w-full max-w-285 mx-auto py-12 px-4">
          <div className="text-center text-white space-y-4">
            <h1 className="text-2xl md:text-4xl font-bold">Unsere Preise</h1>
            <p className="text-lg md:text-xl font-semibold">
              Fair. Transparent. Bis zu 40 % günstiger.
            </p>
            <p className="text-base md:text-lg max-w-3xl mx-auto">
              Keine versteckten Gebühren. Keine starren Pakete. Nur das, was Sie
              wirklich brauchen.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-285 mx-auto px-4 py-12 space-y-12">
        <div className="max-w-4xl mx-auto">
          <section className="space-y-12">
            <div className="space-y-4 text-center">
              <h2 className="text-2xl md:text-3xl font-bold">
                Warum weiterhin zu viel bezahlen?
              </h2>
              <p className="text-lg text-muted-foreground">
                Der Fahrzeugverkauf ist anspruchsvoll genug. Hohe
                Plattformkosten müssen nicht auch noch dazugehören.
              </p>
            </div>

            <div className="space-y-6 text-muted-foreground text-lg">
              <p>
                Autovendo.ch bietet Autohändlern eine echte Alternative:&nbsp;
                <span className="font-semibold text-foreground">
                  Bis zu 30–40 % günstiger
                </span>
                &nbsp;als klassische Plattformen – ohne versteckte Gebühren,
                ohne komplizierte Strukturen.
              </p>
              <p className="font-semibold text-foreground">
                Mehr Inserate. Mehr Kontrolle. Mehr Marge pro Fahrzeug.
              </p>
              <p>
                Warum also an alten Modellen festhalten, wenn es moderner,
                fairer und menschlicher geht?
              </p>

              <div className="bg-secondary p-6 rounded-xl space-y-4">
                <p className="font-semibold">Schluss mit:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>überteuerten Monatsabos</li>
                  <li>unübersichtlichen Zusatzkosten</li>
                  <li>anonymem Support</li>
                  <li>starren Paketen, die nicht zu deinem Betrieb passen</li>
                </ul>
              </div>

              <p className="font-semibold text-foreground">
                Autovendo.ch wurde nicht für Konzerne gebaut. Sondern für
                Autohändler.
              </p>
            </div>

            <Separator />

            <div className="space-y-6">
              <h3 className="text-xl md:text-2xl font-bold text-center">
                Warum wechseln zu Autovendo.ch?
              </h3>
              <p className="text-center text-muted-foreground">
                Weil sich der Markt verändert hat. Autohändler stehen heute
                unter Druck: steigende Kosten, sinkende Margen, mehr Wettbewerb,
                anspruchsvollere Kunden.
              </p>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-primary shrink-0" />
                    <p className="font-semibold">Bis zu 40 % Kosten sparen</p>
                  </div>
                  <p className="text-sm text-muted-foreground pl-7">
                    Faire Preise – mehr Gewinn pro verkauftem Fahrzeug.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-primary shrink-0" />
                    <p className="font-semibold">Händler verstehen</p>
                  </div>
                  <p className="text-sm text-muted-foreground pl-7">
                    Aus der Praxis entwickelt – mit echtem Feedback.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-primary shrink-0" />
                    <p className="font-semibold">Echter Ansprechpartner</p>
                  </div>
                  <p className="text-sm text-muted-foreground pl-7">
                    Keine Ticketsysteme – direkter Kontakt.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-primary shrink-0" />
                    <p className="font-semibold">Einfachheit verkauft</p>
                  </div>
                  <p className="text-sm text-muted-foreground pl-7">
                    Schnelle Inserate. Weniger Aufwand. Mehr Fokus.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-primary shrink-0" />
                    <p className="font-semibold">Fairness zählt</p>
                  </div>
                  <p className="text-sm text-muted-foreground pl-7">
                    Transparenz und Partnerschaft auf Augenhöhe.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-primary/10 p-8 rounded-xl text-left space-y-6">
              <h3 className="text-2xl font-bold">Wenn du…</h3>
              <ul className="space-y-3 text-lg">
                <li className="flex items-center justify-start gap-3">
                  <CheckCircle2 className="size-5 text-primary shrink-0" />
                  weniger zahlen willst
                </li>
                <li className="flex items-center justify-start gap-3">
                  <CheckCircle2 className="size-5 text-primary shrink-0" />
                  flexibel bleiben möchtest
                </li>
                <li className="flex items-center justify-start gap-3">
                  <CheckCircle2 className="size-5 text-primary shrink-0" />
                  persönlich betreut werden willst
                </li>
                <li className="flex items-center justify-start gap-3">
                  <CheckCircle2 className="size-5 text-primary shrink-0" />
                  trotzdem professionell auftreten möchtest
                </li>
              </ul>
              <p className="text-xl font-semibold text-primary">
                … dann ist Autovendo.ch die logische Wahl.
              </p>
            </div>
          </section>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.name}
              className={`${
                tier.popular
                  ? "border-primary shadow-lg scale-100 lg:scale-105 z-10"
                  : ""
              }`}
            >
              <CardHeader>
                {tier.popular ? (
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">{tier.name}</CardTitle>
                    <Badge>Beliebt</Badge>
                  </div>
                ) : (
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                )}
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.period && (
                    <span className="text-muted-foreground">{tier.period}</span>
                  )}
                </div>
                <div className="space-y-3">
                  {tier.features.map((feature) => (
                    <div key={feature.name} className="flex items-center gap-3">
                      {feature.included ? (
                        <CheckCircle2 className="size-5 text-primary" />
                      ) : (
                        <XCircle className="size-5 text-muted-foreground" />
                      )}
                      <span
                        className={
                          feature.included
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }
                      >
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={tier.popular ? "default" : "outline"}
                >
                  {tier.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
