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

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink asChild>
            <Link href="/dealer/dashboard">{t("dashboard")}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {segments.length > 1 && (
          <>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {t(segments[segments.length - 1] as Parameters<typeof t>[0])}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
