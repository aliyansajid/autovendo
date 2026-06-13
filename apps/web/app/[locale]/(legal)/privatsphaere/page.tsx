import { Separator } from "@repo/ui/src/components/separator";
import { Button } from "@repo/ui/src/components/button";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";

export default function PrivatsphaereEinstellungenPage() {
  return (
    <>
      <div className="bg-linear-to-r from-primary to-primary/80">
        <div className="w-full max-w-285 mx-auto py-12 px-4">
          <div className="text-center text-white space-y-4">
            <h1 className="text-2xl md:text-4xl font-bold">
              Privatsphäre-Einstellungen
            </h1>
            <p className="text-base md:text-lg max-w-3xl mx-auto">
              Deine Privatsphäre ist uns wichtig
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-285 mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          <section className="space-y-4">
            <div className="space-y-4 text-muted-foreground text-lg">
              <p>
                Autovendo.ch verwendet Cookies und ähnliche Technologien, um den
                sicheren Betrieb der Plattform zu gewährleisten, Inhalte zu
                optimieren und das Nutzungserlebnis zu verbessern.
              </p>
              <p>
                Du entscheidest selbst, welche Datenverarbeitung du zulässt.
                Nachfolgend erklären wir, welche Cookie-Kategorien wir einsetzen
                und was sie bewirken.
              </p>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">
              1. Notwendige Cookies
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <p>
                Diese Cookies sind erforderlich, damit die Website korrekt
                funktioniert. Sie können nicht deaktiviert werden.
              </p>
              <div className="space-y-2">
                <p className="font-semibold text-foreground">
                  Sie ermöglichen grundlegende Funktionen wie:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Seitennavigation</li>
                  <li>Zugriff auf geschützte Bereiche</li>
                  <li>Sicherheit und Betrugsprävention</li>
                </ul>
              </div>
              <p className="font-semibold text-foreground">
                Ohne diese Cookies kann Autovendo.ch nicht ordnungsgemäss
                betrieben werden.
              </p>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">
              2. Funktionale Cookies
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <p>
                Diese Cookies ermöglichen erweiterte Funktionen und
                Personalisierungen.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Speicherung deiner Einstellungen</li>
                <li>Verbesserung der Benutzerfreundlichkeit</li>
              </ul>
              <p>
                Sie sind optional und können in den Einstellungen deines
                Browsers deaktiviert werden.
              </p>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">
              3. Analyse & Statistik
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <p>
                Diese Cookies helfen uns zu verstehen, wie Besucher unsere
                Website nutzen, und dienen ausschliesslich dazu, Autovendo.ch
                weiter zu verbessern.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Erhebung anonymisierter Nutzungsdaten</li>
                <li>Keine direkte Identifikation von Personen</li>
              </ul>
              <p>
                Diese Cookies werden nur mit deiner ausdrücklichen Zustimmung
                gesetzt.
              </p>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">
              4. Marketing & externe Inhalte
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <p>
                Falls verwendet, ermöglichen diese Cookies die Anzeige externer
                Inhalte oder Marketing-Massnahmen.
              </p>
              <p>
                Auch diese Cookies werden nur nach ausdrücklicher Zustimmung
                aktiviert.
              </p>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">
              5. Cookie-Einstellungen verwalten
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <p>
                Du kannst deine Einwilligung jederzeit anpassen oder widerrufen.
                Änderungen werden sofort wirksam.
              </p>
              <p>
                Die meisten Browser ermöglichen es dir, Cookies direkt in den
                Browser-Einstellungen zu verwalten, einzuschränken oder
                vollständig zu deaktivieren.
              </p>
            </div>
          </section>

          <Separator />

          <section className="bg-secondary p-8 rounded-xl text-center space-y-4">
            <h3 className="text-xl font-bold">Datenschutz</h3>
            <p className="text-muted-foreground">
              Weitere Informationen zur Verarbeitung personenbezogener Daten
              findest du in unserer Datenschutzerklärung.
            </p>
            <Button asChild>
              <Link href="/datenschutz">
                Zur Datenschutzerklärung
                <ArrowRight />
              </Link>
            </Button>
          </section>
        </div>
      </div>
    </>
  );
}
