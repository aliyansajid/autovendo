import "@repo/ui/globals.css";
import Link from "next/link";
import { MoveLeft, CarFront } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found | AutoVendo",
  description: "The page you are looking for does not exist on AutoVendo.",
};

export default function RootNotFound() {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full animate-pulse" />
              <div className="relative bg-background border p-6 rounded-2xl shadow-xl">
                <CarFront className="w-12 h-12 text-primary mx-auto" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-8xl font-black tracking-tighter bg-linear-to-b from-foreground to-foreground/50 bg-clip-text text-transparent">
              404
            </h1>
            <h2 className="text-2xl font-bold tracking-tight">
              Page Not Found
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">
              The requested resource could not be found at this address.
            </p>
          </div>

          <Button className="w-full group" asChild>
            <Link href="/de">
              <MoveLeft />
              Back to Safety
            </Link>
          </Button>

          <footer className="pt-8 text-xs text-muted-foreground uppercase tracking-widest opacity-50">
            AutoVendo.ch
          </footer>
        </div>
      </body>
    </html>
  );
}
