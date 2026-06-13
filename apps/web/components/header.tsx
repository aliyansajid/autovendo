"use client";

import Image from "next/image";
import { Menu } from "lucide-react";
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
  SheetClose,
} from "@repo/ui/src/components/sheet";
import { Separator } from "@repo/ui/src/components/separator";
import { useRouter, usePathname, Link } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";

const languages = [
  { label: "Deutsch", value: "de" },
  { label: "English", value: "en" },
  { label: "Français", value: "fr" },
  { label: "Italiano", value: "it" },
];

const navLinks = [
  { href: "/cars", labelKey: "nav.cars" },
  { href: "/advanced-search", labelKey: "nav.advancedSearch" },
  { href: "/dealers", labelKey: "nav.dealers" },
  { href: "/sell", labelKey: "nav.sell" },
] as const;

export const Header = () => {
  const t = useTranslations("Header");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (value: string) => {
    router.replace(pathname, { locale: value });
  };

  const loginUrl = `${process.env.NEXT_PUBLIC_AUTH_URL}/${locale}/login`;

  return (
    <header className="sticky top-0 z-50 w-full bg-linear-to-r from-primary to-primary/80">
      <div className="flex items-center justify-between mx-auto max-w-285 px-4 py-3">
        <div className="flex items-center gap-8">
          <Link href="/" className="block">
            <Image
              src="/logo-header.svg"
              alt={t("logoAlt")}
              width={48}
              height={40}
              className="h-8 w-auto"
            />
          </Link>

          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {navLinks.map(({ href, labelKey }) => (
                <NavigationMenuItem key={href}>
                  <NavigationMenuLink
                    asChild
                    className={navigationMenuTriggerStyle()}
                  >
                    <Link href={href}>{t(labelKey)}</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button asChild className="bg-white text-primary hover:bg-white/90">
            <Link href={loginUrl}>{t("auth.login")}</Link>
          </Button>

          <Select value={locale} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white hover:bg-white/20 [&_svg]:text-white!">
              <SelectValue placeholder={t("languages.label")} />
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
                aria-label={t("nav.mobileMenuTitle")}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Menu />
              </Button>
            </SheetTrigger>

            <SheetContent>
              <SheetHeader>
                <SheetTitle>{t("nav.mobileMenuTitle")}</SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-6 px-4">
                <nav className="flex flex-col gap-4">
                  {navLinks.map(({ href, labelKey }) => (
                    <SheetClose asChild key={href}>
                      <Link href={href}>{t(labelKey)}</Link>
                    </SheetClose>
                  ))}
                </nav>

                <Separator />

                <Select value={locale} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("languages.label")} />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <SheetClose asChild>
                  <Button asChild className="w-full">
                    <Link href={loginUrl}>{t("auth.login")}</Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
