import { Card, CardContent, CardHeader } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@repo/ui/components/carousel";
import Image from "next/image";
import { MapPin, ArrowRight } from "lucide-react";
import { garages } from "@/lib/mock-data";
import Link from "next/link";

export const FeaturedGarage = () => {
  return (
    <section className="py-12 bg-secondary">
      <div className="w-full max-w-285 mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">Ausgewählte Garagen</h2>
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent>
            {garages.map((garage) => (
              <CarouselItem
                key={garage.id}
                className="basis-full sm:basis-1/2 lg:basis-1/3"
              >
                <Card className="pt-0">
                  <CardHeader className="relative h-48">
                    <Image
                      src={garage.image}
                      alt={garage.name}
                      fill
                      className="object-cover rounded-t-xl"
                      priority={true}
                      fetchPriority="high"
                    />
                    <Badge className="absolute top-2 right-2 bg-yellow-400 text-foreground font-semibold">
                      Featured
                    </Badge>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <h2 className="text-lg font-bold truncate">
                      {garage.name}
                    </h2>

                    <div className="flex items-center text-muted-foreground gap-1">
                      <MapPin className="size-4" />
                      <span className="text-sm">{garage.location}</span>
                    </div>

                    <Button variant="link" className="p-0 has-[>svg]:px-0">
                      <Link href={`/garage/${garage.id}`}>View Inventory</Link>
                      <ArrowRight />
                    </Button>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden sm:block">
            <CarouselPrevious className="bg-primary text-white size-10" />
            <CarouselNext className="bg-primary text-white size-10" />
          </div>
        </Carousel>
      </div>
    </section>
  );
};
