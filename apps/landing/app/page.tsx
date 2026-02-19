"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Card, CardContent } from "@repo/ui/components/card";
import { Separator } from "@repo/ui/components/separator";
import {
  CheckCircle2,
  Sparkles,
  Users,
  Shield,
  TrendingUp,
  Clock,
  Euro,
  Heart,
  Zap,
  MessageCircle,
  ArrowRight,
} from "lucide-react";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with email service (e.g., Mailchimp, ConvertKit)
    console.log("Email submitted:", email);
    setIsSubmitted(true);
    setEmail("");

    // Reset after 3 seconds
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <main className="flex-1">
        <div className="w-full max-w-7xl mx-auto px-4 py-12 md:py-20">
          {/* Hero Content */}
          <div className="text-center space-y-6 mb-12">
            <div className="inline-flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-full text-sm font-medium">
              <Sparkles className="h-4 w-4 text-primary" />
              Bald verfügbar
            </div>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight max-w-4xl mx-auto">
              Die Verkaufsplattform für{" "}
              <span className="text-primary">Autohändler</span> in der Schweiz
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Fair. Transparent. Unkompliziert. Menschlich.
            </p>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Verkaufen Sie Ihre Fahrzeuge einfach und effizient – ohne
              versteckte Kosten, ohne komplizierte Prozesse. Mit persönlichem
              Support, der zuhört.
            </p>

            <div className="max-w-md mx-auto pt-4">
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="ihre.email@beispiel.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 h-12"
                  />
                  <Button type="submit" size="lg" className="h-12">
                    Frühen Zugang sichern
                  </Button>
                </form>
              ) : (
                <div className="flex items-center justify-center gap-2 bg-secondary h-12 rounded-md text-sm font-medium">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Vielen Dank! Wir melden uns bald.
                </div>
              )}
              <p className="text-sm text-muted-foreground mt-3">
                Seien Sie bei den Ersten dabei. Keine Spam-Mails, versprochen.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-16">
            <div className="space-y-3 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Fair & Transparent</h3>
              <p className="text-muted-foreground">
                Klare Preise ohne versteckte Gebühren. Sie wissen immer, wofür
                Sie bezahlen.
              </p>
            </div>

            <div className="space-y-3 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Einfach & Effizient</h3>
              <p className="text-muted-foreground">
                Inserieren Sie Fahrzeuge in Minuten. Keine unnötigen Prozesse,
                keine Bürokratie.
              </p>
            </div>

            <div className="space-y-3 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Persönlich & Menschlich</h3>
              <p className="text-muted-foreground">
                Direkter Kontakt zu echten Menschen. Freundlich, respektvoll,
                lösungsorientiert.
              </p>
            </div>
          </div>

          {/* Why Section */}
          <div className="max-w-3xl mx-auto mt-16 text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              Warum Autovendo.ch?
            </h2>
            <p className="text-lg text-muted-foreground">
              Wir verstehen die Herausforderungen im Händleralltag. Deshalb
              haben wir eine Plattform entwickelt, die wirklich mitdenkt – mit
              fairen Preisen, einfacher Handhabung und echtem, persönlichem
              Support.
            </p>
            <div className="grid gap-3 text-left max-w-md mx-auto pt-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-primary shrink-0 h-5 w-5" />
                <span>Für alle Autohändler in der Schweiz</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-primary shrink-0 h-5 w-5" />
                <span>Wettbewerbsfähige Preise</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-primary shrink-0 h-5 w-5" />
                <span>Jederzeit persönlich erreichbar</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-primary shrink-0 h-5 w-5" />
                <span>Entwickelt mit Händlern für Händler</span>
              </div>
            </div>
          </div>

          <Separator className="my-16" />

          {/* Benefits Cards Section */}
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Was Sie erwarten können
              </h2>
              <p className="text-lg text-muted-foreground">
                Eine Plattform, die auf Ihre Bedürfnisse zugeschnitten ist
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                    <Euro className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Faire Preisgestaltung</h3>
                  <p className="text-muted-foreground">
                    Transparente Kosten ohne versteckte Gebühren. Investieren
                    Sie nur dort, wo es sich lohnt.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Blitzschnelle Inserate</h3>
                  <p className="text-muted-foreground">
                    Fahrzeuge in wenigen Minuten inserieren. Keine komplizierte
                    Navigation, kein Papierkram.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Echter Support</h3>
                  <p className="text-muted-foreground">
                    Sprechen Sie mit echten Menschen, die Ihre Herausforderungen
                    verstehen und schnell helfen.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Zeit sparen</h3>
                  <p className="text-muted-foreground">
                    Weniger Verwaltungsaufwand bedeutet mehr Zeit für Ihr
                    Kerngeschäft – den Verkauf.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Maximale Sichtbarkeit</h3>
                  <p className="text-muted-foreground">
                    Ihre Fahrzeuge erreichen die richtigen Käufer zur richtigen
                    Zeit – effizient und gezielt.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Partnerschaft</h3>
                  <p className="text-muted-foreground">
                    Wir entwickeln die Plattform mit Ihrem Feedback weiter. Ihre
                    Meinung zählt.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator className="my-16" />

          {/* The Difference Section */}
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Der Unterschied zu anderen Plattformen
                </h2>
                <p className="text-lg text-muted-foreground">
                  Andere Plattformen konzentrieren sich auf Automatisierung und
                  Masse. Wir konzentrieren uns auf Sie.
                </p>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <CheckCircle2 className="text-primary shrink-0 h-5 w-5 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-1">Keine Zwangspakete</h4>
                      <p className="text-muted-foreground text-sm">
                        Zahlen Sie nur für das, was Sie wirklich brauchen.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="text-primary shrink-0 h-5 w-5 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-1">
                        Kein anonymer Support
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        Direkter Draht zu echten Ansprechpartnern, die Ihnen
                        helfen.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="text-primary shrink-0 h-5 w-5 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-1">
                        Keine versteckten Kosten
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        Alle Preise sind klar kommuniziert und transparent.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="text-primary shrink-0 h-5 w-5 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-1">
                        Keine komplizierte Bedienung
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        Intuitiv, einfach, effizient – genau wie es sein sollte.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-secondary p-8 md:p-12 rounded-xl space-y-6">
                <h3 className="text-2xl font-bold">Für wen ist Autovendo?</h3>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Kleine Händler:</strong>{" "}
                    Faire Preise und persönlicher Support ohne Mindestvolumen.
                  </p>
                  <p>
                    <strong className="text-foreground">
                      Mittlere Händler:
                    </strong>{" "}
                    Skalierbare Lösung, die mit Ihrem Geschäft wächst.
                  </p>
                  <p>
                    <strong className="text-foreground">Grosse Händler:</strong>{" "}
                    Effiziente Verwaltung vieler Fahrzeuge ohne Overhead.
                  </p>
                  <Separator />
                  <p className="text-foreground font-semibold">
                    Kurz gesagt: Für alle, die Wert auf Fairness, Transparenz
                    und echte Partnerschaft legen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} Autovendo.ch. Alle Rechte
              vorbehalten.
            </p>
            <p>
              Fragen? Schreiben Sie uns:{" "}
              <a
                href="mailto:info@autovendo.ch"
                className="text-primary hover:underline"
              >
                info@autovendo.ch
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
