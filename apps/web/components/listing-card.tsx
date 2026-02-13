"use client";

import { Card, CardContent, CardFooter } from "@repo/ui/components/card";
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
    <Card className="pt-0 h-full flex flex-col">
      <div className="relative h-48 w-full">
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
      </div>
      <CardContent className="space-y-3">
        <h1 className="text-lg font-bold truncate" title={item.title}>
          {item.title}
        </h1>
        <h3 className="text-xl font-bold text-primary">{item.price}</h3>
        <Separator />
        <div className="flex items-center text-sm text-gray-600">
          {item.details.map((detail, i) => (
            <span key={i} className="flex items-center">
              {detail}
              {i < item.details.length - 1 && (
                <Separator orientation="vertical" className="h-10 mx-2" />
              )}
            </span>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex justify-between items-end w-full">
          <div className="flex flex-col">
            <span
              className="text-sm font-semibold truncate"
              title={item.dealer}
            >
              {item.dealer}
            </span>

            <span
              className="text-xs text-gray-500 truncate"
              title={item.location}
            >
              {item.location}
            </span>
          </div>
          <Button variant="outline" size="icon">
            <Heart className="text-gray-400" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
