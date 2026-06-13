import type { Metadata } from "next";
import { buildMetadata, PAGE_META } from "@/lib/seo";
import { getDealersFromApi } from "@/lib/api/dealers";
import { getTranslations } from "next-intl/server";
import { DealerSearch } from "./_components/dealer-search";
import { MapPin, ArrowRight, Star } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@repo/ui/components/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@repo/ui/components/pagination";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  return buildMetadata(locale, "/dealers", PAGE_META.dealers);
}

export default async function DealersPage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await props.params;
  const searchParams = await props.searchParams;
  const t = await getTranslations("DealersPage");
  const tList = await getTranslations("DealersList");

  const q = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const page = Math.max(1, Number(searchParams.page) || 1);

  const { dealers, totalPages } = await getDealersFromApi({
    searchQuery: q,
    page,
    pageSize: 12,
  });

  function buildUrl(params: Record<string, string | number | undefined>): string {
    const sp = new URLSearchParams();
    for (const [key, value] of Object.entries({ ...searchParams, ...params })) {
      if (value === undefined || value === null) continue;
      if (key === "page" && (value === 1 || value === "1")) continue;
      if (Array.isArray(value)) {
        value.forEach((v) => sp.append(key, String(v)));
      } else {
        sp.set(key, String(value));
      }
    }
    const qs = sp.toString();
    return qs ? `/${locale}/dealers?${qs}` : `/${locale}/dealers`;
  }

  return (
    <>
      <div className="bg-linear-to-r from-primary to-primary/80">
        <div className="w-full max-w-285 mx-auto py-12 px-4">
          <div className="text-center text-white space-y-4">
            <h1 className="text-2xl md:text-4xl font-bold">{t("title")}</h1>
            <p className="text-base md:text-lg max-w-3xl mx-auto">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-285 mx-auto px-4 py-12 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">{tList("title")}</h1>
            <p className="text-sm text-muted-foreground">{tList("subtitle")}</p>
          </div>
          <DealerSearch initialSearch={q ?? ""} />
        </div>

        {dealers.length === 0 ? (
          <div className="py-20 text-center bg-secondary/30 rounded-xl border border-border space-y-3">
            {q ? (
              <>
                <h3 className="text-xl font-semibold text-foreground">
                  {tList("notFoundTitle")}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {tList("notFoundDescription", { query: q })}
                </p>
                <Button variant="outline" asChild>
                  <Link href={`/${locale}/dealers`}>{tList("resetSearch")}</Link>
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-foreground">
                  {tList("emptyTitle")}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {tList("emptyDescription")}
                </p>
                <Button asChild>
                  <Link href="/sell">{tList("becomeDealer")}</Link>
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
                          <span className="font-medium text-foreground">
                            {dealer.googleRating.toFixed(1)}
                          </span>
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
                      href={page > 1 ? buildUrl({ page: page - 1 }) : undefined}
                      className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    if (totalPages > 7) {
                      if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                        return (
                          <PaginationItem key={p}>
                            <PaginationLink href={buildUrl({ page: p })} isActive={p === page}>
                              {p}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                      if (p === page - 2 || p === page + 2) {
                        return (
                          <PaginationItem key={p}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return null;
                    }
                    return (
                      <PaginationItem key={p}>
                        <PaginationLink href={buildUrl({ page: p })} isActive={p === page}>
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      href={page < totalPages ? buildUrl({ page: page + 1 }) : undefined}
                      className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>
    </>
  );
}
