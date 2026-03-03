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
import { dealers } from "@/lib/mock-data";
import Link from "next/link";

export const FeaturedGarage = () => {
  return (
    <section className="bg-secondary">
      <div className="w-full max-w-285 mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Ausgewählte Garagen</h2>
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent>
            {dealers.map((garage) => (
              <CarouselItem
                key={garage.id}
                className="basis-full sm:basis-1/2 lg:basis-1/4"
              >
                <Link
                  key={garage.id}
                  href={`/dealers/${garage.id}`}
                  className="group"
                >
                  <Card className="pt-0 transition-shadow hover:shadow-lg cursor-pointer">
                    <CardHeader className="relative h-48 overflow-hidden rounded-t-xl">
                      <Image
                        src={garage.image}
                        alt={garage.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        priority={garage.id <= 4}
                      />
                      {(garage.id === 1 || garage.id === 2) && (
                        <Badge className="absolute top-2 right-2 bg-[#f9a602] text-foreground font-semibold z-10">
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

                      <Button variant="secondary" className="w-full">
                        Zum garage
                        <ArrowRight />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
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
