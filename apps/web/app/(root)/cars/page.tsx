import { Suspense } from "react";
import { FiltersSidebar } from "./_components/filters-sidebar";
import { ListingListCard } from "./_components/listing-list-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/src/components/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@repo/ui/components/pagination";
import { getVehiclesWithFacetsCached } from "@/app/actions/vehicles.actions";
import { VehicleSearchSchema } from "@/lib/schemas/vehicle.schema";
import { parseSearchParams } from "@/lib/helpers/vehicle";
import { ListingControls } from "./_components/listing-controls";

/**
 * Cars List Page - Pure UI Component
 * All business logic handled in server actions
 */
export default async function CarsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  // Get data from server action (cached)
  const { vehicles, total, totalPages, facets } =
    await getVehiclesWithFacetsCached(searchParams);

  // Parse for UI needs
  const parsed = parseSearchParams(searchParams);
  const query = VehicleSearchSchema.parse(parsed);

  // Helper to build pagination URLs
  function buildUrl(params: Record<string, any>): string {
    const sp = new URLSearchParams();
    for (const [key, value] of Object.entries({ ...searchParams, ...params })) {
      if (value !== undefined && value !== null) {
        // Skip page=1 to keep URL clean
        if (key === "page" && value === 1) continue;

        if (Array.isArray(value)) {
          value.forEach((v) => sp.append(key, String(v)));
        } else {
          sp.set(key, String(value));
        }
      }
    }
    const queryString = sp.toString();
    return queryString ? `/cars?${queryString}` : "/cars";
  }

  return (
    <>
      <div className="bg-linear-to-r from-primary to-primary/80">
        <div className="w-full max-w-285 mx-auto py-12 px-4">
          <div className="text-center text-white space-y-4">
            <h1 className="text-2xl md:text-4xl font-bold">Fahrzeuge finden</h1>
            <p className="text-base md:text-lg max-w-3xl mx-auto">
              Entdecken Sie unser breites Angebot an Fahrzeugen
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-285 mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="hidden lg:block lg:col-span-1">
            <Suspense
              fallback={
                <div className="animate-pulse h-96 bg-muted rounded-lg" />
              }
            >
              <FiltersSidebar
                showActions={false}
                resultCount={total}
                facets={facets}
              />
            </Suspense>
          </aside>

          <div className="lg:col-span-3 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{total} Angebote</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <Suspense
                  fallback={
                    <div className="animate-pulse h-10 bg-muted rounded-lg w-full" />
                  }
                >
                  <ListingControls
                    initialSearch={query.search}
                    initialSort={query.sort}
                  />
                </Suspense>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-6">
              {vehicles.map((item) => (
                <ListingListCard key={item.id} item={item} />
              ))}
              {vehicles.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  Keine Fahrzeuge gefunden.
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  {query.page > 1 && (
                    <PaginationItem>
                      <PaginationPrevious
                        href={buildUrl({ page: query.page - 1 })}
                      />
                    </PaginationItem>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => {
                      // Simple pagination logic, showing up to 5 pages
                      if (totalPages > 7) {
                        if (
                          p === 1 ||
                          p === totalPages ||
                          (p >= query.page - 1 && p <= query.page + 1)
                        ) {
                          return (
                            <PaginationItem key={p}>
                              <PaginationLink
                                href={buildUrl({ page: p })}
                                isActive={p === query.page}
                              >
                                {p}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }
                        if (p === query.page - 2 || p === query.page + 2) {
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
                          <PaginationLink
                            href={buildUrl({ page: p })}
                            isActive={p === query.page}
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    },
                  )}

                  {query.page < totalPages && (
                    <PaginationItem>
                      <PaginationNext
                        href={buildUrl({ page: query.page + 1 })}
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
