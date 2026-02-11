import type { Metadata } from "next";
import localFont from "next/font/local";
import "@repo/ui/globals.css";
import { TooltipProvider } from "@repo/ui/components/tooltip";
import Header from "@/components/header";
import Footer from "@/components/footer";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Autovendo - Find Your Perfect Vehicle",
  description: "Discover used and new vehicles across Europe. Search thousands of cars from top brands including Audi, BMW, Mercedes-Benz, and more. Find your dream car today.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} flex flex-col min-h-screen`}>
        <TooltipProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </TooltipProvider>
      </body>
    </html>
  );
}
