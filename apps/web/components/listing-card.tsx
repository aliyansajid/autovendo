"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import Image from "next/image";
import { Heart } from "lucide-react";
import { Separator } from "@repo/ui/components/separator";
import Link from "next/link";

export interface ListingProps {
  id: number | string;
  image: string;
  badge: string;
  title: string;
  price: string;
  details: string[];
  dealer: string;
  location: string;
}

export const ListingCard = ({ item }: { item: ListingProps }) => {
  return (
    <Link key={item.id} href={`/cars/${item.id}`} className="group">
      <Card
        className="pt-0 transition-shadow hover:shadow-lg cursor-pointer"
        key={item.id}
      >
        <CardHeader className="relative h-48 overflow-hidden rounded-t-xl">
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            priority={true}
            fetchPriority="high"
          />
          {item.badge && (
            <Badge className="absolute top-2 right-2 bg-[#f9a602] text-foreground font-semibold">
              {item.badge}
            </Badge>
          )}
        </CardHeader>

        <CardContent className="space-y-3">
          <h2 className="text-lg font-bold truncate">{item.title}</h2>
          <p className="text-xl font-bold text-primary">{item.price}</p>
          <Separator />
          <div className="flex items-center text-sm text-muted-foreground">
            {item.details.map((detail, i) => (
              <span key={i} className="flex items-center">
                {detail}
                {i < item.details.length - 1 && (
                  <Separator orientation="vertical" className="h-4! mx-2" />
                )}
              </span>
            ))}
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold truncate">
              {item.dealer}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {item.location}
            </span>
          </div>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Save to favorites"
          >
            <Heart className="text-muted-foreground" />
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};
