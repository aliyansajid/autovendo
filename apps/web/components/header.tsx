"use client";

import Link from "next/link";
import Image from "next/image";
import { PlusCircle, Menu, LayoutDashboard, Settings } from "lucide-react";
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
import { authClient } from "@repo/auth/client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/src/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/src/components/dropdown-menu";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@repo/ui/src/components/skeleton";

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
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-linear-to-r from-primary to-primary/80">
      <div className="flex items-center justify-between mx-auto max-w-285 px-4 py-3">
        <div className="flex items-center gap-8">
          <Link href="/" className="block">
            <Image
              src="/logo-header.svg"
              alt="AutoVendo Logo"
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
          {isPending ? (
            <Skeleton className="w-8 h-8 rounded-full bg-white/20" />
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarImage
                      src={session.user.image as string}
                      alt={`${session.user.name} profile`}
                    />
                    <AvatarFallback>
                      {session.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard"
                      className="flex items-center w-full"
                    >
                      <LayoutDashboard />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center w-full"
                    >
                      <Settings />
                      <span>Einstellungen</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={handleLogout}
                    className="flex items-center w-full"
                  >
                    <LogOut />
                    <span>Abmelden</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild className="bg-white text-primary hover:bg-white/90">
              <Link href="/login">Login</Link>
            </Button>
          )}

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

                {session ? (
                  <div className="flex flex-col gap-4 text-left">
                    <div className="flex items-center gap-3 px-1">
                      <Avatar size="sm">
                        <AvatarImage src={session.user.image || ""} />
                        <AvatarFallback>
                          {session.user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium">
                          {session.user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {session.user.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      asChild
                      className="w-full justify-start text-left"
                    >
                      <Link href="/dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleLogout}
                      className="w-full justify-start text-left"
                    >
                      <LogOut />
                      Abmelden
                    </Button>
                  </div>
                ) : (
                  <Button asChild className="w-full">
                    <Link href="/login">
                      <PlusCircle />
                      Login
                    </Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
