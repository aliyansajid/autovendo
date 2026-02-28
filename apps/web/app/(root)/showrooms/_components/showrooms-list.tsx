"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { FieldGroup } from "@repo/ui/src/components/field";
import { Badge } from "@repo/ui/components/badge";
import Image from "next/image";
import { MapPin, ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { showrooms } from "@/lib/mock-data";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@repo/ui/src/components/input-group";

export const ShowroomsList = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredShowrooms = showrooms.filter(
    (garage) =>
      garage.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      garage.location.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-full max-w-285 mx-auto px-4 py-12 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Unsere Showrooms</h1>
          <p className="text-muted-foreground text-sm">
            Finden Sie den passenden Händler in Ihrer Nähe.
          </p>
        </div>

        <FieldGroup className="w-full md:w-96">
          <InputGroup>
            <InputGroupInput placeholder="Search..." />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
          </InputGroup>
        </FieldGroup>
      </div>

      {filteredShowrooms.length === 0 ? (
        <div className="py-20 text-center bg-secondary/30 rounded-xl border border-border mt-8">
          <h3 className="text-xl font-semibold mb-2">
            Keine Showrooms gefunden
          </h3>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredShowrooms.map((garage) => (
            <Link
              key={garage.id}
              href={`/showrooms/${garage.id}`}
              className="group"
            >
              <Card className="pt-0 transition-shadow hover:shadow-md cursor-pointer">
                <CardHeader className="relative h-48 overflow-hidden rounded-t-xl">
                  <Image
                    src={garage.image}
                    alt={garage.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    priority={garage.id <= 4}
                  />
                  {(garage.id === 1 || garage.id === 2) && (
                    <Badge className="absolute top-2 right-2 bg-yellow-400 text-foreground font-semibold z-10">
                      Premium Partner
                    </Badge>
                  )}
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-lg font-bold">{garage.name}</h2>
                    <div className="flex items-center text-muted-foreground gap-1">
                      <MapPin className="size-4" />
                      <span className="text-sm truncate">
                        {garage.location}
                      </span>
                    </div>
                  </div>

                  <Button variant="secondary" className="w-full" asChild>
                    <div>
                      Zum Showroom
                      <ArrowRight />
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
