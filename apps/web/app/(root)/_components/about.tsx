import { Handshake, Zap, ShieldCheck, CircleDollarSign } from "lucide-react";
import { FeatureItem } from "./feature-item";

export const About = () => {
  return (
    <section className="py-12">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold mb-4 text-foreground">
          Über Autovendo.ch
        </h2>

        <p className="text-xl font-semibold text-primary mb-6">
          Fair. Transparent. Unkompliziert. Menschlich.
        </p>

        <p className="text-lg text-muted-foreground w-full max-w-3xl mx-auto mb-12">
          Autovendo.ch ist die Verkaufsplattform für alle Autohändler in der
          Schweiz. Wir haben Autovendo mit einem klaren Ziel entwickelt: Den
          Verkauf von Fahrzeugen einfach, effizient und fair zu gestalten — ohne
          unnötigen Verwaltungsaufwand.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureItem
            icon={Zap}
            title="Effizienz & Struktur"
            description="Einfache Handhabung, klare Abläufe und gezielte Sichtbarkeit für Ihre Fahrzeuge."
          />
          <FeatureItem
            icon={Handshake}
            title="Menschlichkeit"
            description="Persönlicher Kontakt, echtes Interesse und respektvoller Umgang jederzeit."
          />
          <FeatureItem
            icon={ShieldCheck}
            title="Zuverlässigkeit"
            description="Erreichbar, unkompliziert und stets lösungsorientiert für Sie da."
          />
          <FeatureItem
            icon={CircleDollarSign}
            title="Transparenz"
            description="Klare, wettbewerbsfähige Preise ohne versteckte Gebühren oder Zwangspakete."
          />
        </div>
      </div>
    </section>
  );
};
