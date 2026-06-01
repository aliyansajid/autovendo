import { headers } from "next/headers";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@repo/ui/components/sidebar";
import { Separator } from "@repo/ui/components/separator";
import { DashboardSidebar } from "./_components/dashboard-sidebar";
import { DashboardBreadcrumb } from "./_components/dashboard-breadcrumb";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.autovendo.ch";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookie = (await headers()).get("cookie") ?? "";
  let session: { user?: { name: string; email: string; image?: string | null } } | null = null;

  try {
    const res = await fetch(`${API_BASE}/api/auth/get-session`, {
      headers: { cookie },
      cache: "no-store",
    });
    if (res.ok) session = await res.json();
  } catch {}

  return (
    <SidebarProvider>
      <DashboardSidebar user={session?.user ?? null} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <DashboardBreadcrumb />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
