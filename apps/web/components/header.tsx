"use client";

import Link from "next/link";
import Image from "next/image";
import { PlusCircle, Menu } from "lucide-react";
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
  { href: "/dealers", label: "Händler suchen" },
  { href: "/sell", label: "Verkaufen" },
];

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-linear-to-r from-primary to-primary/80">
      <div className="flex items-center justify-between mx-auto max-w-285 px-4 py-3">
        <div className="flex items-center gap-8">
          <Link href="/" className="block">
            <Image
              src="/logo-header.svg"
              alt="Autovendo"
              width={48}
              height={40}
              className="h-8 w-auto"
            />
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
                aria-label="Open menu"
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
