import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@repo/ui/components/sidebar";
import { Separator } from "@repo/ui/components/separator";
import { DashboardSidebar } from "./_components/dashboard-sidebar";
import { DashboardBreadcrumb } from "./_components/dashboard-breadcrumb";
import { getSessionFromApi } from "@/lib/api/vehicles";
import { redirect } from "next/navigation";

const AUTH_URL = "https://auth.autovendo.ch";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session: { user?: { name: string; email: string; image?: string | null; role?: string } } | null = null;

  try {
    session = await getSessionFromApi();
  } catch {}

  if (!session || session.user?.role !== "seller") {
    redirect(AUTH_URL);
  }

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
