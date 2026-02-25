import { FiltersSidebar } from "@/components/filters-sidebar";
import { ListingCard } from "@/components/listing-card";
import { listings } from "@/lib/mock-data";
import { AdvancedSearch } from "@/components/advanced-search";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/src/components/select";
import { Card, CardContent } from "@repo/ui/src/components/card";

export default function CarsPage() {
  return (
    <div className="w-full max-w-285 mx-auto px-4 py-12">
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-2xl font-bold">Fahrzeuge finden</h1>
        <p className="text-muted-foreground">
          Entdecken Sie unser breites Angebot an Fahrzeugen
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative items-start">
        <aside className="hidden lg:block lg:col-span-1">
          <FiltersSidebar showActions={false} />
        </aside>

        <div className="lg:col-span-3 flex flex-col gap-6">
          <Card className="py-3">
            <CardContent className="px-3 flex flex-col-reverse sm:flex-col gap-4">
              <div className="w-full sm:w-auto lg:hidden">
                <AdvancedSearch />
              </div>

              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-muted-foreground whitespace-nowrap">
                  {listings.length} Treffer
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground hidden sm:inline">
                    Sortieren nach:
                  </span>
                  <Select defaultValue="relevance">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sortieren" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">
                        Beste Ergebnisse
                      </SelectItem>
                      <SelectItem value="price-asc">
                        Preis aufsteigend
                      </SelectItem>
                      <SelectItem value="price-desc">
                        Preis absteigend
                      </SelectItem>
                      <SelectItem value="date-desc">Neueste zuerst</SelectItem>
                      <SelectItem value="mileage-asc">
                        Kilometerstand aufsteigend
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {listings.map((item) => (
              <ListingCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
