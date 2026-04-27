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

export const metadata: Metadata = {
  metadataBase: new URL("https://autosolo.ch"),
  title: "AutoSolo - Find Your Perfect Vehicle",
  description:
    "Discover used and new vehicles across Europe. Search thousands of cars from top brands including Audi, BMW, Mercedes-Benz, and more. Find your dream car today.",
  keywords: [
    "cars",
    "used cars",
    "new cars",
    "buy cars",
    "sell cars",
    "auto",
    "vehicle",
    "Autovendo",
    "Switzerland",
    "Europe",
  ],
  openGraph: {
    title: "AutoVendo - Find Your Perfect Vehicle",
    description:
      "Discover used and new vehicles across Europe. Search thousands of cars from top brands including Audi, BMW, Mercedes-Benz, and more.",
    url: "https://autosolo.ch",
    siteName: "Autovendo",
    images: [
      {
        url: "/web-app-manifest-512x512.png",
        width: 512,
        height: 512,
        alt: "Autovendo Logo",
      },
    ],
    locale: "de_CH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AutoVendo - Find Your Perfect Vehicle",
    description:
      "Discover used and new vehicles across Europe. Search thousands of cars from top brands including Audi, BMW, Mercedes-Benz, and more.",
    images: ["/web-app-manifest-512x512.png"],
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
