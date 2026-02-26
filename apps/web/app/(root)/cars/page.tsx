import { FiltersSidebar } from "./_components/filters-sidebar";
import { ListingListCard } from "./_components/listing-list-card";
import { listings } from "@/lib/mock-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/src/components/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/src/components/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@repo/ui/src/components/input-group";
import { Search } from "lucide-react";

export default function CarsPage() {
  return (
    <>
      <div className="bg-linear-to-r from-primary to-primary/80">
        <div className="w-full max-w-285 mx-auto py-12 px-4">
          <div className="text-center text-white space-y-3">
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
            <FiltersSidebar showActions={false} />
          </aside>

          <div className="lg:col-span-3 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{listings.length} Angebote</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <InputGroup>
                  <InputGroupInput placeholder="Search..." />
                  <InputGroupAddon>
                    <Search />
                  </InputGroupAddon>
                </InputGroup>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sortieren nach" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">
                      Standard-Sortierung
                    </SelectItem>
                    <SelectItem value="price-asc">
                      Preis (niedrigster zuerst)
                    </SelectItem>
                    <SelectItem value="price-desc">
                      Preis (höchster zuerst)
                    </SelectItem>
                    <SelectItem value="date-desc">
                      Kilometerstand (niedrigster zuerst)
                    </SelectItem>
                    <SelectItem value="mileage-asc">
                      Kilometerstand (höchster zuerst)
                    </SelectItem>
                    <SelectItem value="mileage-asc">
                      Erstzulassung (älteste zuerst)
                    </SelectItem>
                    <SelectItem value="mileage-asc">
                      Erstzulassung (jüngste zuerst)
                    </SelectItem>
                    <SelectItem value="mileage-asc">
                      Inserate (älteste zuerst)
                    </SelectItem>
                    <SelectItem value="mileage-asc">
                      Inserate (neueste zuerst)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-4">
              {listings.map((item) => (
                <ListingListCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
