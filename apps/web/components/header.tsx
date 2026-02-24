"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Button } from "@repo/ui/src/components/button";
import { PlusCircle, CarFront, Menu } from "lucide-react";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@repo/ui/components/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui/src/components/sheet";
import { Separator } from "@repo/ui/src/components/separator";

const components: { title: string; href: string }[] = [
  {
    title: "Einfache Suche (Startseite)",
    href: "/",
  },
  {
    title: "Erweiterte Suche",
    href: "/advanced-search",
  },
  {
    title: "Vergleichstool",
    href: "/compare",
  },
  {
    title: "Händler suchen",
    href: "/dealer-search",
  },
];

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? "bg-primary" : "bg-linear-to-r from-primary to-primary/80"}`}
    >
      <div className="flex items-center justify-between max-w-285 mx-auto py-3 px-4">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 group transition-opacity hover:opacity-90"
          >
            <div className="bg-white/20 p-1.5 rounded-lg group-hover:bg-white/30 transition-colors">
              <CarFront className="text-white" size={20} />
            </div>
            <span className="text-xl text-white font-bold">Autovendo</span>
          </Link>

          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem className="hidden md:flex">
                <NavigationMenuTrigger>Suchen</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {components.map((component) => (
                      <ListItem
                        key={component.title}
                        title={component.title}
                        href={component.href}
                      />
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link href="/sell">Verkaufen</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="hidden md:flex items-center gap-2 sm:gap-3">
          <Select defaultValue="german">
            <SelectTrigger
              aria-label="Sprache"
              className="w-32 bg-white/10 border-white/20 text-white hover:bg-white/20 transition-colors [&_svg]:text-white!"
            >
              <SelectValue placeholder="Sprache" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="german">Deutsch</SelectItem>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="french">Français</SelectItem>
                <SelectItem value="italian">Italiano</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Button className="bg-white hover:bg-white/90 text-primary">
            <PlusCircle />
            Abonnieren
          </Button>
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
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
                  {components.map((component) => (
                    <Link
                      key={component.title}
                      href={component.href}
                      className="text-sm hover:text-primary transition-colors"
                    >
                      {component.title}
                    </Link>
                  ))}
                  <Link
                    href="/sell"
                    className="text-sm hover:text-primary transition-colors"
                  >
                    Verkaufen
                  </Link>
                </nav>
                <Separator />
                <div className="grid gap-4">
                  <Select defaultValue="german">
                    <SelectTrigger aria-label="Sprache" className="w-full">
                      <SelectValue placeholder="Sprache" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="german">Deutsch</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="french">Français</SelectItem>
                        <SelectItem value="italian">Italiano</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <Button className="w-full">
                    <PlusCircle />
                    Abonnieren
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href} className="leading-none text-sm font-medium">
          {title}
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
