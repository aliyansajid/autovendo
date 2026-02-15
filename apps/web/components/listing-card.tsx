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

export interface ListingProps {
  id: number | string;
  title: string;
  price: string;
  details: string[];
  dealer: string;
  location: string;
  badge: string;
  image: string;
}

export const ListingCard = ({ item }: { item: ListingProps }) => {
  return (
    <Card className="pt-0">
      <CardHeader className="relative h-48">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover rounded-t-xl"
        />
        {item.badge && (
          <Badge
            className="absolute top-2 right-2 shadow-sm"
            variant="secondary"
          >
            {item.badge}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <h1 className="text-lg font-bold truncate" title={item.title}>
          {item.title}
        </h1>
        <h3 className="text-xl font-bold text-primary">{item.price}</h3>
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
      <CardFooter className="flex items-end justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-semibold truncate" title={item.dealer}>
            {item.dealer}
          </span>

          <span
            className="text-xs text-muted-foreground truncate"
            title={item.location}
          >
            {item.location}
          </span>
        </div>
        <Button variant="outline" size="icon">
          <Heart className="text-muted-foreground" />
        </Button>
      </CardFooter>
    </Card>
  );
};
