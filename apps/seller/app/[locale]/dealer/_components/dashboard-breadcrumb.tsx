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

  const segments = pathname.split("/").filter(Boolean);
  const dealerIndex = segments.indexOf("dealer");
  const relativeSegments = dealerIndex >= 0 ? segments.slice(dealerIndex) : segments;
  // e.g. /en/dealer/settings/profile -> ["dealer", "settings", "profile"]

  const lastSegment = relativeSegments[relativeSegments.length - 1];
  const secondLastSegment = relativeSegments[relativeSegments.length - 2];
  const isVehicleEditPage =
    secondLastSegment === "vehicles" && lastSegment !== "new";

  const middleSegments = relativeSegments.slice(1, -1);

  const labelFor = (seg: string) =>
    t(seg as Parameters<typeof t>[0]);

  const lastLabel = isVehicleEditPage ? t("edit") : labelFor(lastSegment ?? "");

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink asChild>
            <Link href="/dealer">{t("dashboard")}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {middleSegments.map((seg) => (
          <span key={seg} className="hidden md:contents">
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/dealer/${seg}`}>{labelFor(seg)}</Link>
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
