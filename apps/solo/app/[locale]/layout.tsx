import type { Metadata } from "next";
import localFont from "next/font/local";
import "@repo/ui/globals.css";
import { Toaster } from "@repo/ui/src/components/sonner";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import Script from "next/script";

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

const OG_LOCALE: Record<string, string> = {
  de: "de_CH",
  en: "en_US",
  fr: "fr_CH",
  it: "it_CH",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    metadataBase: new URL("https://autosolo.ch"),
    title: {
      default: "Auto privat kaufen & verkaufen Schweiz | AutoSolo",
      template: "%s",
    },
    description:
      "Tausende Gebrauchtwagen von Privatverkäufern in der Schweiz. Günstig Auto kaufen ohne Händleraufschlag – direkt von privat auf autosolo.ch.",
    keywords: [
      "auto privat kaufen schweiz",
      "gebrauchtwagen von privat schweiz",
      "auto verkaufen schweiz privat",
      "privatinserat auto schweiz",
      "occasion von privat kaufen",
      "auto privat verkaufen schweiz",
      "autosolo",
      "gebrauchtwagen privat schweiz",
      "occasion privat schweiz",
    ],
    openGraph: {
      siteName: "AutoSolo",
      images: [
        {
          url: "/web-app-manifest-512x512.png",
          width: 1200,
          height: 630,
          alt: "AutoSolo – Auto privat kaufen & verkaufen Schweiz",
        },
      ],
      locale: OG_LOCALE[locale] ?? "de_CH",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    other: {
      "apple-mobile-web-app-title": "AutoSolo",
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!["de", "en", "fr", "it"].includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-X61M6TQ4LL"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-X61M6TQ4LL');
          `}
        </Script>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <main>{children}</main>
        </NextIntlClientProvider>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
