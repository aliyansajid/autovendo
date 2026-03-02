import { Separator } from "@repo/ui/src/components/separator";
import { Button } from "@repo/ui/src/components/button";
import Link from "next/link";
import { CheckCircle2, Info } from "lucide-react";
import { Badge } from "@repo/ui/src/components/badge";

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
              <p className="font-semibold text-foreground">
                Du entscheidest selbst, welche Datenverarbeitung du zulässt.
              </p>
            </div>
          </section>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="space-y-4 bg-muted/50 p-6 rounded-xl border">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <CheckCircle2 className="text-primary size-5" />
                  Notwendige Cookies
                </h2>
                <Badge className="bg-primary/10 text-primary font-semibold">
                  immer aktiv
                </Badge>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Diese Cookies sind erforderlich, damit die Website korrekt
                  funktioniert.
                </p>
                <div className="space-y-2">
                  <p className="font-semibold text-foreground">
                    Sie ermöglichen grundlegende Funktionen wie:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Seitennavigation</li>
                    <li>Zugriff auf geschützte Bereiche</li>
                    <li>Sicherheit und Betrugsprävention</li>
                  </ul>
                </div>
                <p className="font-medium">
                  Ohne diese Cookies kann Autovendo.ch nicht ordnungsgemäss
                  betrieben werden.
                </p>
              </div>
            </section>

            <section className="space-y-4 p-6 rounded-xl border">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-bold">Funktionale Cookies</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Diese Cookies ermöglichen erweiterte Funktionen und
                  Personalisierungen, z. B.:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Speicherung deiner Einstellungen</li>
                  <li>Verbesserung der Benutzerfreundlichkeit</li>
                </ul>
                <p className="flex items-center gap-2 text-sm">
                  <Info className="size-4" />
                  Sie sind optional und können deaktiviert werden.
                </p>
              </div>
            </section>

            <section className="space-y-4 p-6 rounded-xl border">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-bold">Analyse & Statistik</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Diese Cookies helfen uns zu verstehen, wie Besucher unsere
                  Website nutzen.
                </p>
                <p>
                  Die gewonnenen Informationen dienen ausschliesslich dazu,
                  Autovendo.ch weiter zu verbessern.
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Erhebung anonymisierter Nutzungsdaten</li>
                  <li>Keine direkte Identifikation von Personen</li>
                </ul>
                <p className="flex items-center gap-2 text-sm">
                  <Info className="size-4" />
                  Diese Cookies werden nur mit deiner Zustimmung gesetzt.
                </p>
              </div>
            </section>

            <section className="space-y-4 p-6 rounded-xl border">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-bold">
                  Marketing & externe Inhalte
                </h2>
                <Badge variant="secondary" className="font-semibold">
                  optional
                </Badge>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Falls verwendet, ermöglichen diese Cookies die Anzeige
                  externer Inhalte oder Marketing-Massnahmen.
                </p>
                <p className="flex items-center gap-2 text-sm">
                  <Info className="size-4" />
                  Auch diese Cookies werden nur nach ausdrücklicher Zustimmung
                  aktiviert.
                </p>
              </div>
            </section>
          </div>

          <Separator />

          <section className="space-y-6 text-center">
            <h2 className="text-xl md:text-2xl font-bold">Deine Wahl</h2>
            <div className="space-y-2 text-muted-foreground text-lg mb-8">
              <p>
                Du kannst deine Einwilligung jederzeit anpassen oder widerrufen.
              </p>
              <p>Änderungen werden sofort wirksam.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="w-full sm:w-auto">
                Alle akzeptieren
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Nur notwendige Cookies zulassen
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                Einstellungen individuell anpassen
              </Button>
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
              <Link href="datenschutz">Zur Datenschutzerklärung</Link>
            </Button>
          </section>
        </div>
      </div>
    </>
  );
}
