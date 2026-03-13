"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
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

interface DealersListProps {
  initialData: {
    dealers: {
      id: string;
      companyName: string;
      city: string;
      address: string;
      logo: string | null;
    }[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  };
}

export const DealersList = ({ initialData }: DealersListProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const searchQuery = searchParams.get("q") || "";
  const currentPage = initialData.currentPage;
  const totalPages = initialData.totalPages;
  const dealers = initialData.dealers;

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSearchChange = (value: string) => {
    updateParams({ q: value || null, page: "1" });
  };

  const handlePageChange = (page: number) => {
    updateParams({ page: page.toString() });
  };

  return (
    <div className="w-full max-w-285 mx-auto px-4 py-12 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Unsere Händler</h1>
          <p className="text-muted-foreground text-sm">
            Finden Sie den passenden Händler in Ihrer Nähe.
          </p>
        </div>

        <InputGroup className="w-full md:w-96">
          <InputGroupInput
            placeholder="Händler suchen..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
      </div>

      {dealers.length === 0 ? (
        <div className="py-20 text-center bg-secondary/30 rounded-xl border border-border">
          <h3 className="text-xl font-semibold mb-2">Kein Händler gefunden</h3>
          <p className="text-muted-foreground">
            Versuchen Sie es mit einem anderen Suchbegriff.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => updateParams({ q: null, page: "1" })}
          >
            Suche zurücksetzen
          </Button>
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
                <div className="min-w-0 space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-base truncate">
                      {dealer.companyName}
                    </h2>
                    {/* Optional: Add logic for Premium Partner if needed from DB */}
                  </div>
                  <div className="flex items-center text-muted-foreground gap-1">
                    <MapPin className="size-3.5" />
                    <span className="text-xs">{dealer.city}, {dealer.address}</span>
                  </div>
                </div>

                <ArrowRight className="size-4 text-muted-foreground -translate-x-1 group-hover:translate-x-0 transition-transform" />
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
                      if (currentPage > 1) handlePageChange(currentPage - 1);
                    }}
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
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
                        handlePageChange(i + 1);
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
                        handlePageChange(currentPage + 1);
                    }}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
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
