"use client";

import Link from "next/link";
import { PlusCircle, CarFront, Menu } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@repo/ui/components/navigation-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Button } from "@repo/ui/src/components/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui/src/components/sheet";
import { Separator } from "@repo/ui/src/components/separator";

const languages = [
  { label: "Deutsch", value: "de" },
  { label: "English", value: "en" },
  { label: "Français", value: "fr" },
  { label: "Italiano", value: "it" },
];

const navLinks = [
  { href: "/advanced-search", label: "Erweiterte Suche" },
  { href: "/showrooms", label: "Händler suchen" },
  { href: "/sell", label: "Verkaufen" },
];

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-linear-to-r from-primary to-primary/80">
      <div className="flex items-center justify-between mx-auto max-w-285 px-4 py-3">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-90"
          >
            <div className="rounded-lg bg-white/20 p-1.5">
              <CarFront className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold text-white">Autovendo</span>
          </Link>

          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {navLinks.map(({ href, label }) => (
                <NavigationMenuItem key={href}>
                  <NavigationMenuLink
                    asChild
                    className={navigationMenuTriggerStyle()}
                  >
                    <Link href={href}>{label}</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button className="bg-white text-primary hover:bg-white/90">
            <PlusCircle />
            <Link href="signup">Anmelden</Link>
          </Button>

          <Select defaultValue="de">
            <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white hover:bg-white/20 [&_svg]:text-white!">
              <SelectValue placeholder="Sprache" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Menu />
              </Button>
            </SheetTrigger>

            <SheetContent>
              <SheetHeader>
                <SheetTitle>Menü</SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-6 px-4">
                <nav className="flex flex-col gap-4">
                  {navLinks.map(({ href, label }) => (
                    <Link key={href} href={href}>
                      {label}
                    </Link>
                  ))}
                </nav>

                <Separator />

                <Select defaultValue="de">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sprache" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button className="w-full">
                  <PlusCircle />
                  Anmelden
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
