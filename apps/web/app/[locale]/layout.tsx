import type { Metadata } from "next";
import localFont from "next/font/local";
import "@repo/ui/globals.css";
import { Toaster } from "@repo/ui/src/components/sonner";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import Script from "next/script";
import { BASE_URL, OG_LOCALE, PAGE_META } from "@/lib/seo";
import { routing } from "@/i18n/routing";

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: (PAGE_META.home[locale as keyof typeof PAGE_META.home] ?? PAGE_META.home.de).title,
      template: "%s",
    },
    description: (PAGE_META.home[locale as keyof typeof PAGE_META.home] ?? PAGE_META.home.de).description,
    keywords: [
      "gebrauchtwagen schweiz",
      "occasion auto schweiz",
      "auto kaufen schweiz",
      "occasionen kaufen",
      "gebrauchtwagen kaufen",
      "autohändler schweiz",
      "auto inserat schweiz",
      "autovendo",
      "occasion kaufen schweiz",
      "gebrauchtwagen kaufen schweiz",
    ],
    openGraph: {
      siteName: "AutoVendo",
      images: [
        {
          url: "/web-app-manifest-512x512.png",
          width: 1200,
          height: 630,
          alt: "AutoVendo – Gebrauchtwagen & Occasionen Schweiz",
        },
      ],
      locale: OG_LOCALE[locale as keyof typeof OG_LOCALE] ?? "de_CH",
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
      "apple-mobile-web-app-title": "AutoVendo",
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

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
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
