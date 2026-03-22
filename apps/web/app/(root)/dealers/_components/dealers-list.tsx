"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@repo/ui/components/button";
import { MapPin, ArrowRight, Search } from "lucide-react";
import Link from "next/link";
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
import type { DealerListResult } from "@/types";

interface DealersListProps {
  initialData: DealerListResult;
}

export const DealersList = ({ initialData }: DealersListProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const searchQuery = searchParams.get("q") || "";
  const currentPage = initialData.currentPage;
  const totalPages = initialData.totalPages;
  const dealers = initialData.dealers;

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) params.delete(key);
        else params.set(key, value);
      });
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (localSearch === searchQuery) return;

    const timer = setTimeout(() => {
      updateParams({ q: localSearch || null, page: "1" });
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearch, searchQuery, updateParams]);

  return (
    <div className="w-full max-w-285 mx-auto px-4 py-12 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Unsere Händler</h1>
          <p className="text-sm text-muted-foreground">
            Finden Sie den passenden Händler in Ihrer Nähe.
          </p>
        </div>

        <InputGroup className="w-full md:w-96">
          <InputGroupInput
            placeholder="Händler suchen..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
      </div>

      {dealers.length === 0 ? (
        <div className="py-20 text-center bg-secondary/30 rounded-xl border border-border space-y-3">
          {searchQuery ? (
            <>
              <h3 className="text-xl font-semibold">Kein Händler gefunden</h3>
              <p className="text-muted-foreground text-sm">
                Kein Händler entspricht &ldquo;{searchQuery}&rdquo;.
              </p>
              <Button
                variant="outline"
                onClick={() => updateParams({ q: null, page: "1" })}
              >
                Suche zurücksetzen
              </Button>
            </>
          ) : (
            <>
              <h3 className="text-xl font-semibold">
                Noch keine Händler registriert
              </h3>
              <p className="text-muted-foreground text-sm">
                Möchten Sie Ihr Fahrzeug als Händler anbieten?
              </p>
              <Button asChild>
                <Link href="/sell">Händler werden</Link>
              </Button>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
            {dealers.map((dealer) => (
              <Link
                key={dealer.id}
                href={`/dealers/${dealer.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-muted/50 transition-colors group"
              >
                <div className="min-w-0 space-y-1 flex-1">
                  <h2 className="font-semibold text-base truncate">
                    {dealer.companyName}
                  </h2>
                  <div className="flex items-center text-muted-foreground gap-1">
                    <MapPin className="size-3.5 shrink-0" />
                    <span className="text-xs truncate">
                    {dealer.streetAddress}, {dealer.zipCode} {dealer.city}
                    </span> 
                  </div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground shrink-0 -translate-x-1 group-hover:translate-x-0 transition-transform" />
              </Link>
            ))}
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1)
                      updateParams({ page: String(currentPage - 1) });
                  }}
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>

              {Array.from({ length: totalPages || 1 }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === i + 1}
                    onClick={(e) => {
                      e.preventDefault();
                      updateParams({ page: String(i + 1) });
                    }}
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
                      updateParams({ page: String(currentPage + 1) });
                  }}
                  className={
                    currentPage === totalPages || totalPages === 0
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      )}
    </div>
  );
};
