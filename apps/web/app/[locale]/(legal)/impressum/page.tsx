import type { Metadata } from "next";
import { Button } from "@repo/ui/src/components/button";
import { Separator } from "@repo/ui/src/components/separator";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";

export const metadata: Metadata = {
  title: "Impressum | AutoVendo",
  robots: { index: false, follow: false },
};

export default function ImpressumPage() {
  return (
    <>
      <div className="bg-linear-to-r from-primary to-primary/80">
        <div className="w-full max-w-285 mx-auto py-12 px-4">
          <div className="text-center text-white space-y-4">
            <h1 className="text-2xl md:text-4xl font-bold">Impressum</h1>
            <p className="text-base md:text-lg max-w-3xl mx-auto">
              Rechtliche Informationen zu Autovendo.ch
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-285 mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">
              Anbieter / Betreiber
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <p className="font-semibold text-foreground">Autovendo.ch</p>
              <p>Die Verkaufsplattform für Autohändler in der Schweiz</p>
              <div>
                <p>Johnson</p>
                <p>Bielstrasse 78</p>
                <p>2555 Brügg / BE</p>
                <p>Switzerland</p>
              </div>
              <div>
                <p>VID: CHE-309.005.896</p>
                <p>CH-ID: CH-036-1107751-6</p>
              </div>
            </div>
          </section>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold">Kontakt</h2>
              <div className="space-y-2 text-muted-foreground text-lg">
                <p>
                  <span className="font-semibold text-foreground">
                    Telefon:
                  </span>
                  &nbsp;
                  <Link
                    href="tel:+41793223520"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    +41 79 322 35 20
                  </Link>
                </p>
                <p>
                  <span className="font-semibold text-foreground">E-Mail:</span>
                  &nbsp;
                  <Link
                    href="mailto:info@autovendo.ch"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    info@autovendo.ch
                  </Link>
                </p>
                <p>
                  <span className="font-semibold text-foreground">
                    Website:
                  </span>
                  &nbsp;
                  <Link
                    href="https://www.autovendo.ch"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    www.autovendo.ch
                  </Link>
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold">
                Vertretungsberechtigte Person
              </h2>
              <div className="text-muted-foreground text-lg">
                <p>Charles McCorvick</p>
                <p>Geschäftsführer</p>
              </div>
            </section>
          </div>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">
              Haftungsausschluss
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <p>
                Autovendo.ch übernimmt keine Gewähr für die in Inseraten
                veröffentlichten Inhalte. Für die Richtigkeit, Vollständigkeit
                und Aktualität der Inserate sind ausschliesslich die jeweiligen
                Anbieter verantwortlich.
              </p>
              <p>
                Autovendo.ch haftet nicht für direkte oder indirekte Schäden,
                die aus der Nutzung der Plattform oder aus Kontakten zwischen
                Nutzern entstehen.
              </p>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">Haftung für Links</h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <p>
                Verweise und Links auf Webseiten Dritter liegen ausserhalb
                unseres Verantwortungsbereichs.
              </p>
              <p>
                Es wird jegliche Verantwortung für solche Webseiten abgelehnt.
                Der Zugriff und die Nutzung solcher Webseiten erfolgen auf
                eigene Gefahr des Nutzers.
              </p>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">Urheberrechte</h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <p>
                Die Inhalte, Strukturen, Texte und Grafiken auf Autovendo.ch
                sind urheberrechtlich geschützt.
              </p>
              <p>
                Die Verwendung, Vervielfältigung oder Weitergabe von Inhalten
                bedarf der vorherigen schriftlichen Zustimmung des Betreibers.
              </p>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">
              Anwendbares Recht und Gerichtsstand
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <p>Es gilt ausschliesslich Schweizer Recht.</p>
              <p>Gerichtsstand ist der Sitz des Betreibers von Autovendo.ch.</p>
            </div>
          </section>

          <Separator />

          <section className="bg-secondary p-8 rounded-xl text-center space-y-4">
            <h3 className="text-xl font-bold">Kontakt aufnehmen</h3>
            <p className="text-muted-foreground">
              Haben Sie noch weitere Fragen? Wir sind gerne für Sie da.
            </p>
            <Button asChild>
              <Link href="/contact">
                Kontaktieren Sie uns
                <ArrowRight />
              </Link>
            </Button>
          </section>
        </div>
      </div>
    </>
  );
}
