import { Separator } from "@repo/ui/src/components/separator";
import Link from "next/link";

export default function ImpressumPage() {
  return (
    <>
      <div className="bg-linear-to-r from-primary to-primary/80">
        <div className="w-full max-w-285 mx-auto py-12 px-4">
          <div className="text-center text-white space-y-3">
            <h1 className="text-2xl md:text-4xl font-bold">Impressum</h1>
            <p className="text-lg md:text-xl font-semibold">
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
                <p>[Name der Firma oder Inhaber]</p>
                <p>[Strasse und Hausnummer]</p>
                <p>[PLZ, Ort]</p>
                <p>Schweiz</p>
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
                  </span>{" "}
                  [Telefonnummer]
                </p>
                <p>
                  <span className="font-semibold text-foreground">E-Mail:</span>{" "}
                  <a
                    href="mailto:[E-Mail-Adresse]"
                    className="text-primary hover:underline"
                  >
                    [E-Mail-Adresse]
                  </a>
                </p>
                <p>
                  <span className="font-semibold text-foreground">
                    Website:
                  </span>{" "}
                  <a
                    href="https://www.autovendo.ch"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    www.autovendo.ch
                  </a>
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold">
                Vertretungsberechtigte Person(en)
              </h2>
              <div className="text-muted-foreground text-lg">
                <p>
                  [Name der vertretungsberechtigten Person, z. B.
                  Geschäftsführer / Inhaber]
                </p>
              </div>
            </section>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold">Handelsregister</h2>
              <div className="space-y-2 text-muted-foreground text-lg">
                <p>
                  <span className="font-semibold text-foreground">
                    Handelsregisteramt:
                  </span>{" "}
                  [Kanton]
                </p>
                <p>
                  <span className="font-semibold text-foreground">
                    Firmennummer (UID):
                  </span>{" "}
                  [UID-Nummer]
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold">Mehrwertsteuer</h2>
              <div className="space-y-2 text-muted-foreground text-lg">
                <p>
                  <span className="font-semibold text-foreground">
                    MWST-Nummer:
                  </span>{" "}
                  [CHE-xxx.xxx.xxx MWST]
                </p>
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

          <section className="space-y-6 bg-secondary p-8 rounded-xl text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Kontakt aufnehmen
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg mb-6">
              <p>Haben Sie noch weitere Fragen? Wir sind gerne für Sie da.</p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Zum Kontaktformular
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}
