"use client";

import Image from "next/image";
import { LayoutDashboard, Car, CreditCard, Settings } from "lucide-react";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/src/components/sidebar";
import Link from "next/link";

const navItems = [
  {
    title: "Übersicht",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Fahrzeuge",
    url: "/dashboard/vehicles",
    icon: Car,
    isActive: true,
  },
  {
    title: "Abonnement",
    url: "/dashboard/subscription",
    icon: CreditCard,
  },
  {
    title: "Einstellungen",
    url: "#",
    icon: Settings,
    isActive: false,
    items: [
      {
        title: "Profil",
        url: "/dashboard/settings/profile",
      },
      {
        title: "Passwort ändern",
        url: "/dashboard/settings/change-password",
      },
    ],
  },
];

interface DashboardSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name: string;
    email: string;
    image?: string | null;
  } | null;
}

export function DashboardSidebar({ user, ...props }: DashboardSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <Image src="/logo.svg" alt="AutoVendo Logo" fill priority />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>{user ? <NavUser user={user} /> : null}</SidebarFooter>
    </Sidebar>
  );
}
