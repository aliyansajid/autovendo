import { Separator } from "@repo/ui/src/components/separator";
import { CheckCircle2 } from "lucide-react";
import React from "react";

const AboutPage = () => {
  return (
    <>
      <div className="bg-linear-to-r from-primary to-primary/80">
        <div className="w-full max-w-285 mx-auto py-12 md:py-24 px-4">
          <div className="text-center text-white space-y-4">
            <h1 className="text-3xl md:text-5xl font-bold">
              Über Autovendo.ch
            </h1>
            <p className="text-xl md:text-2xl font-semibold">
              Fair. Transparent. Unkompliziert. Menschlich.
            </p>
            <p className="text-lg md:text-xl max-w-3xl mx-auto">
              Autovendo.ch ist die Verkaufsplattform für alle Autohändler in der
              Schweiz.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-285 mx-auto py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-16">
          <section className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold">Unsere Mission</h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <p>
                Wir haben Autovendo mit einem klaren Ziel entwickelt: Den
                Verkauf von Fahrzeugen einfach, effizient und fair zu gestalten
                – ohne unnötigen Verwaltungsaufwand, ohne versteckte Kosten und
                ohne komplizierte Prozesse.
              </p>
              <p className="font-semibold text-foreground">
                Gerade in der heutigen Zeit wissen wir:
              </p>
              <p>
                Inserieren darf nicht teuer, sondern muss wirksam sein. Zeit ist
                knapp, Kosten steigen - umso wichtiger ist eine Plattform, die
                mitdenkt, zuhört und unterstützt.
              </p>
            </div>
          </section>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* More than Tech Section */}
            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold">
                Mehr als Technik – es geht um Menschen
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Bei Autovendo.ch geht es nicht nur um Technik, Zahlen oder
                  Algorithmen.
                </p>
                <p className="font-semibold text-foreground">
                  Es geht um Sie, Ihre Fahrzeuge und Ihre Kunden.
                </p>
                <p>
                  Wir hören zu, verstehen die Herausforderungen im Händleralltag
                  und stehen Ihnen persönlich und jederzeit zur Verfügung.
                  Freundlich, respektvoll und lösungsorientiert.
                </p>
              </div>
            </section>

            {/* Personal Contact Section */}
            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold">
                Persönlich erreichbar – ohne Umwege
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>Bei Autovendo.ch sprechen Sie direkt mit uns.</p>
                <p>Kein anonymes Support-Team. Kein Bürokratie-Wirrwarr.</p>
                <p>
                  Sie können einfach zum Telefon greifen oder uns schreiben –
                  wir hören zu, beraten ehrlich und helfen schnell weiter. So,
                  wie man es sich von einem verlässlichen Partner wünscht.
                </p>
              </div>
            </section>
          </div>

          <Separator />

          <section className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold">
              Fair, wettbewerbsfähig und transparent
            </h2>
            <div className="space-y-6 text-lg">
              <p className="text-muted-foreground">
                Wir sind überzeugt: Gute Sichtbarkeit und effizientes Inserieren
                müssen nicht teuer sein.
              </p>
              <div>
                <p className="font-semibold mb-4">Unsere Preise sind:</p>
                <div className="grid gap-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-primary shrink-0" />
                    <span>klar und transparent</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-primary shrink-0" />
                    <span>wettbewerbsfähig</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-primary shrink-0" />
                    <span>einfach kalkulierbar</span>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground">
                Ohne versteckte Gebühren, ohne Zwangspakete. Sie investieren
                dort, wo es zählt: in den Verkauf Ihrer Fahrzeuge.
              </p>
            </div>
          </section>

          <Separator />

          <section className="space-y-6 bg-secondary p-8 md:p-12 rounded-xl">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Warum Autovendo.ch?
              </h2>
              <p className="text-muted-foreground text-lg">
                Weil wir verstehen, was Autohändler heute wirklich brauchen.
              </p>
            </div>

            <div className="space-y-6">
              <p className="font-semibold text-lg">Autovendo.ch verbindet:</p>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-xl mb-2 text-primary">
                    Effizienz & Struktur
                  </h3>
                  <p className="text-muted-foreground">
                    einfache Handhabung, klare Abläufe, gezielte Sichtbarkeit
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-xl mb-2 text-primary">
                    Menschlichkeit
                  </h3>
                  <p className="text-muted-foreground">
                    persönlicher Kontakt, echtes Interesse, respektvoller Umgang
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-xl mb-2 text-primary">
                    Zuverlässigkeit
                  </h3>
                  <p className="text-muted-foreground">
                    erreichbar, unkompliziert, lösungsorientiert
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <p className="text-muted-foreground text-lg">
              Hier sind alle Autohändler willkommen – unabhängig von Grösse,
              Standort oder Erfahrung. Jeder wird fair behandelt und erhält die
              gleiche Chance, seine Fahrzeuge optimal zu präsentieren.
            </p>
          </section>

          <section className="bg-linear-to-r from-primary to-primary/80 text-white p-8 md:p-12 rounded-xl space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold">Kurz gesagt</h2>
            <p className="text-xl font-semibold">
              Autovendo.ch macht Verkauf einfach, fair und menschlich.
            </p>
            <p className="text-lg">
              Wir gehen mit der Zeit, hören zu und entwickeln die Plattform
              gemeinsam mit den Händlern weiter.
            </p>
          </section>
        </div>
      </div>
    </>
  );
};

export default AboutPage;
