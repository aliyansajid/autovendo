import { Badge } from "@repo/ui/src/components/badge";
import { Button } from "@repo/ui/src/components/button";
import { Card, CardContent } from "@repo/ui/src/components/card";
import { Separator } from "@repo/ui/src/components/separator";
import {
  Check,
  Car,
  Camera,
  Sun,
  Zap,
  MessageSquare,
  ClipboardList,
  BarChart3,
  Users,
  type LucideIcon,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function SellPage() {
  return (
    <>
      <section className="relative w-full bg-[url('https://images.pexels.com/photos/7144172/pexels-photo-7144172.jpeg')] bg-cover bg-position-[80%_20%]">
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 max-w-285 mx-auto px-4 py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Der Partner für professionelle Autohändler
          </h1>

          <p className="text-lg text-white/90 mb-8 font-medium">
            Autovendo — Inserieren Sie Ihren Bestand auf dem grössten Schweizer
            Marktplatz.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild>
              <Link href="/vehicle-form">Jetzt inserieren</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/pricing">Händlerlösungen anzeigen</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="max-w-285 mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
          Erreichen Sie mehr Käufer&nbsp;
          <span className="inline-block border-b-4 border-primary pb-1">
            effizient
          </span>
          &nbsp;und effektiv
        </h2>

        <Card className="max-w-2xl mx-auto">
          <CardContent className="space-y-6 text-center">
            <Users className="size-24 mx-auto text-primary" strokeWidth={1} />

            <div className="space-y-1">
              <h3 className="text-xl md:text-2xl font-bold">
                Professionelle Händlerwerbung
              </h3>
              <p className="text-sm text-muted-foreground font-semibold uppercase">
                MAXIMALE SICHTBARKEIT • HOCHWERTIGE LEADS
              </p>
            </div>

            <p className="text-muted-foreground max-w-lg mx-auto">
              Präsentieren Sie Ihren Bestand jeden Monat Millionen potenziellen
              Käufern. Autovendo bietet professionelle Tools, die speziell auf
              die Bedürfnisse moderner Schweizer Autohäuser zugeschnitten sind.
            </p>

            <Badge
              variant="secondary"
              className="px-3 py-1 text-sm font-medium"
            >
              Über 500 Händler in der Schweiz vertrauen uns
            </Badge>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href="/vehicle-form">
                  Erstellen Sie Ihr erstes Inserat
                  <ArrowRight />
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/pricing">
                  So funktioniert&apos;s
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="bg-secondary">
        <div className="max-w-285 mx-auto px-4 py-12">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
              Ihre Vorteile mit&nbsp;
              <span className="inline-block border-b-4 border-primary pb-1">
                Autovendo für Händler
              </span>
            </h2>

            <div className="grid md:grid-cols-2 gap-x-12 gap-y-12">
              <div className="space-y-6">
                <div className="flex flex-col gap-3">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-primary">
                    <Check />
                    Performance & Wachstum
                  </h3>
                </div>

                <Separator />

                <ul className="space-y-4">
                  <FeatureItem
                    isIncluded={true}
                    text="Hochwertige Leads: Direkte Anfragen von seriösen Käufern, die zum Kauf bereit sind."
                  />
                  <FeatureItem
                    isIncluded={true}
                    text="Maximale Reichweite: Ihre Fahrzeuge werden prominent auf unserem hochfrequentierten Portal präsentiert."
                  />
                  <FeatureItem
                    isIncluded={true}
                    text="Regionales Targeting: Erreichen Sie lokale Käufer in Ihrer spezifischen Region effektiv."
                  />
                  <FeatureItem
                    isIncluded={true}
                    text="Markenautorität: Eigene Händlerseiten helfen dabei, Vertrauen bei potenziellen Kunden aufzubauen."
                  />
                </ul>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col gap-3">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-primary">
                    <Check />
                    Effizienz & Tools
                  </h3>
                </div>

                <Separator />

                <ul className="space-y-4">
                  <FeatureItem
                    isIncluded={true}
                    text="Bestandssynchronisierung: Importieren Sie Ihren Bestand automatisch aus gängigen DMS-Systemen."
                  />
                  <FeatureItem
                    isIncluded={true}
                    text="Smart Listing: Sparen Sie Zeit durch automatische Technikdaten und Energie-Infos."
                  />
                  <FeatureItem
                    isIncluded={true}
                    text="Performance-Tracking: Überwachen Sie Ihre Inseratsstatistiken und optimieren Sie Ihre Strategie."
                  />
                  <FeatureItem
                    isIncluded={true}
                    text="Lead-Management: Verwalten Sie alle Kundenanfragen in einem zentralen Dashboard."
                  />
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-285 mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
          Wir unterstützen Ihr&nbsp;
          <span className="inline-block border-b-4 border-primary pb-1">
            tägliches Geschäft
          </span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          <ServiceDetail
            title="Bestandssynchronisierung"
            description="Nahtlose Integration in Ihr bestehendes Dealer Management System."
            icon={BarChart3}
          />

          <ServiceDetail
            title="Daten automatisch ausfüllen"
            description="Unser System unterstützt Sie bei der Eingabe von Technik- und Ausstattungsdetails."
            icon={ClipboardList}
          />

          <ServiceDetail
            title="Konformität"
            description="Wir stellen sicher, dass alle Inserate die gesetzlichen Anforderungen an Energieetiketten und CO2 erfüllen."
            icon={Zap}
          />

          <ServiceDetail
            title="Verifizierte Leads"
            description="Erhalten Sie hochwertige Leads direkt von interessierten Schweizer Käufern."
            icon={MessageSquare}
          />
        </div>
      </section>

      <section className="bg-secondary px-4 py-12">
        <div className="max-w-285 mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
            Professionelle Präsentation&nbsp;
            <span className="inline-block border-b-4 border-primary pb-1">
              steigert
            </span>
            &nbsp;Ihren Erfolg
          </h2>

          <div className="flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-24">
            <div className="w-full max-w-[300px]">
              <div className="aspect-square bg-white rounded-3xl p-8 shadow-xl flex items-center justify-center rotate-3">
                <Camera className="size-32 text-primary" strokeWidth={1} />
              </div>
            </div>

            <div className="w-full md:w-1/2 space-y-8">
              <PhotoTip
                number={1}
                title="Konsistente Umgebung"
                description="Nutzen Sie Ihren Showroom oder einen neutralen Ort, um eine professionelle Händlermarke aufzubauen."
                icon={Sun}
              />
              <PhotoTip
                number={2}
                title="Vollständiger Rundgang"
                description="Zeigen Sie jeden Winkel, einschliesslich Details im Innenraum und Besonderheiten des Modells."
                icon={Camera}
              />
              <PhotoTip
                number={3}
                title="Innenraum & Extras"
                description="Dokumentieren Sie hochwertige Ausstattung und den Zustand der Kabine präzise."
                icon={Car}
              />
              <p className="text-sm text-muted-foreground italic pl-12">
                Experten-Tipp: Konsistente, hochwertige Fotos bauen
                langfristiges Vertrauen in Ihre Händlermarke auf.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-285 mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">
          Bereit, Ihr&nbsp;
          <span className="inline-block border-b-4 border-primary pb-1">
            Verkaufsvolumen
          </span>
          &nbsp;zu steigern?
        </h2>

        <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
          <div className="space-y-2">
            <h3 className="text-xl md:text-2xl font-bold">
              Listen Sie Ihren Bestand auf Autovendo
            </h3>
            <p className="text-lg text-muted-foreground font-medium uppercase">
              PROFESSIONELL • SKALIERBAR • EFFEKTIV
            </p>
          </div>
          <p className="text-muted-foreground text-lg max-w-lg">
            Werden Sie Teil des professionellen Netzwerks von Schweizer
            Autohändlern. Unsere Pakete sind darauf zugeschnitten, Autohäusern
            jeder Grösse zum Erfolg im digitalen Markt zu verhelfen.
          </p>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/vehicle-form">
                Jetzt starten
                <ArrowRight />
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/contact">
                Verkaufsteam kontaktieren
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function PhotoTip({
  number,
  title,
  description,
  icon: Icon,
}: {
  number: number;
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="flex gap-4">
      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center shrink-0 font-bold mt-1">
        {number}
      </div>
      <div>
        <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
          <Icon className="size-5 text-primary" />
          {title}
        </h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function ServiceDetail({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="flex flex-col items-center">
      <Icon className="size-16 text-primary mb-4" strokeWidth={1} />
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function FeatureItem({
  isIncluded,
  text,
}: {
  isIncluded: boolean;
  text: string;
}) {
  return (
    <li className={`flex gap-3 ${!isIncluded ? "text-muted-foreground" : ""}`}>
      <div
        className={`${
          isIncluded ? "bg-green-100" : "bg-muted"
        } rounded-full p-1 size-6 flex items-center justify-center`}
      >
        <Check className="size-4 text-green-700" strokeWidth={3} />
      </div>
      <span className="text-sm md:text-base">{text}</span>
    </li>
  );
}
