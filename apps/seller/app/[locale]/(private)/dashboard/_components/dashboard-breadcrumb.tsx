"use client";

import { usePathname, Link } from "@/i18n/routing";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@repo/ui/components/breadcrumb";

import { useTranslations } from "next-intl";

/**
 * Dynamic Dashboard Breadcrumb Component
 * 
 * Automatically generates breadcrumb trails based on the current URL path.
 * - Root is always localized "Dashboard"
 * - Segments are translated using the "DashboardBreadcrumb" translation namespace
 */
export function DashboardBreadcrumb() {
  const t = useTranslations("DashboardBreadcrumb");
  const pathname = usePathname();
  
  // Split the path into segments and remove empty strings
  // Example: /en/dashboard/vehicles -> ["dashboard", "vehicles"]
  const segments = pathname.split("/").filter(Boolean);

  // Detect if the last segment is a vehicle ID (edit page) rather than a named route
  const lastSegment = segments[segments.length - 1];
  const secondLastSegment = segments[segments.length - 2];
  const isVehicleEditPage =
    secondLastSegment === "vehicles" && lastSegment !== "new";

  const pageLabel = isVehicleEditPage
    ? t("edit")
    : t(lastSegment as any);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink asChild>
            <Link href="/dashboard">{t("dashboard")}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {segments.length > 1 && (
          <>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{pageLabel}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
