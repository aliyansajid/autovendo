"use client";

import { LocationMap } from "./location-map";
import { Phone, ExternalLink, MapPin, ArrowRight, Printer } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/src/components/card";
import Link from "next/link";

interface SellerSectionProps {
  seller: {
    name: string;
    address: string;
    phones: string[];
    rating: number;
    reviewCount: number;
    website?: string;
    fax?: string;
    logo?: string;
    openingHours?: { day: string; hours: string }[];
  };
}

export const SellerSection = ({ seller }: SellerSectionProps) => {
  return (
    <Card>
      <CardHeader className="border-b gap-0">
        <CardTitle>Seller</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="relative w-32 h-32 mb-2">
                  <Image
                    src={seller.logo as string}
                    alt={seller.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="font-bold text-lg">{seller.name}</h3>
                <div className="flex items-center gap-1.5 text-sm">
                  <div className="flex text-yellow-400">
                    {"★".repeat(Math.round(seller.rating))}
                  </div>
                  <span className="font-semibold">{seller.rating}</span>
                  <span className="text-muted-foreground">
                    ({seller.reviewCount} reviews)
                  </span>
                </div>
                {seller.website && (
                  <Link
                    href={`https://${seller.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary text-sm hover:underline flex items-center gap-1"
                  >
                    {seller.website} <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>

              <div className="space-y-3">
                {seller.phones.slice(0, 2).map((phone, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="font-medium">{phone}</span>
                  </div>
                ))}
                {seller.fax && (
                  <div className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors cursor-pointer">
                    <Printer className="w-4 h-4" />
                    <span className="font-medium">{seller.fax}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors cursor-pointer">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">{seller.address}</span>
                </div>
                <div className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors cursor-pointer">
                  <ArrowRight className="w-4 h-4" />
                  <span className="font-medium">
                    All vehicles from this dealer
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold mb-3">Opening hours</h4>
              {seller.openingHours ? (
                <div className="space-y-2 text-sm">
                  {seller.openingHours.map((item, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-sm text-muted-foreground capitalize">
                        {item.day}
                      </span>
                      <span className="font-medium text-sm text-right">
                        {item.hours}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No opening hours available.
                </p>
              )}
            </div>
          </div>

          <LocationMap address={seller.address} />
        </div>
      </CardContent>
    </Card>
  );
};
