"use client";

import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@repo/ui/components/button";
import { MapPin, ArrowRight, Search, Star } from "lucide-react";
import { Link } from "@/i18n/routing";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@repo/ui/src/components/input-group";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@repo/ui/components/pagination";
import type { DealerListResult } from "@/types/dealer";
import { useTranslations } from "next-intl";

interface DealersListProps {
  initialData: DealerListResult;
}

export const DealersList = ({ initialData }: DealersListProps) => {
  const t = useTranslations("DealersList");
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const searchQuery = searchParams.get("q") || "";
  const currentPage = initialData.currentPage;
  const totalPages = initialData.totalPages;
  const dealers = initialData.dealers;

  const updateParams = useCallback(
    (updates: Record<string, string | null | number>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined) params.delete(key);
        else params.set(key, String(value));
      });
      // Skip page=1 for clean URL
      if (params.get("page") === "1") params.delete("page");

      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (localSearch === searchQuery) return;

    const timer = setTimeout(() => {
      updateParams({ q: localSearch || null, page: 1 });
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearch, searchQuery, updateParams]);

  return (
    <div className="w-full max-w-285 mx-auto px-4 py-12 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        <InputGroup className="w-full md:w-96">
          <InputGroupInput
            placeholder={t("searchPlaceholder")}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          <InputGroupAddon>
            <Search className="size-4" />
          </InputGroupAddon>
        </InputGroup>
      </div>

      {dealers.length === 0 ? (
        <div className="py-20 text-center bg-secondary/30 rounded-xl border border-border space-y-3">
          {searchQuery ? (
            <>
              <h3 className="text-xl font-semibold text-foreground">
                {t("notFoundTitle")}
              </h3>
              <p className="text-muted-foreground text-sm">
                {t("notFoundDescription", { query: searchQuery })}
              </p>
              <Button
                variant="outline"
                onClick={() => updateParams({ q: null, page: 1 })}
              >
                {t("resetSearch")}
              </Button>
            </>
          ) : (
            <>
              <h3 className="text-xl font-semibold text-foreground">
                {t("emptyTitle")}
              </h3>
              <p className="text-muted-foreground text-sm">
                {t("emptyDescription")}
              </p>
              <Button asChild>
                <Link href="/sell">{t("becomeDealer")}</Link>
              </Button>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-card">
            {dealers.map((dealer) => (
              <Link
                key={dealer.id}
                href={`/dealers/${dealer.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-muted/50 transition-colors group"
              >
                <div className="min-w-0 space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-semibold text-base truncate text-foreground group-hover:text-primary transition-colors">
                      {dealer.companyName}
                    </h2>
                    {dealer.googleRating != null && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                        <Star className="size-3 fill-rating text-rating" />
                        <span className="font-medium text-foreground">{dealer.googleRating.toFixed(1)}</span>
                        {dealer.googleReviewCount != null && (
                          <span>({dealer.googleReviewCount})</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center text-muted-foreground gap-1">
                    <MapPin className="size-3.5 shrink-0" />
                    <span className="text-xs truncate">
                      {dealer.streetAddress}, {dealer.zipCode} {dealer.city}
                    </span>
                  </div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground shrink-0 -translate-x-1 group-hover:translate-x-0 group-hover:text-primary transition-all" />
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1)
                        updateParams({ page: currentPage - 1 });
                    }}
                    className={
                      currentPage <= 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === i + 1}
                      onClick={(e) => {
                        e.preventDefault();
                        updateParams({ page: i + 1 });
                      }}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages)
                        updateParams({ page: currentPage + 1 });
                    }}
                    className={
                      currentPage >= totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
};
