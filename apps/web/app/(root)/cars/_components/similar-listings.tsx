"use client";

import { ListingCard } from "@/components/listing-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@repo/ui/components/carousel";
import { Button } from "@repo/ui/components/button";
import Link from "next/link";

interface SimilarListingsProps {
  listings: any[];
}

export const SimilarListings = ({ listings }: SimilarListingsProps) => {
  if (!listings || listings.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Das könnte Sie auch interessieren
        </h2>
        <Button variant="link" asChild>
          <Link href="/cars">Alle anzeigen</Link>
        </Button>
      </div>

      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full"
      >
        <CarouselContent>
          {listings.map((item) => (
            <CarouselItem key={item.id} className="basis-full md:basis-1/2">
              <ListingCard
                item={{
                  id: item.id,
                  title: item.title,
                  price: item.price,
                  details: item.details,
                  dealer: item.dealer,
                  dealerId: item.dealerId,
                  location: item.location,
                  badge: item.badge,
                  image: item.image,
                }}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden sm:block">
          <CarouselPrevious className="-left-4 bg-primary text-white size-10" />
          <CarouselNext className="-right-4 bg-primary text-white size-10" />
        </div>
      </Carousel>
    </section>
  );
};
