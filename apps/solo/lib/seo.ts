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
      title: "Auto privat kaufen & verkaufen Schweiz | AutoSolo",
      description:
        "Tausende Gebrauchtwagen von Privatverkäufern in der Schweiz. Günstig Auto kaufen ohne Händleraufschlag – direkt von privat auf autosolo.ch.",
    },
    en: {
      title: "Buy & Sell Used Cars Privately in Switzerland | AutoSolo",
      description:
        "Thousands of used cars from private sellers in Switzerland. Buy affordable cars without dealer markup – directly from private sellers on autosolo.ch.",
    },
    fr: {
      title: "Acheter & vendre voiture entre particuliers Suisse | AutoSolo",
      description:
        "Des milliers de voitures d'occasion de particuliers en Suisse. Achetez sans frais de concessionnaire – directement entre particuliers sur autosolo.ch.",
    },
    it: {
      title: "Comprare & vendere auto tra privati in Svizzera | AutoSolo",
      description:
        "Migliaia di auto usate da privati in Svizzera. Acquista senza ricarico del concessionario – direttamente tra privati su autosolo.ch.",
    },
  } satisfies PageMeta,

  cars: {
    de: {
      title: "Gebrauchtwagen von Privat kaufen Schweiz | AutoSolo",
      description:
        "Alle Privatinserate für Gebrauchtwagen in der Schweiz. BMW, Mercedes, VW, Audi von Privat kaufen – keine Händlergebühren, faire Preise auf autosolo.ch.",
    },
    en: {
      title: "Buy Used Cars from Private Sellers Switzerland | AutoSolo",
      description:
        "All private car listings in Switzerland. Buy BMW, Mercedes, VW, Audi from private sellers – no dealer fees, fair prices on autosolo.ch.",
    },
    fr: {
      title: "Acheter voiture de particulier en Suisse | AutoSolo",
      description:
        "Toutes les annonces privées de voitures en Suisse. Achetez BMW, Mercedes, VW, Audi de particuliers – sans frais de concessionnaire sur autosolo.ch.",
    },
    it: {
      title: "Comprare auto da privati in Svizzera | AutoSolo",
      description:
        "Tutti gli annunci privati di auto in Svizzera. Acquista BMW, Mercedes, VW, Audi da privati – senza spese di concessionario su autosolo.ch.",
    },
  } satisfies PageMeta,

  pricing: {
    de: {
      title: "Auto inserieren Schweiz – Privatinserat ab CHF 180 | AutoSolo",
      description:
        "Schalten Sie Ihr Privatinserat auf autosolo.ch. Faire Preise ab CHF 180 – günstiger als AutoScout24. Keine versteckten Kosten, kein Kleingedrucktes.",
    },
    en: {
      title: "List Your Car Privately in Switzerland – From CHF 180 | AutoSolo",
      description:
        "Post your private car listing on autosolo.ch. Fair prices from CHF 180 – cheaper than AutoScout24. No hidden costs, no fine print.",
    },
    fr: {
      title: "Déposer annonce auto privée Suisse – Dès CHF 180 | AutoSolo",
      description:
        "Publiez votre annonce privée sur autosolo.ch. Prix équitables dès CHF 180 – moins cher qu'AutoScout24. Sans frais cachés.",
    },
    it: {
      title: "Inserire auto privata Svizzera – Da CHF 180 | AutoSolo",
      description:
        "Pubblica il tuo annuncio privato su autosolo.ch. Prezzi equi da CHF 180 – più economico di AutoScout24. Senza costi nascosti.",
    },
  } satisfies PageMeta,

  faq: {
    de: {
      title: "FAQ – Häufige Fragen zu AutoSolo | Auto privat verkaufen Schweiz",
      description:
        "Antworten zu Inseraten, Preisen, Sicherheit und mehr auf autosolo.ch. Die günstige Plattform für private Autoverkäufe in der Schweiz.",
    },
    en: {
      title: "FAQ – Frequently Asked Questions | AutoSolo Switzerland",
      description:
        "Answers about listings, pricing, security and more on autosolo.ch. The affordable platform for private car sales in Switzerland.",
    },
    fr: {
      title: "FAQ – Questions fréquentes | AutoSolo Suisse",
      description:
        "Réponses sur les annonces, les prix, la sécurité et plus sur autosolo.ch. La plateforme abordable pour les ventes privées de voitures en Suisse.",
    },
    it: {
      title: "FAQ – Domande frequenti | AutoSolo Svizzera",
      description:
        "Risposte su annunci, prezzi, sicurezza e altro su autosolo.ch. La piattaforma conveniente per la vendita privata di auto in Svizzera.",
    },
  } satisfies PageMeta,

  about: {
    de: {
      title: "Über AutoSolo – Autos privat kaufen & verkaufen Schweiz",
      description:
        "AutoSolo.ch ist die faire Plattform für private Autoverkäufe in der Schweiz. Transparent, günstig und ohne versteckte Kosten – direkter Kontakt zwischen Käufer und Verkäufer.",
    },
    en: {
      title: "About AutoSolo – Private Car Buying & Selling in Switzerland",
      description:
        "AutoSolo.ch is the fair platform for private car sales in Switzerland. Transparent, affordable and without hidden costs – direct contact between buyer and seller.",
    },
    fr: {
      title: "À propos d'AutoSolo – Acheter & vendre auto entre particuliers",
      description:
        "AutoSolo.ch est la plateforme équitable pour les ventes privées de voitures en Suisse. Transparent, abordable et sans frais cachés.",
    },
    it: {
      title: "Chi siamo – AutoSolo, compra & vendi auto tra privati in Svizzera",
      description:
        "AutoSolo.ch è la piattaforma equa per la vendita privata di auto in Svizzera. Trasparente, conveniente e senza costi nascosti.",
    },
  } satisfies PageMeta,

  contact: {
    de: {
      title: "Kontakt – AutoSolo.ch | Support für private Autoverkäufer",
      description:
        "Kontaktieren Sie das AutoSolo-Team direkt. Fragen zu Inseraten, Preisen oder Ihrem Konto? Wir helfen Ihnen persönlich weiter.",
    },
    en: {
      title: "Contact – AutoSolo.ch | Support for Private Car Sellers",
      description:
        "Contact the AutoSolo team directly. Questions about listings, pricing or your account? We are here to help you personally.",
    },
    fr: {
      title: "Contact – AutoSolo.ch | Support pour vendeurs particuliers",
      description:
        "Contactez l'équipe AutoSolo directement. Des questions sur les annonces, les prix ou votre compte? Nous vous aidons personnellement.",
    },
    it: {
      title: "Contatto – AutoSolo.ch | Supporto per venditori privati",
      description:
        "Contatta il team AutoSolo direttamente. Domande su annunci, prezzi o il tuo account? Ti aiutiamo personalmente.",
    },
  } satisfies PageMeta,
} as const;
