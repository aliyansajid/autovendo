"use client";

import { Card, CardContent } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import Image from "next/image";
import { Heart, Mail, Check, Star } from "lucide-react";
import { ListingProps } from "@/components/listing-card";
import Link from "next/link";

export const ListingListCard = ({ item }: { item: ListingProps }) => {
  return (
    <Link key={item.id} href={`/cars/${item.id}`} className="group">
      <Card
        key={item.id}
        className="hover:border-primary transition-colors group"
      >
        <CardContent className="flex flex-col sm:flex-row gap-6">
          <div className="flex flex-col gap-2 w-full sm:w-[280px] md:w-[320px]">
            <div className="relative w-full aspect-4/3 rounded-md overflow-hidden bg-muted">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 100vw, 320px"
              />
              {item.badge && (
                <Badge className="absolute top-2 left-2 bg-[#f9a602] text-foreground font-semibold">
                  {item.badge}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="relative w-full aspect-4/3 rounded-md overflow-hidden bg-muted">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                />
              </div>
              <div className="relative w-full aspect-4/3 rounded-md overflow-hidden bg-muted">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                />
              </div>
              <div className="relative w-full aspect-4/3 rounded-md overflow-hidden bg-muted">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col grow py-1">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {item.badge === "New" && (
                    <Badge
                      variant="secondary"
                      className="text-xs font-semibold uppercase rounded-sm"
                    >
                      NEU
                    </Badge>
                  )}
                  <span className="text-sm font-semibold">{item.title}</span>
                </div>
                <h2 className="text-lg font-bold">{item.title}</h2>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <p className="text-2xl font-bold">{item.price}</p>
                <div className="flex flex-col items-start gap-1">
                  <div className="flex gap-0.5">
                    <div className="h-2 w-5 bg-green-600 rounded-sm" />
                    <div className="h-2 w-5 bg-green-600 rounded-sm" />
                    <div className="h-2 w-5 bg-green-600 rounded-sm" />
                    <div className="h-2 w-5 bg-muted rounded-sm" />
                    <div className="h-2 w-5 bg-muted rounded-sm" />
                  </div>
                  <span className="text-xs text-green-600 font-medium">
                    Guter Preis
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 text-sm text-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-semibold">Unfallfrei</span>
              <span className="text-muted-foreground">•</span>
              <span>EZ {item.details[0] || "-"}</span>
              <span className="text-muted-foreground">•</span>
              <span>{item.details[1] || "-"}</span>
              <span className="text-muted-foreground">•</span>
              <span>110 kW (150 PS)</span>
              <span className="text-muted-foreground">•</span>
              <span>{item.details[2] || "-"}</span>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="size-4 text-muted-foreground" />
                <span>Scheckheftgepflegt</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="size-4 text-muted-foreground" />
                <span>TÜV NEU</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="size-4 text-muted-foreground" />
                <span>12M Premium Garantie</span>
              </div>
            </div>

            <div className="mt-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold truncate">
                    {item.dealer}
                  </span>
                  <div className="flex items-center text-yellow-400">
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current opacity-30" />
                  </div>
                  <span className="text-muted-foreground text-xs">(71)</span>
                </div>
                <span className="text-xs text-muted-foreground truncate">
                  {item.location}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button>
                  <Mail />
                  Kontakt
                </Button>
                <Button variant="outline">
                  <Heart />
                  Parken
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
