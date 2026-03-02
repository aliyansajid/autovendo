import { Button } from "@repo/ui/src/components/button";
import { Separator } from "@repo/ui/src/components/separator";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <>
      <div className="bg-linear-to-r from-primary to-primary/80">
        <div className="w-full max-w-285 mx-auto py-12 px-4">
          <div className="text-center text-white space-y-4">
            <h1 className="text-2xl md:text-4xl font-bold">
              Datenschutzerklärung
            </h1>
            <p className="text-base md:text-lg max-w-3xl mx-auto">
              Informationen zum Schutz deiner persönlichen Daten
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-285 mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          <section className="space-y-4">
            <div className="space-y-4 text-muted-foreground text-lg">
              <p>
                Der Schutz deiner persönlichen Daten ist uns wichtig. In dieser
                Datenschutzerklärung informieren wir dich darüber, welche
                personenbezogenen Daten bei der Nutzung von Autovendo.ch
                erhoben, bearbeitet und gespeichert werden.
              </p>
              <p>
                Autovendo.ch hält sich an die geltenden datenschutzrechtlichen
                Bestimmungen der Schweiz (DSG) sowie – soweit anwendbar – der EU
                (DSGVO).
              </p>
            </div>
          </section>

          <Separator />

          {/* 1. Verantwortliche Stelle */}
          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">
              1. Verantwortliche Stelle
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <p>
                Verantwortlich für die Datenbearbeitung ist der Betreiber von
                Autovendo.ch.
              </p>
              <p>Kontaktinformationen findest du im Impressum.</p>
            </div>
          </section>

          <Separator />

          {/* 2. Welche Daten wir erheben */}
          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">
              2. Welche Daten wir erheben
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <p>
                Wir bearbeiten personenbezogene Daten, die du uns selbst zur
                Verfügung stellst oder die technisch notwendig sind, um die
                Plattform bereitzustellen.
              </p>
              <div className="space-y-2">
                <p className="font-semibold text-foreground">
                  Dazu gehören insbesondere:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Kontaktdaten (z. B. Name, E-Mail-Adresse, Telefonnummer)
                  </li>
                  <li>
                    Unternehmensdaten von Autohändlern (z. B. Firmenname,
                    Standort)
                  </li>
                  <li>Inseratedaten (Fahrzeugangaben, Bilder, Preise)</li>
                  <li>Login- und Nutzungsdaten</li>
                  <li>
                    IP-Adresse, Browsertyp, Zugriffszeiten (technische Daten)
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <Separator />

          {/* 3. Zweck der Datenbearbeitung */}
          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">
              3. Zweck der Datenbearbeitung
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <div className="space-y-2">
                <p className="font-semibold text-foreground">
                  Die erhobenen Daten werden verwendet, um:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>die Nutzung der Plattform zu ermöglichen</li>
                  <li>Inserate darzustellen und zu verwalten</li>
                  <li>
                    die Kommunikation zwischen Anbietern und Interessenten zu
                    ermöglichen
                  </li>
                  <li>
                    die Sicherheit und Stabilität der Plattform zu gewährleisten
                  </li>
                  <li>
                    Missbrauch, Betrug und technische Störungen zu verhindern
                  </li>
                  <li>gesetzliche Pflichten zu erfüllen</li>
                </ul>
              </div>
            </div>
          </section>

          <Separator />

          {/* 4. Weitergabe von Daten */}
          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">
              4. Weitergabe von Daten
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <div className="space-y-2">
                <p className="font-semibold text-foreground">
                  Autovendo.ch gibt personenbezogene Daten nicht an Dritte
                  weiter, ausser:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>dies ist zur Vertragserfüllung notwendig</li>
                  <li>es besteht eine gesetzliche Verpflichtung</li>
                  <li>du hast ausdrücklich eingewilligt</li>
                </ul>
              </div>
              <p>
                Inseratedaten und Kontaktdaten, die im Inserat veröffentlicht
                werden, sind für andere Nutzer der Plattform sichtbar.
              </p>
            </div>
          </section>

          <Separator />

          {/* 5. Speicherung und Aufbewahrung */}
          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">
              5. Speicherung und Aufbewahrung
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <p>
                Personenbezogene Daten werden nur so lange gespeichert, wie dies
                für den jeweiligen Zweck erforderlich ist oder gesetzliche
                Aufbewahrungspflichten bestehen.
              </p>
              <p>
                Nach Beendigung der Nutzung oder Löschung des Nutzerkontos
                werden die Daten – soweit zulässig – gelöscht oder anonymisiert.
              </p>
            </div>
          </section>

          <Separator />

          {/* 6. Cookies und Tracking */}
          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">
              6. Cookies und Tracking
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <div className="space-y-2">
                <p className="font-semibold text-foreground">
                  Autovendo.ch verwendet Cookies und ähnliche Technologien, um:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>die Benutzerfreundlichkeit zu verbessern</li>
                  <li>grundlegende Funktionen der Plattform bereitzustellen</li>
                  <li>
                    statistische Auswertungen zur Optimierung des Angebots
                    durchzuführen
                  </li>
                </ul>
              </div>
              <p>
                Du kannst Cookies in den Einstellungen deines Browsers jederzeit
                einschränken oder deaktivieren.
              </p>
            </div>
          </section>

          <Separator />

          {/* 7. Datensicherheit */}
          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">
              7. Datensicherheit
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <div className="space-y-2">
                <p className="font-semibold text-foreground">
                  Wir treffen angemessene technische und organisatorische
                  Massnahmen, um deine Daten vor:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>unbefugtem Zugriff</li>
                  <li>Verlust</li>
                  <li>Missbrauch</li>
                  <li>Manipulation</li>
                </ul>
                <p>zu schützen.</p>
              </div>
              <p>
                Trotz aller Sicherheitsmassnahmen kann eine vollständige
                Sicherheit im Internet nicht garantiert werden.
              </p>
            </div>
          </section>

          <Separator />

          {/* 8. Rechte der betroffenen Personen */}
          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">
              8. Rechte der betroffenen Personen
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <div className="space-y-2">
                <p className="font-semibold text-foreground">
                  Du hast jederzeit das Recht:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Auskunft über deine gespeicherten Daten zu erhalten</li>
                  <li>unrichtige Daten berichtigen zu lassen</li>
                  <li>
                    die Löschung deiner Daten zu verlangen, sofern keine
                    gesetzliche Pflicht entgegensteht
                  </li>
                  <li>der Datenbearbeitung zu widersprechen</li>
                </ul>
              </div>
              <p>
                Anfragen kannst du jederzeit über die im Impressum angegebenen
                Kontaktdaten stellen.
              </p>
            </div>
          </section>

          <Separator />

          {/* 9. Änderungen der Datenschutzerklärung */}
          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">
              9. Änderungen der Datenschutzerklärung
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <p>
                Autovendo.ch behält sich vor, diese Datenschutzerklärung
                jederzeit anzupassen.
              </p>
              <p>
                Es gilt jeweils die aktuell veröffentlichte Version auf der
                Website.
              </p>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">10. Kontakt</h2>
            <p className="text-muted-foreground text-lg">
              Bei Fragen zum Datenschutz oder zur Bearbeitung deiner
              personenbezogenen Daten kontaktiere uns bitte direkt.
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
