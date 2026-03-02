import { Separator } from "@repo/ui/src/components/separator";
import Link from "next/link";

export default function AGBPage() {
  return (
    <>
      <div className="bg-linear-to-r from-primary to-primary/80">
        <div className="w-full max-w-285 mx-auto py-12 px-4">
          <div className="text-center text-white space-y-4">
            <h1 className="text-2xl md:text-4xl font-bold">
              Allgemeine Geschäftsbedingungen (AGB)
            </h1>
            <p className="text-base md:text-lg max-w-3xl mx-auto">
              Regelungen für die Nutzung von Autovendo.ch
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-285 mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">
              1. Geltungsbereich
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <p>
                Diese Allgemeinen Geschäftsbedingungen (AGB) regeln die Nutzung
                der Online-Plattform Autovendo.ch (nachfolgend „Autovendo“).
              </p>
              <p>
                Autovendo ist eine digitale Inserate- und Verkaufsplattform für
                Fahrzeuge und richtet sich ausschliesslich an gewerbliche
                Autohändler und Garagen.
              </p>
              <p>
                Mit der Nutzung der Plattform erklärst du dich mit diesen AGB
                einverstanden.
              </p>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">
              2. Leistungsbeschreibung
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <p>
                Autovendo stellt eine technische Plattform zur Verfügung, auf
                der Autohändler Fahrzeuge inserieren und Kaufinteressenten
                Kontakt aufnehmen können.
              </p>
              <div className="space-y-2">
                <p className="font-semibold text-foreground">Autovendo:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    ist nicht Vertragspartner der Kaufverträge zwischen Händlern
                    und Käufern
                  </li>
                  <li>vermittelt keine Zahlungen</li>
                  <li>
                    übernimmt keine Garantie für den Verkauf oder Kauf eines
                    Fahrzeugs
                  </li>
                </ul>
              </div>
              <p>
                Der Kaufvertrag kommt ausschliesslich zwischen Anbieter und
                Käufer zustande.
              </p>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">
              3. Registrierung und Nutzerkonto
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <p>Die Nutzung von Autovendo setzt eine Registrierung voraus.</p>
              <div className="space-y-2">
                <p className="font-semibold text-foreground">
                  Der Nutzer verpflichtet sich:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>ausschliesslich wahrheitsgemässe Angaben zu machen</li>
                  <li>seine Zugangsdaten vertraulich zu behandeln</li>
                  <li>das Konto nicht an Dritte weiterzugeben</li>
                </ul>
              </div>
              <p>
                Autovendo behält sich das Recht vor, Nutzerkonten zu prüfen, zu
                sperren oder zu löschen, wenn falsche Angaben gemacht oder diese
                AGB verletzt werden.
              </p>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">
              4. Inserate und Inhalte
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <div className="space-y-2">
                <p className="font-semibold text-foreground">
                  Der Anbieter ist allein verantwortlich für:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    die Richtigkeit und Vollständigkeit der Inseratsangaben
                  </li>
                  <li>
                    die Rechtmässigkeit der Inhalte (Texte, Bilder, Preise)
                  </li>
                  <li>die Einhaltung der Insertionsregeln von Autovendo.ch</li>
                </ul>
              </div>
              <p>
                Autovendo übernimmt keine Haftung für Inhalte von Inseraten oder
                die Qualität der angebotenen Fahrzeuge.
              </p>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">
              5. Preise und Zahlungsbedingungen
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <p>
                Die Nutzung von Autovendo ist kostenpflichtig gemäss den auf der
                Website veröffentlichten Preisen.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Alle Preise sind klar ausgewiesen</li>
                <li>Gebühren sind im Voraus fällig</li>
                <li>
                  Rückerstattungen sind ausgeschlossen, sofern nicht
                  ausdrücklich anders vereinbart
                </li>
              </ul>
              <p>
                Autovendo behält sich das Recht vor, Preise anzupassen.
                Änderungen werden rechtzeitig kommuniziert.
              </p>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">
              6. Pflichten der Anbieter
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <div className="space-y-2">
                <p className="font-semibold text-foreground">
                  Anbieter verpflichten sich:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    nur Fahrzeuge anzubieten, die tatsächlich verfügbar sind
                  </li>
                  <li>
                    keine irreführenden oder täuschenden Angaben zu machen
                  </li>
                  <li>geltende Gesetze und Vorschriften einzuhalten</li>
                  <li>
                    fair und respektvoll mit Interessenten zu kommunizieren
                  </li>
                </ul>
              </div>
              <p className="font-semibold text-foreground">
                Missbräuchliche Nutzung der Plattform ist untersagt.
              </p>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">
              7. Haftungsausschluss
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <div className="space-y-2">
                <p className="font-semibold text-foreground">
                  Autovendo haftet nicht für:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    die Qualität, den Zustand oder die Existenz angebotener
                    Fahrzeuge
                  </li>
                  <li>Vertragsverletzungen zwischen Händlern und Käufern</li>
                  <li>Schäden durch fehlerhafte Angaben in Inseraten</li>
                  <li>technische Ausfälle, soweit gesetzlich zulässig</li>
                </ul>
              </div>
              <p className="font-semibold text-foreground">
                Die Nutzung der Plattform erfolgt auf eigenes Risiko.
              </p>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">
              8. Sperrung und Kündigung
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <div className="space-y-2">
                <p className="font-semibold text-foreground">
                  Autovendo kann Nutzer oder Inserate jederzeit sperren oder
                  entfernen, insbesondere bei:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Verstössen gegen diese AGB</li>
                  <li>Verstössen gegen die Insertionsregeln</li>
                  <li>Verdacht auf Betrug oder Missbrauch</li>
                </ul>
              </div>
              <p>
                Ein Anspruch auf Weiterführung des Nutzerkontos besteht nicht.
              </p>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">9. Datenschutz</h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <p>
                Die Bearbeitung personenbezogener Daten erfolgt gemäss der
                Datenschutzerklärung von Autovendo.ch.
              </p>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">
              10. Änderungen der AGB
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <p>
                Autovendo behält sich das Recht vor, diese AGB jederzeit zu
                ändern.
              </p>
              <p>
                Es gilt jeweils die zum Zeitpunkt der Nutzung veröffentlichte
                Version.
              </p>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">
              11. Anwendbares Recht und Gerichtsstand
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <p>Es gilt ausschliesslich Schweizer Recht.</p>
              <p>
                Gerichtsstand ist – soweit gesetzlich zulässig – der Sitz des
                Betreibers von Autovendo.ch.
              </p>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">12. Kontakt</h2>
            <p className="text-muted-foreground text-lg">
              Bei Fragen zu diesen AGB oder zur Plattform kannst du uns
              jederzeit&nbsp;
              <Link href="contact" className="text-primary hover:underline">
                kontaktieren
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
