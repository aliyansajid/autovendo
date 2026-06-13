import type { Metadata } from "next";

export const BASE_URL = "https://autovendo.ch";
export const LOCALES = ["de", "en", "fr", "it"] as const;
type Locale = (typeof LOCALES)[number];

export const OG_LOCALE: Record<Locale, string> = {
  de: "de_CH",
  en: "en_US",
  fr: "fr_CH",
  it: "it_CH",
};

function toLocale(locale: string): Locale {
  return (LOCALES.includes(locale as Locale) ? locale : "de") as Locale;
}

export function buildAlternates(locale: string, path: string) {
  return {
    canonical: `${BASE_URL}/${locale}${path}`,
    languages: Object.fromEntries(
      LOCALES.map((l) => [l, `${BASE_URL}/${l}${path}`]),
    ) as Record<string, string>,
  };
}

type LocaleMeta = { title: string; description: string };
type PageMeta = Record<Locale, LocaleMeta>;

export function buildMetadata(
  locale: string,
  path: string,
  pageMeta: PageMeta,
  ogImage?: string,
): Metadata {
  const l = toLocale(locale);
  const { title, description } = pageMeta[l];
  const image = ogImage ?? "/web-app-manifest-512x512.png";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}${path}`,
      siteName: "AutoVendo",
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      locale: OG_LOCALE[l],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    alternates: buildAlternates(locale, path),
  };
}

// ─── Per-page keyword-optimised metadata (DE primary, all 4 locales) ──────────

export const PAGE_META = {
  home: {
    de: {
      title: "Gebrauchtwagen & Occasionen kaufen Schweiz | AutoVendo",
      description:
        "Tausende Gebrauchtwagen und Occasionen von verifizierten Schweizer Händlern. Günstiger als AutoScout24 – faire Preise, keine versteckten Kosten. Jetzt suchen.",
    },
    en: {
      title: "Buy Used Cars & Occasions in Switzerland | AutoVendo",
      description:
        "Thousands of used cars from verified Swiss dealers. More affordable than AutoScout24 – fair prices, no hidden costs. Search now on autovendo.ch.",
    },
    fr: {
      title: "Acheter voiture d'occasion en Suisse | AutoVendo",
      description:
        "Des milliers de voitures d'occasion chez des concessionnaires vérifiés. Moins cher qu'AutoScout24 – prix équitables, sans frais cachés. Cherchez maintenant.",
    },
    it: {
      title: "Comprare auto usate in Svizzera | AutoVendo",
      description:
        "Migliaia di auto usate da concessionari verificati. Più economico di AutoScout24 – prezzi equi, senza costi nascosti. Cerca ora su autovendo.ch.",
    },
  } satisfies PageMeta,

  cars: {
    de: {
      title:
        "Gebrauchtwagen & Occasionen kaufen – Inserate Schweiz | AutoVendo",
      description:
        "Alle Gebrauchtwagen-Inserate der Schweiz: BMW, Mercedes, VW, Audi, Skoda, Dacia und mehr. Occasionen günstig kaufen – faire Alternative zu AutoScout24.",
    },
    en: {
      title: "Used Car Listings Switzerland – Buy Occasions | AutoVendo",
      description:
        "All used car listings in Switzerland. BMW, Mercedes, VW, Audi and more – buy occasions at fair prices on autovendo.ch.",
    },
    fr: {
      title: "Annonces voitures d'occasion Suisse | AutoVendo",
      description:
        "Toutes les annonces de voitures d'occasion en Suisse. BMW, Mercedes, VW, Audi et plus – achetez une occasion au meilleur prix sur autovendo.ch.",
    },
    it: {
      title: "Annunci auto usate Svizzera | AutoVendo",
      description:
        "Tutti gli annunci di auto usate in Svizzera. BMW, Mercedes, VW, Audi e altri – acquista a prezzi convenienti su autovendo.ch.",
    },
  } satisfies PageMeta,

  dealers: {
    de: {
      title: "Autohändler & Garagen in der Schweiz | AutoVendo",
      description:
        "Verifizierte Autohändler und Garagen aus der ganzen Schweiz. Occasionen und Gebrauchtwagen direkt vom Händler kaufen auf autovendo.ch.",
    },
    en: {
      title: "Car Dealers & Garages in Switzerland | AutoVendo",
      description:
        "Verified car dealers and garages across Switzerland. Buy used cars and occasions directly from dealers on autovendo.ch.",
    },
    fr: {
      title: "Concessionnaires & Garages en Suisse | AutoVendo",
      description:
        "Concessionnaires automobiles vérifiés dans toute la Suisse. Achetez des voitures d'occasion directement auprès des concessionnaires sur autovendo.ch.",
    },
    it: {
      title: "Concessionari & Officine in Svizzera | AutoVendo",
      description:
        "Concessionari auto verificati in tutta la Svizzera. Acquista auto usate direttamente dai concessionari su autovendo.ch.",
    },
  } satisfies PageMeta,

  pricing: {
    de: {
      title:
        "Autoinserat aufgeben Schweiz – Faire Preise ab CHF 180 | AutoVendo",
      description:
        "Inserieren Sie Ihre Fahrzeuge günstiger als bei AutoScout24. Händlerpakete ab CHF 180/Monat. Faire Preise, keine versteckten Kosten – autovendo.ch.",
    },
    en: {
      title: "Car Listing Prices Switzerland – From CHF 180/mo | AutoVendo",
      description:
        "List your vehicles affordably on autovendo.ch – significantly cheaper than AutoScout24. Dealer packages from CHF 180/month. No hidden costs.",
    },
    fr: {
      title: "Publier annonce auto Suisse – Dès CHF 180/mois | AutoVendo",
      description:
        "Publiez vos annonces à petit prix – bien moins cher qu'AutoScout24. Forfaits dès CHF 180/mois. Sans frais cachés sur autovendo.ch.",
    },
    it: {
      title: "Inserire auto Svizzera – Da CHF 180/mese | AutoVendo",
      description:
        "Inserisci i tuoi veicoli a prezzi convenienti – molto più economico di AutoScout24. Pacchetti da CHF 180/mese. Senza costi nascosti.",
    },
  } satisfies PageMeta,

  howItWorks: {
    de: {
      title: "Wie funktioniert AutoVendo? – Auto inserieren in 5 Schritten",
      description:
        "In 5 einfachen Schritten zum Händlerprofil auf autovendo.ch. Fahrzeuge inserieren, mehr Käufer erreichen – günstiger als AutoScout24.",
    },
    en: {
      title: "How AutoVendo Works – List Your Vehicles in 5 Steps",
      description:
        "Create your dealer profile on autovendo.ch in 5 simple steps. List vehicles, reach more buyers – easier and cheaper than AutoScout24.",
    },
    fr: {
      title: "Comment fonctionne AutoVendo? – 5 étapes simples",
      description:
        "Créez votre profil concessionnaire en 5 étapes. Publiez vos annonces, atteignez plus d'acheteurs – plus simple et moins cher qu'AutoScout24.",
    },
    it: {
      title: "Come funziona AutoVendo? – 5 semplici passi",
      description:
        "Crea il tuo profilo concessionario in 5 passi. Inserisci veicoli, raggiungi più acquirenti – più semplice ed economico di AutoScout24.",
    },
  } satisfies PageMeta,

  faq: {
    de: {
      title: "FAQ – Häufige Fragen zu AutoVendo | Händlerplattform Schweiz",
      description:
        "Antworten auf die häufigsten Fragen: Inserate, Preise, Registrierung und mehr. Die günstige und faire Alternative zu AutoScout24 für Schweizer Händler.",
    },
    en: {
      title: "FAQ – Frequently Asked Questions | AutoVendo Switzerland",
      description:
        "Answers to common questions about autovendo.ch: listings, pricing, registration and more. The fair and affordable alternative to AutoScout24.",
    },
    fr: {
      title: "FAQ – Questions fréquentes sur AutoVendo | Suisse",
      description:
        "Réponses aux questions sur autovendo.ch: annonces, prix, inscription. L'alternative équitable et abordable à AutoScout24.",
    },
    it: {
      title: "FAQ – Domande frequenti su AutoVendo | Svizzera",
      description:
        "Risposte alle domande su autovendo.ch: annunci, prezzi, registrazione. L'alternativa equa ed economica ad AutoScout24.",
    },
  } satisfies PageMeta,

  about: {
    de: {
      title: "Über AutoVendo – Die faire Autoplattform der Schweiz",
      description:
        "Autovendo.ch ist die günstige Alternative zu AutoScout24 für Schweizer Autohändler. Fair, transparent, ohne versteckte Kosten. Inserieren ab CHF 180/Monat.",
    },
    en: {
      title: "About AutoVendo – Switzerland's Fair Car Platform",
      description:
        "AutoVendo.ch is the affordable alternative to AutoScout24 for Swiss car dealers. Fair, transparent, no hidden costs. List from CHF 180/month.",
    },
    fr: {
      title: "À propos – AutoVendo, la plateforme auto équitable de Suisse",
      description:
        "Autovendo.ch est l'alternative abordable à AutoScout24 pour les concessionnaires suisses. Équitable, transparent, sans frais cachés.",
    },
    it: {
      title: "Chi siamo – AutoVendo, la piattaforma auto equa della Svizzera",
      description:
        "Autovendo.ch è l'alternativa conveniente ad AutoScout24 per i concessionari svizzeri. Equo, trasparente, senza costi nascosti.",
    },
  } satisfies PageMeta,

  sell: {
    de: {
      title: "Auto inserieren Schweiz – Günstiger als AutoScout24 | AutoVendo",
      description:
        "Schalten Sie Ihr Autoinserat auf autovendo.ch. Händlerpakete ab CHF 180/Monat – deutlich günstiger als AutoScout24. Mehr Käufer, weniger Kosten.",
    },
    en: {
      title:
        "List Your Car in Switzerland – Cheaper than AutoScout | AutoVendo",
      description:
        "Post your car listing on autovendo.ch. Dealer packages from CHF 180/month – significantly cheaper than AutoScout24. More buyers, lower costs.",
    },
    fr: {
      title:
        "Déposer annonce auto Suisse – Moins cher qu'AutoScout | AutoVendo",
      description:
        "Publiez votre annonce sur autovendo.ch. Forfaits dès CHF 180/mois – bien moins cher qu'AutoScout24. Plus d'acheteurs, moins de frais.",
    },
    it: {
      title: "Inserire auto Svizzera – Più economico di AutoScout | AutoVendo",
      description:
        "Pubblica il tuo annuncio su autovendo.ch. Pacchetti da CHF 180/mese – molto più economico di AutoScout24. Più acquirenti, meno costi.",
    },
  } satisfies PageMeta,

  contact: {
    de: {
      title: "Kontakt – AutoVendo Schweiz",
      description:
        "Kontaktieren Sie AutoVendo – wir helfen Ihnen bei Fragen zu Inseraten, Händlerpaketen und mehr. Schreiben Sie uns oder rufen Sie uns an.",
    },
    en: {
      title: "Contact – AutoVendo Switzerland",
      description:
        "Get in touch with AutoVendo – we're here to help with listings, dealer packages and more. Write to us or give us a call.",
    },
    fr: {
      title: "Contact – AutoVendo Suisse",
      description:
        "Contactez AutoVendo – nous sommes là pour vous aider avec les annonces, les forfaits et plus encore. Écrivez-nous ou appelez-nous.",
    },
    it: {
      title: "Contatto – AutoVendo Svizzera",
      description:
        "Contattate AutoVendo – siamo qui per aiutarvi con gli annunci, i pacchetti e altro ancora. Scriveteci o chiamateci.",
    },
  } satisfies PageMeta,

  advancedSearch: {
    de: {
      title: "Erweiterte Suche – Gebrauchtwagen Schweiz | AutoVendo",
      description:
        "Finden Sie Ihr Wunschauto mit der erweiterten Suche auf autovendo.ch. Filtern Sie nach Marke, Modell, Preis, Kilometer und mehr.",
    },
    en: {
      title: "Advanced Search – Used Cars Switzerland | AutoVendo",
      description:
        "Find your perfect car with advanced search on autovendo.ch. Filter by make, model, price, mileage and more.",
    },
    fr: {
      title: "Recherche avancée – Voitures d'occasion Suisse | AutoVendo",
      description:
        "Trouvez votre voiture idéale avec la recherche avancée sur autovendo.ch. Filtrez par marque, modèle, prix, kilométrage et plus.",
    },
    it: {
      title: "Ricerca avanzata – Auto usate Svizzera | AutoVendo",
      description:
        "Trova la tua auto ideale con la ricerca avanzata su autovendo.ch. Filtra per marca, modello, prezzo, chilometri e altro.",
    },
  } satisfies PageMeta,
} as const;
