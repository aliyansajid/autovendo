"use client";

import { Button } from "@repo/ui/components/button";
import { useState } from "react";
import { ListingCard } from "@/components/listing-card";
import { listings } from "@/lib/mock-data";

export const FeaturedListings = () => {
  const [visibleCount, setVisibleCount] = useState(4);

  return (
    <section className="w-full max-w-285 mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-6">
        Neueste Ergebnisse Ihrer letzten Suche
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {listings.slice(0, visibleCount).map((item) => (
          <ListingCard key={item.id} item={item} />
        ))}
      </div>

      {listings.length > 4 && (
        <div className="flex justify-center mt-12">
          <Button
            onClick={() =>
              setVisibleCount((prev) =>
                prev >= listings.length
                  ? 4
                  : Math.min(prev + 4, listings.length),
              )
            }
          >
            {visibleCount >= listings.length ? "Show less" : "Load more"}
          </Button>
        </div>
      )}
    </section>
  );
};
