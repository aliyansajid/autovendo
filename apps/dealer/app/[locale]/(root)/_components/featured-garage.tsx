import { Card, CardContent, CardHeader } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@repo/ui/components/carousel";
import Image from "next/image";
import { MapPin, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export type FeaturedGarageItem = {
  id: string;
  name: string;
  image: string;
  garageLocation: string;
};

export const FeaturedGarage = ({
  garages = [],
}: {
  garages?: FeaturedGarageItem[];
}) => {
  const t = useTranslations("FeaturedGarage");

  if (garages.length === 0) {
    return (
      <section className="bg-secondary">
        <div className="w-full max-w-285 mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-6">{t("title")}</h2>
          <p className="text-muted-foreground">{t("emptyState")}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-secondary">
      <div className="w-full max-w-285 mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">{t("title")}</h2>
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
                className="basis-full sm:basis-1/2 lg:basis-1/4"
              >
                <Link href={`/dealers/${garage.id}`} className="group">
                  <Card className="pt-0 transition-shadow hover:shadow-lg cursor-pointer">
                    <CardHeader className="relative h-48 overflow-hidden rounded-t-xl">
                      <Image
                        src={garage.image}
                        alt={garage.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 640px) 100vw, 25vw"
                      />
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <h2 className="text-lg font-bold truncate">
                          {garage.name}
                        </h2>
                        <div className="flex items-center text-muted-foreground gap-1">
                          <MapPin className="size-4 shrink-0" />
                          <span className="text-sm truncate">
                            {garage.garageLocation}
                          </span>
                        </div>
                      </div>

                      <Button variant="secondary" className="w-full">
                        {t("button")}
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
