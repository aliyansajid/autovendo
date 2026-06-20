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

export function DashboardBreadcrumb() {
  const t = useTranslations("DashboardBreadcrumb");
  const pathname = usePathname();

  // Drop the locale prefix (first segment) so we always start at "dashboard"
  const segments = pathname.split("/").filter(Boolean);
  const dashboardIndex = segments.indexOf("dashboard");
  const relativeSegments = dashboardIndex >= 0 ? segments.slice(dashboardIndex) : segments;
  // e.g. /en/dashboard/settings/profile -> ["dashboard", "settings", "profile"]

  const lastSegment = relativeSegments[relativeSegments.length - 1];
  const secondLastSegment = relativeSegments[relativeSegments.length - 2];
  const isVehicleEditPage =
    secondLastSegment === "vehicles" && lastSegment !== "new";

  // Build intermediate crumbs (everything between "dashboard" and the last segment)
  // For /dashboard/settings/profile we want: Dashboard > Settings > Profile
  const middleSegments = relativeSegments.slice(1, -1); // excludes "dashboard" and last

  const labelFor = (seg: string) =>
    t(seg as Parameters<typeof t>[0]);

  const lastLabel = isVehicleEditPage ? t("edit") : labelFor(lastSegment ?? "");

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink asChild>
            <Link href="/dashboard">{t("dashboard")}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {middleSegments.map((seg) => (
          <span key={seg} className="hidden md:contents">
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/dashboard/${seg}`}>{labelFor(seg)}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </span>
        ))}

        {relativeSegments.length > 1 && (
          <>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{lastLabel}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
