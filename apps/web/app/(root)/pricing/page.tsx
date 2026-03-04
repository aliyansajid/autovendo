import { Separator } from "@repo/ui/src/components/separator";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@repo/ui/src/components/button";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/src/components/table";
import { pricingTiers } from "@/constants/pricing-tiers";
import { Badge } from "@repo/ui/src/components/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@repo/ui/src/components/card";
import { XCircle } from "lucide-react";

export default function PricingPage() {
  return (
    <>
      <div className="bg-linear-to-r from-primary to-primary/80">
        <div className="w-full max-w-285 mx-auto px-4 py-12">
          <div className="text-center text-white space-y-4">
            <h1 className="text-2xl md:text-4xl font-bold">
              Mehr Sichtbarkeit. Mehr Service. Weniger Kosten.
            </h1>
            <p className="text-base md:text-lg max-w-3xl mx-auto">
              Warum 30–40% mehr bezahlen – wenn Sie bei autovendo.ch mehr
              persönliche Betreuung und volle Transparenz erhalten?
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-285 mx-auto py-12 px-4 space-y-12">
        <div className="max-w-4xl mx-auto space-y-12">
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-red-500">
              Schluss mit überteuerten Plattformen.
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <p>
                <span className="font-semibold text-foreground">
                  autovendo.ch
                </span>
                &nbsp;gibt Händlern Kontrolle, Fairness und echten persönlichen
                Support – zu deutlich besseren Konditionen.
              </p>
              <p>
                Der Fahrzeughandel ist anspruchsvoll genug. Ihre
                Inserate-Plattform sollte Sie unterstützen – nicht Ihre Marge
                belasten.
              </p>
              <p>
                autovendo.ch bietet faire Preise, direkte Ansprechpartner und
                volle Transparenz. Keine versteckten Kosten. Kein
                Konzern-Denken. Sondern echte Partnerschaft.
              </p>
            </div>
          </section>

          <Separator />

          <section className="space-y-6">
            <h2 className="text-2xl font-bold">
              Faire Preise – Direkt verglichen
            </h2>

            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-bold">Paket</TableHead>
                    <TableHead className="font-bold">
                      Fahrzeuge gleichzeitig
                    </TableHead>
                    <TableHead className="font-bold">autovendo.ch</TableHead>
                    <TableHead className="font-bold">
                      Ersparnis vs. Marktführer*
                    </TableHead>
                    <TableHead className="font-bold">
                      Monatliche Einsparung
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-semibold">Basic 5</TableCell>
                    <TableCell>Bis zu 5 Fahrzeuge</TableCell>
                    <TableCell className="font-bold text-primary">
                      CHF 180.–
                    </TableCell>
                    <TableCell className="text-green-600 font-medium">
                      ca. 30% günstiger
                    </TableCell>
                    <TableCell>ca. CHF 75.–</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Basic 10</TableCell>
                    <TableCell>Bis zu 10 Fahrzeuge</TableCell>
                    <TableCell className="font-bold text-primary">
                      CHF 280.–
                    </TableCell>
                    <TableCell className="text-green-600 font-medium">
                      ca. 30% günstiger
                    </TableCell>
                    <TableCell>ca. CHF 120.–</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Basic 15</TableCell>
                    <TableCell>Bis zu 15 Fahrzeuge</TableCell>
                    <TableCell className="font-bold text-primary">
                      CHF 325.–
                    </TableCell>
                    <TableCell className="text-green-600 font-medium">
                      ca. 35% günstiger
                    </TableCell>
                    <TableCell>ca. CHF 175.–</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Basic 25</TableCell>
                    <TableCell>Bis zu 25 Fahrzeuge</TableCell>
                    <TableCell className="font-bold text-primary">
                      CHF 408.–
                    </TableCell>
                    <TableCell className="text-green-600 font-medium">
                      ca. 40% günstiger
                    </TableCell>
                    <TableCell>ca. CHF 270.–</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <p className="text-sm text-muted-foreground">
              *Vergleich basiert auf marktüblichen Händlerpreisen.
            </p>
          </section>

          <Separator />

          <section className="space-y-6">
            <h2 className="text-2xl font-bold">Mehr als 25 Fahrzeuge</h2>
            <div className="bg-primary/5 border border-primary/20 p-8 rounded-xl space-y-6">
              <div>
                <h3 className="text-xl font-bold text-primary mb-2">
                  Für größere Händler ab 25 Fahrzeugen
                </h3>
                <p className="text-lg font-medium">
                  Individuelle Lösungen. Individuelle Preise.
                </p>
              </div>
              <div className="space-y-4 text-muted-foreground text-lg">
                <p>
                  Betreiben Sie ein größeres Autohaus mit mehr als 25 Fahrzeugen
                  im Bestand? Dann erstellen wir für Sie ein maßgeschneidertes
                  Angebot – garantiert günstiger als marktübliche
                  Plattformpreise.
                </p>
                <p>
                  Wir analysieren Ihren aktuellen Bestand und Ihre Bedürfnisse
                  und präsentieren Ihnen eine transparente, faire Lösung mit
                  echtem Sparpotenzial.
                </p>
              </div>

              <Separator className="bg-primary/20" />

              <div className="space-y-4">
                <h3 className="text-xl font-bold">
                  Persönlich. Direkt. Vor Ort.
                </h3>
                <div className="space-y-4 text-muted-foreground text-lg">
                  <p>
                    Gerne besuchen wir Sie persönlich und bringen eine
                    detaillierte Preisübersicht mit. Wir erklären Ihnen alles im
                    Detail – offen, ehrlich und ohne Verpflichtung.
                  </p>
                  <p className="font-medium text-foreground">
                    Ein Anruf genügt.
                  </p>
                  <p>
                    Oder senden Sie uns eine E-Mail und vereinbaren Sie einen
                    Termin. Wir sind nur einen Telefonanruf entfernt.
                  </p>
                </div>
                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <Button asChild>
                    <Link href="/contact">Telefontermin vereinbaren</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/contact">E-Mail schreiben</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <section className="space-y-6">
              <h2 className="text-xl font-bold">Warum mehr bezahlen?</h2>
              <div className="space-y-3 text-lg text-muted-foreground">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-primary shrink-0" />
                    Gleiche Reichweite.
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-primary shrink-0" />
                    Persönlicher Ansprechpartner.
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-primary shrink-0" />
                    Schnellere Reaktionszeiten.
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-primary shrink-0" />
                    Flexible Lösungen für Händler.
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-primary shrink-0" />
                    Keine Konzern-Strukturen.
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-primary shrink-0" />
                    Faire Preisgestaltung.
                  </li>
                </ul>
              </div>
              <p className="font-semibold text-foreground text-lg leading-relaxed">
                Mit autovendo.ch investieren Sie nicht in Werbung.
                <br />
                Sie investieren in eine Partnerschaft.
              </p>
            </section>

            <section className="space-y-6 bg-secondary p-8 rounded-xl h-fit">
              <h2 className="text-xl font-bold">Wir sind:</h2>
              <ul className="space-y-3 text-lg">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="size-5 text-primary shrink-0" />
                  Effizienter
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="size-5 text-primary shrink-0" />
                  Händlerorientiert
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="size-5 text-primary shrink-0" />
                  Persönlich
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="size-5 text-primary shrink-0" />
                  Transparent
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="size-5 text-primary shrink-0" />
                  Schweizerisch direkt
                </li>
              </ul>
              <div className="pt-6 border-t border-border">
                <p className="font-bold text-primary text-lg">
                  Ihre Marge gehört Ihnen – nicht der Plattform.
                </p>
              </div>
            </section>
          </div>
        </div>

        <Separator className="max-w-4xl mx-auto" />

        <section className="space-y-12">
          <h2 className="text-2xl font-bold text-center">
            Wählen Sie Ihr passendes Paket
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pricingTiers.map((tier) => (
              <Card
                key={tier.name}
                className={`${
                  tier.popular
                    ? "border-primary shadow-lg scale-100 lg:scale-105 z-10"
                    : "opacity-90 hover:opacity-100"
                }`}
              >
                <CardHeader>
                  {tier.popular ? (
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl font-bold">
                        {tier.name}
                      </CardTitle>
                      <Badge>Beliebt</Badge>
                    </div>
                  ) : (
                    <CardTitle className="text-xl font-bold">
                      {tier.name}
                    </CardTitle>
                  )}
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-primary">
                      {tier.price}
                    </span>
                    {tier.period && (
                      <span className="text-muted-foreground">
                        {tier.period}
                      </span>
                    )}
                  </div>
                  <div className="space-y-4">
                    {tier.features.map((feature) => (
                      <div
                        key={feature.name}
                        className="flex items-start gap-3"
                      >
                        {feature.included ? (
                          <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                        )}
                        <span
                          className={
                            feature.included
                              ? "text-foreground leading-snug"
                              : "text-muted-foreground leading-snug"
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
                    className="w-full font-semibold"
                    variant={tier.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link href="/contact">{tier.buttonText}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="max-w-4xl mx-auto" />

        <div className="max-w-4xl mx-auto">
          <section className="bg-linear-to-r from-primary to-primary/80 text-white p-8 md:p-12 rounded-xl space-y-8 text-center shadow-xl">
            <div>
              <h2 className="text-xl opacity-90 font-semibold mb-2">
                Beispielrechnung:
              </h2>
              <p className="text-xl font-medium leading-relaxed">
                Ein Händler mit 25 Fahrzeugen spart bei autovendo.ch
                <span className="text-4xl font-black block my-4 tracking-tight drop-shadow-sm">
                  über CHF 3’000.– pro Jahr.
                </span>
              </p>
              <p className="text-xl opacity-90 font-medium">
                Das ist direkte Marge. Ohne Risiko.
              </p>
            </div>

            <div className="pt-8 border-t border-white/20 mt-8 space-y-8">
              <p className="text-lg font-semibold leading-relaxed max-w-2xl mx-auto">
                Wechseln Sie jetzt zu autovendo.ch und sparen Sie mehrere
                tausend Franken pro Jahr – bei persönlichem Service und fairen
                Konditionen.
              </p>
              <Button variant="secondary" asChild>
                <Link href="/contact">
                  Jetzt unverbindlich Kontakt aufnehmen
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
