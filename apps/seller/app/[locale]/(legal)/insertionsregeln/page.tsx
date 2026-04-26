import { Button } from "@repo/ui/src/components/button";
import { Separator } from "@repo/ui/src/components/separator";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function InsertionsregelnPage() {
  return (
    <>
      <div className="bg-linear-to-r from-primary to-primary/80">
        <div className="w-full max-w-285 mx-auto px-4 py-12">
          <div className="text-center text-white space-y-4">
            <h1 className="text-2xl md:text-4xl font-bold">Insertionsregeln</h1>
            <p className="text-base md:text-lg max-w-3xl mx-auto">
              Richtlinien für Fahrzeuginserate auf Autovendo.ch
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-285 mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          <section className="space-y-4 text-muted-foreground text-lg">
            <p>
              Diese Insertionsregeln gelten für alle Fahrzeuginserate auf
              Autovendo.ch.
            </p>
            <p>
              Sie dienen dazu, einen fairen, transparenten und sicheren
              Marktplatz für alle Autohändler sowie Kaufinteressenten zu
              gewährleisten.
            </p>
            <p className="font-semibold text-foreground">
              Mit dem Erfassen und Veröffentlichen eines Inserats akzeptierst du
              diese Regeln verbindlich.
            </p>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">
              1. Wer darf Inserate aufgeben
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <p>
                Autovendo.ch ist eine Verkaufsplattform ausschliesslich für
                Autohändler und Garagen.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Inserate dürfen nur von gewerblichen Anbietern erstellt werden
                </li>
                <li>
                  Privatpersonen sind nicht berechtigt, Fahrzeuge anzubieten
                </li>
                <li>
                  Der Anbieter muss berechtigt sein, das angebotene Fahrzeug zu
                  verkaufen
                </li>
              </ul>
              <p>
                Autovendo.ch behält sich vor, Anbieter zu überprüfen und
                Inserate bei Unklarheiten zu sperren oder zu entfernen.
              </p>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">
              2. Zulässige Fahrzeuge
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Es dürfen nur Fahrzeuge inseriert werden, die sich in der
                  Schweiz oder im Fürstentum Liechtenstein befinden
                </li>
                <li>
                  Alle Angaben zum Fahrzeug müssen wahrheitsgetreu, vollständig
                  und aktuell sein
                </li>
                <li>
                  Jedes Inserat muss sich auf ein konkretes, tatsächlich
                  verfügbares Fahrzeug beziehen
                </li>
              </ul>
              <div className="space-y-2">
                <p className="font-semibold text-foreground">
                  Unzulässig sind:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Fiktive oder nicht vorhandene Fahrzeuge</li>
                  <li>Platzhalter-Inserate</li>
                  <li>
                    Mehrfachinserate desselben Fahrzeugs ohne sachlichen Grund
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">
              3. Pflichtangaben im Inserat
            </h2>
            <div className="space-y-2 text-muted-foreground text-lg">
              <p className="font-semibold text-foreground">
                Jedes Inserat muss mindestens folgende Informationen korrekt
                enthalten:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Marke und Modell</li>
                <li>Baujahr</li>
                <li>Kilometerstand</li>
                <li>Fahrzeugzustand</li>
                <li>
                  Preis (klar und vollständig, inkl. MwSt. sofern anwendbar)
                </li>
                <li>Standort des Fahrzeugs</li>
                <li>Kontaktdaten des Anbieters</li>
              </ul>
            </div>
            <p className="font-semibold text-foreground">
              Irreführende, unvollständige oder bewusst falsche Angaben sind
              nicht erlaubt.
            </p>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">
              4. Preise und Werbung
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground text-lg">
              <li>
                Der angegebene Preis muss dem tatsächlichen Verkaufspreis
                entsprechen
              </li>
              <li>
                Lockangebote, Täuschungen oder unrealistische Preisangaben sind
                untersagt
              </li>
              <li>
                Werbung für externe Produkte, Dienstleistungen oder Webseiten
                innerhalb eines Inserats ist nicht erlaubt
              </li>
            </ul>
            <p className="font-semibold text-foreground">
              Autovendo.ch ist eine Fahrzeugplattform – keine Werbefläche für
              Drittangebote.
            </p>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">
              5. Bilder und Inhalte
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Es dürfen nur Bilder verwendet werden, an denen der Anbieter
                  die notwendigen Rechte besitzt
                </li>
                <li>
                  Die Bilder müssen das tatsächlich angebotene Fahrzeug zeigen
                </li>
                <li>
                  Symbolbilder, fremde Bilder oder irreführende Darstellungen
                  sind nicht zulässig
                </li>
              </ul>
              <div className="space-y-2">
                <p className="font-semibold text-foreground">
                  Texte dürfen keine:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    beleidigenden, diskriminierenden oder rechtswidrigen Inhalte
                    enthalten
                  </li>
                  <li>falschen Versprechen oder Garantien beinhalten</li>
                </ul>
              </div>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">
              6. Kommunikation mit Interessenten
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground text-lg">
              <li>
                Die Kommunikation mit Kaufinteressenten hat respektvoll,
                transparent und ehrlich zu erfolgen
              </li>
              <li>
                Druck, Täuschung oder Aufforderungen zu Vorauszahlungen ohne
                Besichtigung sind untersagt
              </li>
            </ul>
            <p className="font-semibold text-foreground">
              Autovendo.ch empfiehlt, Besichtigungen und Zahlungen stets
              persönlich und nachvollziehbar abzuwickeln.
            </p>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">
              7. Kontrolle und Massnahmen
            </h2>
            <div className="space-y-2 text-muted-foreground text-lg">
              <p className="font-semibold text-foreground">
                Autovendo.ch behält sich das Recht vor:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Inserate jederzeit zu prüfen</li>
                <li>
                  Inserate ohne Vorankündigung zu bearbeiten, zu deaktivieren
                  oder zu löschen
                </li>
                <li>
                  Anbieter bei wiederholten oder schweren Verstössen zu sperren
                </li>
              </ul>
            </div>
            <p className="font-semibold text-foreground">
              Ein Anspruch auf Veröffentlichung besteht nicht.
            </p>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">
              8. Ziel der Plattform
            </h2>
            <div className="space-y-2 text-muted-foreground text-lg">
              <p className="font-semibold text-foreground">
                Autovendo.ch steht für:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Fairen Wettbewerb</li>
                <li>Transparenz</li>
                <li>Vertrauen zwischen Händlern und Käufern</li>
                <li>Klare Regeln statt versteckter Fallen</li>
              </ul>
            </div>
          </section>

          <Separator />

          <section className="bg-secondary p-8 rounded-xl text-center space-y-4">
            <h3 className="text-xl font-bold">Haben Sie noch Fragen?</h3>
            <p className="text-muted-foreground">
              Wir möchten sicherstellen, dass alle Inserate fair, transparent
              und professionell ablaufen. Wenn Sie unsicher sind oder weitere
              Informationen benötigen, stehen wir Ihnen gerne zur Verfügung.
            </p>
            <Button asChild>
              <Link href="contact">
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
