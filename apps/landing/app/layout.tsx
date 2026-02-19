import type { Metadata } from "next";
import localFont from "next/font/local";
import "@repo/ui/globals.css";
import { Toaster } from "@repo/ui/components/sonner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Autovendo.ch - Bald verfügbar",
  description:
    "Die faire und transparente Verkaufsplattform für Autohändler in der Schweiz. Registrieren Sie sich jetzt für frühen Zugang.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
