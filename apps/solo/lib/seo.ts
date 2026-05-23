import type { Metadata } from "next";

const BASE_URL = "https://autosolo.ch";
const LOCALES = ["de", "en", "fr", "it"] as const;
type Locale = (typeof LOCALES)[number];

const OG_LOCALE: Record<Locale, string> = {
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
      siteName: "AutoSolo",
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

// ─── Per-page keyword-optimised metadata ──────────────────────────────────────

export const PAGE_META = {
  home: {
    de: {
      title: "Auto privat verkaufen Schweiz | AutoSolo",
      description:
        "Inserate von Privatverkäufern in der Schweiz. Auto direkt verkaufen ohne Händler – fair, einfach, ohne Abo. Ab CHF 19 pro Inserat auf autosolo.ch.",
    },
    en: {
      title: "Sell Your Car Privately in Switzerland | AutoSolo",
      description:
        "Private car listings across Switzerland. Sell your car directly – no dealer, no subscription. From CHF 19 per listing on autosolo.ch.",
    },
    fr: {
      title: "Vendre sa voiture en privé en Suisse | AutoSolo",
      description:
        "Annonces de particuliers en Suisse. Vendez votre voiture directement – sans concessionnaire, sans abonnement. Dès CHF 19 par annonce sur autosolo.ch.",
    },
    it: {
      title: "Vendere auto privati in Svizzera | AutoSolo",
      description:
        "Annunci di privati in Svizzera. Vendi la tua auto direttamente – senza concessionario, senza abbonamento. Da CHF 19 per annuncio su autosolo.ch.",
    },
  } satisfies PageMeta,

  cars: {
    de: {
      title: "Occasionen von Privat kaufen – Schweiz | AutoSolo",
      description:
        "Alle Privatinserate der Schweiz: BMW, Mercedes, VW, Audi und mehr. Gebrauchtwagen direkt vom Privatverkäufer kaufen – fair und ohne Händleraufschlag.",
    },
    en: {
      title: "Buy Used Cars from Private Sellers – Switzerland | AutoSolo",
      description:
        "Private car listings in Switzerland. BMW, Mercedes, VW, Audi and more – buy used cars directly from private sellers on autosolo.ch.",
    },
    fr: {
      title: "Acheter voiture d'occasion de particulier – Suisse | AutoSolo",
      description:
        "Annonces de particuliers en Suisse. BMW, Mercedes, VW, Audi et plus – achetez une occasion directement chez un particulier sur autosolo.ch.",
    },
    it: {
      title: "Comprare auto usate da privati – Svizzera | AutoSolo",
      description:
        "Annunci privati in Svizzera. BMW, Mercedes, VW, Audi e altri – acquista auto usate direttamente da privati su autosolo.ch.",
    },
  } satisfies PageMeta,

  pricing: {
    de: {
      title: "Preise – Auto inserieren Schweiz | AutoSolo",
      description:
        "Klare Preise ohne Abo: CHF 19 für 30 Tage oder CHF 49 bis zum Verkauf. Auto inserieren auf autosolo.ch – einfach, fair, einmalig.",
    },
    en: {
      title: "Pricing – List Your Car in Switzerland | AutoSolo",
      description:
        "Simple pay-per-listing pricing: CHF 19 for 30 days or CHF 49 until sold. No subscription, no hidden costs – autosolo.ch.",
    },
    fr: {
      title: "Tarifs – Publier une annonce auto en Suisse | AutoSolo",
      description:
        "Tarifs clairs sans abonnement : CHF 19 pour 30 jours ou CHF 49 jusqu'à la vente. Sans frais cachés sur autosolo.ch.",
    },
    it: {
      title: "Prezzi – Inserire auto in Svizzera | AutoSolo",
      description:
        "Prezzi chiari senza abbonamento: CHF 19 per 30 giorni o CHF 49 fino alla vendita. Senza costi nascosti su autosolo.ch.",
    },
  } satisfies PageMeta,

  faq: {
    de: {
      title: "FAQ – Häufige Fragen zu AutoSolo | Auto privat verkaufen",
      description:
        "Antworten auf die häufigsten Fragen: Inserate aufgeben, Preise, Registrierung und mehr. Auto privat verkaufen auf autosolo.ch.",
    },
    en: {
      title: "FAQ – Frequently Asked Questions | AutoSolo Switzerland",
      description:
        "Answers to common questions about autosolo.ch: listings, pricing, registration and more. Sell your car privately in Switzerland.",
    },
    fr: {
      title: "FAQ – Questions fréquentes sur AutoSolo | Suisse",
      description:
        "Réponses aux questions sur autosolo.ch: annonces, prix, inscription. Vendez votre voiture entre particuliers en Suisse.",
    },
    it: {
      title: "FAQ – Domande frequenti su AutoSolo | Svizzera",
      description:
        "Risposte alle domande su autosolo.ch: annunci, prezzi, registrazione. Vendi la tua auto tra privati in Svizzera.",
    },
  } satisfies PageMeta,

  about: {
    de: {
      title: "Über AutoSolo – Auto privat verkaufen in der Schweiz",
      description:
        "Autosolo.ch ist die Plattform für Privatverkäufer in der Schweiz. Fair, transparent, ohne Abo – ab CHF 19 pro Inserat.",
    },
    en: {
      title: "About AutoSolo – Private Car Sales in Switzerland",
      description:
        "AutoSolo.ch is the platform for private car sellers in Switzerland. Fair, transparent, no subscription – from CHF 19 per listing.",
    },
    fr: {
      title: "À propos – AutoSolo, vente auto entre particuliers en Suisse",
      description:
        "Autosolo.ch est la plateforme pour les vendeurs particuliers en Suisse. Équitable, transparent, sans abonnement – dès CHF 19 par annonce.",
    },
    it: {
      title: "Chi siamo – AutoSolo, vendita auto tra privati in Svizzera",
      description:
        "Autosolo.ch è la piattaforma per i venditori privati in Svizzera. Equo, trasparente, senza abbonamento – da CHF 19 per annuncio.",
    },
  } satisfies PageMeta,
} as const;
