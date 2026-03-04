"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import { MapPin, ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { garages } from "@/lib/mock-data";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@repo/ui/src/components/input-group";

export const DealersList = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGarages = garages.filter(
    (garage) =>
      garage.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      garage.garageLocation.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
      </div>

      {filteredGarages.length === 0 ? (
        <div className="py-20 text-center bg-secondary/30 rounded-xl border border-border">
          <h3 className="text-xl font-semibold mb-2">Kein Händler gefunden</h3>
          <p className="text-muted-foreground">
            Versuchen Sie es mit einem anderen Suchbegriff.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setSearchQuery("")}
          >
            Suche zurücksetzen
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
          {filteredGarages.map((garage) => (
            <Link
              key={garage.id}
              href={`/dealers/${garage.id}`}
              className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-muted/50 transition-colors group"
            >
              <div className="min-w-0 space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-base truncate">
                    {garage.name}
                  </h2>
                  {(garage.id === 1 || garage.id === 2) && (
                    <Badge className="bg-[#f9a602] text-foreground font-semibold">
                      Premium Partner
                    </Badge>
                  )}
                </div>
                <div className="flex items-center text-muted-foreground gap-1">
                  <MapPin className="size-3.5" />
                  <span className="text-xs">{garage.garageLocation}</span>
                </div>
              </div>

              <ArrowRight className="size-4 text-muted-foreground -translate-x-1 group-hover:translate-x-0 transition-transform" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
