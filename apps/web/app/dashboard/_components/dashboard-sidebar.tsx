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
import { Skeleton } from "@repo/ui/src/components/skeleton";
import { authClient } from "@repo/auth/client";
import Link from "next/link";

const data = {
  navMain: [
    {
      title: "Übersicht",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Fahrzeuge",
      url: "/dashboard/vehicles",
      icon: Car,
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
          title: "Profile",
          url: "/dashboard/settings/profile",
        },
        {
          title: "Change Password",
          url: "/dashboard/settings/change-password",
        },
      ],
    },
  ],
};

export function DashboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { data: session, isPending } = authClient.useSession();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <Image src="/logo.svg" alt="Logo" fill />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        {isPending ? (
          <div className="flex items-center gap-2 p-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ) : (
          <NavUser
            user={
              session?.user ?? {
                name: "Guest",
                email: "m@example.com",
              }
            }
          />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
