import type { Metadata } from "next";
import localFont from "next/font/local";
import "../solo.css";
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
      default: "Gebrauchtwagen & Occasionen kaufen Schweiz | AutoSolo",
      template: "%s",
    },
    description:
      "Tausende Gebrauchtwagen und Occasionen von verifizierten Schweizer Händlern. Günstiger als AutoScout24 – faire Preise, keine versteckten Kosten.",
    keywords: [
      "gebrauchtwagen schweiz",
      "occasion auto schweiz",
      "auto kaufen schweiz",
      "occasionen kaufen",
      "gebrauchtwagen kaufen",
      "autohändler schweiz",
      "auto inserat schweiz",
      "autosolo",
      "occasion kaufen schweiz",
      "gebrauchtwagen kaufen schweiz",
    ],
    openGraph: {
      siteName: "AutoSolo",
      images: [
        {
          url: "/web-app-manifest-512x512.png",
          width: 1200,
          height: 630,
          alt: "AutoSolo – Gebrauchtwagen & Occasionen Schweiz",
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
          src="https://plausible.io/js/pa-DzlMYGkJm6FkvJ_MeBOD2.js"
          strategy="afterInteractive"
        />
        <Script id="plausible-init" strategy="afterInteractive">
          {`
            window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)};
            window.plausible.init=window.plausible.init||function(i){window.plausible.o=i||{}};
            window.plausible.init();
          `}
        </Script>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-QSHVMEN9ZJ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-QSHVMEN9ZJ');
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
