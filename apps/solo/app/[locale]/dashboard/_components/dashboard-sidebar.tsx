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
} from "@repo/ui/components/sidebar";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

interface DashboardSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name: string;
    email: string;
    image?: string | null;
  } | null;
}

export function DashboardSidebar({ user, ...props }: DashboardSidebarProps) {
  const t = useTranslations("DashboardSidebar");

  const navItems = [
    {
      title: t("overview"),
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: t("vehicles"),
      url: "/dashboard/vehicles",
      icon: Car,
      isActive: true,
    },
    {
      title: t("subscription"),
      url: "/dashboard/subscription",
      icon: CreditCard,
    },
    {
      title: t("settings"),
      url: "#",
      icon: Settings,
      isActive: false,
      items: [
        {
          title: t("profile"),
          url: "/dashboard/settings/profile",
        },
        {
          title: t("changePassword"),
          url: "/dashboard/settings/change-password",
        },
      ],
    },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <Image src="/logo.svg" alt="AutoSolo Logo" fill priority />
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
