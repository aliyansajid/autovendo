"use client";

import { ListingCard } from "@/components/listing-card";
import { Button } from "@repo/ui/src/components/button";
import { MinusCircle, PlusCircle } from "lucide-react";
import { useState } from "react";
import { ListingProps } from "@/types";

export const FeaturedListings = ({
  listings = [],
}: {
  listings?: ListingProps[];
}) => {
  const [visibleCount, setVisibleCount] = useState(4);

  if (listings.length === 0) {
    return (
      <section className="w-full max-w-285 mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Neueste Fahrzeuge</h2>
        <p className="text-muted-foreground">
          Derzeit keine Fahrzeuge eingestellt.
        </p>
      </section>
    );
  }

  return (
    <section className="w-full max-w-285 mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-6">Neueste Fahrzeuge</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {listings.slice(0, visibleCount).map((item) => (
          <ListingCard key={item.id} item={item} />
        ))}
      </div>

      {listings.length > 4 && (
        <div className="flex justify-center mt-12">
          <Button
            variant="outline"
            onClick={() =>
              setVisibleCount((prev) =>
                prev >= listings.length
                  ? 4
                  : Math.min(prev + 4, listings.length),
              )
            }
          >
            {visibleCount >= listings.length ? (
              <>
                <MinusCircle />
                Weniger anzeigen
              </>
            ) : (
              <>
                <PlusCircle />
                Mehr anzeigen
              </>
            )}
          </Button>
        </div>
      )}
    </section>
  );
};
