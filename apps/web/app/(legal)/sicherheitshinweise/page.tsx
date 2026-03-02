import { Button } from "@repo/ui/src/components/button";
import { Separator } from "@repo/ui/src/components/separator";
import { AlertCircle, ShieldAlert, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function SicherheitshinweisePage() {
  return (
    <>
      <div className="bg-linear-to-r from-primary to-primary/80">
        <div className="w-full max-w-285 mx-auto py-12 px-4">
          <div className="text-center text-white space-y-4">
            <h1 className="text-2xl md:text-4xl font-bold">
              Sicherheitshinweise
            </h1>
            <p className="text-base md:text-lg max-w-3xl mx-auto">
              Sicher Handeln auf Autovendo.ch
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-285 mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          <section className="space-y-4 text-muted-foreground text-lg">
            <p>
              Der Schutz unserer Nutzerinnen und Nutzer hat für Autovendo.ch
              höchste Priorität. Mit den folgenden Sicherheitshinweisen
              unterstützen wir Sie dabei, Risiken zu erkennen und sich wirksam
              vor Betrugsversuchen zu schützen.
            </p>
            <p>
              Wie alle Online-Marktplätze kann auch Autovendo.ch vereinzelt Ziel
              von missbräuchlicher Nutzung werden. Deshalb ist es uns wichtig,
              Sie transparent zu informieren und Ihnen konkrete Empfehlungen an
              die Hand zu geben, wie Sie selbst aktiv zu Ihrer Sicherheit
              beitragen können – beim Kauf wie auch beim Verkauf von Fahrzeugen.
            </p>
          </section>

          <section className="bg-destructive/10 border-l-4 border-destructive p-6 rounded-r-xl space-y-3">
            <div className="flex items-center gap-2 text-destructive font-bold text-xl">
              <AlertCircle className="size-6" />
              Wichtig
            </div>
            <div className="space-y-3 text-foreground/90">
              <p>
                In den vergangenen Monaten ist die Anzahl von
                Online-Betrugsfällen in der Schweiz deutlich gestiegen. Bitte
                seien Sie bei der Kommunikation mit anderen Nutzern aufmerksam
                und befolgen Sie unsere Sicherheitstipps, um ein sicheres und
                positives Nutzungserlebnis auf Autovendo.ch zu gewährleisten.
              </p>
              <p className="font-semibold">
                Haben Sie den Verdacht auf einen Betrugsversuch, brechen Sie den
                Kontakt sofort ab und informieren Sie uns umgehend.
              </p>
            </div>
          </section>

          <Separator />

          <section className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <ShieldCheck className="text-primary size-6" />
              Hinweise für Kaufinteressierte
            </h2>
            <p className="text-lg text-muted-foreground">
              Die folgenden Empfehlungen helfen Ihnen, sich beim Fahrzeugkauf
              aktiv zu schützen:
            </p>

            <div className="grid gap-6">
              <div className="bg-secondary/50 p-6 rounded-xl space-y-2 border">
                <h3 className="font-bold text-xl text-primary">
                  Keine Vorauszahlungen leisten
                </h3>
                <p className="text-muted-foreground">
                  Überweisen oder senden Sie niemals Geld, bevor Sie das
                  Fahrzeug persönlich besichtigt und den dazugehörigen
                  Fahrzeugausweis gesehen haben. Betrüger arbeiten häufig mit
                  gefälschten Inseraten und setzen unter Zeitdruck, um
                  Vorauszahlungen zu erzwingen.
                </p>
              </div>

              <div className="bg-secondary/50 p-6 rounded-xl space-y-2 border">
                <h3 className="font-bold text-xl text-primary">
                  Nur Fahrzeuge aus der Schweiz und dem Fürstentum Liechtenstein
                </h3>
                <p className="text-muted-foreground">
                  Gemäss den Insertionsregeln von Autovendo.ch dürfen nur
                  Fahrzeuge angeboten werden, die sich in der Schweiz oder im
                  Fürstentum Liechtenstein befinden. Angebote aus dem Ausland
                  sind nicht zulässig. Sollten Sie ein entsprechendes Inserat
                  entdecken, melden Sie dieses bitte umgehend.
                </p>
              </div>

              <div className="bg-secondary/50 p-6 rounded-xl space-y-2 border">
                <h3 className="font-bold text-xl text-primary">
                  Vorsicht bei unrealistisch günstigen Angeboten
                </h3>
                <p className="text-muted-foreground">
                  Wenn ein Angebot aussergewöhnlich attraktiv erscheint oder ein
                  sehr seltenes Modell zu einem ungewöhnlich niedrigen Preis
                  angeboten wird, ist besondere Vorsicht geboten. Häufig wird
                  versucht, mit vermeintlichen „einmaligen Gelegenheiten“ Druck
                  aufzubauen.
                </p>
              </div>

              <div className="bg-secondary/50 p-6 rounded-xl space-y-2 border">
                <h3 className="font-bold text-xl text-primary">
                  Keine sensiblen Dokumente weitergeben
                </h3>
                <p className="text-muted-foreground">
                  Senden Sie niemals Kopien von Ausweisen, Reisepässen,
                  Führerscheinen oder Fahrzeugausweisen an unbekannte Personen.
                  Diese Dokumente können missbräuchlich verwendet werden.
                  Sollten Sie bereits Dokumente versendet haben, wenden Sie sich
                  an die zuständige Ausgabestelle Ihrer Gemeinde.
                </p>
              </div>
            </div>
          </section>

          <Separator />

          <section className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <ShieldAlert className="text-primary size-6" />
              Hinweise für Verkaufende
            </h2>
            <p className="text-lg text-muted-foreground">
              Auch als Verkäufer können Sie aktiv zu Ihrer Sicherheit beitragen:
            </p>

            <div className="grid gap-6">
              <div className="space-y-4">
                <h3 className="font-bold text-xl">
                  Achtung vor Phishing-Nachrichten
                </h3>
                <p className="text-muted-foreground">
                  Betrüger versenden gelegentlich E-Mails oder SMS, die
                  vorgeben, von Autovendo.ch zu stammen oder auf angeblich
                  günstigere Vergleichsangebote hinweisen. Ziel ist es, Sie auf
                  gefälschte Webseiten zu locken oder Zugangsdaten zu erlangen.
                </p>
                <div className="bg-muted p-6 rounded-xl border">
                  <p className="font-semibold mb-3">So schützen Sie sich:</p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>
                      Öffnen Sie keine Links, Anhänge oder Bilder von
                      unbekannten Absendern
                    </li>
                    <li>
                      Prüfen Sie E-Mail-Absender sorgfältig auf Unstimmigkeiten
                    </li>
                    <li>
                      Geben Sie Ihre Zugangsdaten niemals über Links aus E-Mails
                      oder SMS ein
                    </li>
                    <li>
                      Rufen Sie Autovendo.ch immer direkt über die
                      Browser-Adresse auf
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-xl">Schützen Sie Ihre Systeme</h3>
                <p className="text-muted-foreground">
                  Halten Sie Betriebssysteme und Programme stets aktuell und
                  verwenden Sie aktuelle Antiviren-Software. Schadprogramme
                  entwickeln sich laufend weiter – regelmässige Updates erhöhen
                  den Schutz erheblich.
                </p>
                <div className="bg-muted p-6 rounded-xl border text-foreground font-semibold">
                  Wenn Sie den Verdacht haben, dass ein Kontakt betrügerisch
                  ist, beenden Sie die Kommunikation sofort.
                </div>
              </div>
            </div>
          </section>

          <Separator />

          <section className="bg-primary/10 border border-primary/20 p-8 rounded-xl space-y-4">
            <h2 className="text-2xl font-bold text-primary">
              Speziell für Fahrzeughändler und Garagen
            </h2>
            <div>
              <h3 className="font-bold text-xl mb-2">
                Handynummer im Benutzerkonto hinterlegen
              </h3>
              <p className="text-muted-foreground text-lg">
                Das Hinterlegen einer Mobilnummer erhöht die Sicherheit Ihres
                Kontos erheblich. Bei der Anmeldung auf neuen Geräten kann eine
                zusätzliche Bestätigung per SMS erforderlich sein. Diese
                Zwei-Faktor-Authentifizierung gehört zu den wirksamsten
                Massnahmen gegen unbefugten Kontozugriff.
              </p>
            </div>
          </section>

          <Separator />

          <section className="bg-secondary p-8 rounded-xl text-center space-y-4">
            <h3 className="text-xl font-bold">Noch Fragen?</h3>
            <p className="text-muted-foreground">
              Unser Support-Team unterstützt Sie gerne. Melden Sie sich, wenn
              Sie unsicher sind oder weitere Informationen benötigen.
            </p>
            <Button asChild>
              <Link href="contact">Kontakt</Link>
            </Button>
          </section>
        </div>
      </div>
    </>
  );
}
