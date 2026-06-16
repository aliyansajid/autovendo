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

/**
 * Dashboard Sidebar Component
 * 
 * Provides the primary navigation for the dealer dashboard.
 * - Dynamically localizes all menu items
 * - Integrates with the User Profile (NavUser) and Main Navigation (NavMain)
 * - Persists across all dashboard sub-pages
 */
export function DashboardSidebar({ user, ...props }: DashboardSidebarProps) {
  const t = useTranslations("DashboardSidebar");

  /**
   * Main Navigation Configuration
   * All URLs are relative; they are automatically prefixed with the locale
   * by the localized <Link> and useRouter from @/i18n/routing.
   */
  const navItems = [
    {
      title: t("overview"),
      url: "/dealer",
      icon: LayoutDashboard,
    },
    {
      title: t("vehicles"),
      url: "/dealer/vehicles",
      icon: Car,
      isActive: true,
    },
    {
      title: t("billing"),
      url: "/dealer/subscription",
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
          url: "/dealer/settings/profile",
        },
        {
          title: t("changePassword"),
          url: "/dealer/settings/change-password",
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
                <div className="relative w-8 h-8">
                  <Image src="/logo.svg" alt={t("logoAlt")} fill priority />
                </div>
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
