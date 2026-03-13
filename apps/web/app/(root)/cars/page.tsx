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
import {
  getVehiclesWithFacets,
} from "@/app/actions/vehicles";
import { parseVehicleSearchParams } from "@/lib/vehicle-search";
import { ListingControls } from "./_components/listing-controls";

function toUrlSearchParams(input: {
  [key: string]: string | string[] | undefined;
}) {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const v of value) sp.append(key, v);
    } else {
      sp.set(key, value);
    }
  }
  return sp;
}

export default async function CarsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const query = parseVehicleSearchParams(searchParams);
  const { vehicles, total, totalPages, facets } = await getVehiclesWithFacets(
    query,
  );

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
            <FiltersSidebar
              showActions={false}
              resultCount={total}
              facets={facets}
            />
          </aside>

          <div className="lg:col-span-3 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{total} Angebote</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <ListingControls
                  initialSearch={query.search}
                  initialSort={query.sort}
                />
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
                        href={`/cars?${(() => {
                          const sp = toUrlSearchParams(searchParams);
                          sp.set("page", (query.page - 1).toString());
                          return sp.toString();
                        })()}`}
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
                                href={`/cars?${(() => {
                                  const sp = toUrlSearchParams(searchParams);
                                  sp.set("page", p.toString());
                                  return sp.toString();
                                })()}`}
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
                            href={`/cars?${(() => {
                              const sp = toUrlSearchParams(searchParams);
                              sp.set("page", p.toString());
                              return sp.toString();
                            })()}`}
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
                        href={`/cars?${(() => {
                          const sp = toUrlSearchParams(searchParams);
                          sp.set("page", (query.page + 1).toString());
                          return sp.toString();
                        })()}`}
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
