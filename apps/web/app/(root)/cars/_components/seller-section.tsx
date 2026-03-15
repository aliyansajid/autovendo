"use client";

import { Phone, Mail, ExternalLink, MapPin, ArrowRight, Star } from "lucide-react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/src/components/card";
import Link from "next/link";
import { LocationMap } from "./location-map";

interface SellerSectionProps {
  seller: {
    id: string;
    logo?: string;
    name: string;
    rating: number;
    reviewCount: number;
    website?: string;
    phone: string;
    address: string;
    contactPerson?: string;
    businessEmail?: string;
    description?: string;
    openingHours?: { day: string; hours: string }[];
  };
}

export const SellerSection = ({ seller }: SellerSectionProps) => {
  return (
    <Card>
      <CardHeader className="border-b gap-0">
        <CardTitle>Verkäufer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="space-y-2">
                {seller.logo && (
                  <div className="relative w-32 h-32">
                    <Image
                      src={seller.logo}
                      alt={seller.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <h3 className="font-bold text-lg">{seller.name}</h3>
                <div className="flex items-center gap-1.5 text-sm">
                  <div className="flex text-rating">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`size-4 ${i < Math.round(seller.rating) ? "fill-rating text-rating" : "text-muted-foreground opacity-30 fill-current"}`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold">{seller.rating}</span>
                  <span className="text-muted-foreground">
                    ({seller.reviewCount} Bewertungen)
                  </span>
                </div>
                {seller.contactPerson && (
                  <p className="text-sm text-muted-foreground">
                    Ansprechpartner: {seller.contactPerson}
                  </p>
                )}
                {seller.website && (
                  <Link
                    href={seller.website.startsWith("http") ? seller.website : `https://${seller.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
                  >
                    {seller.website}
                    <ExternalLink className="size-4" />
                  </Link>
                )}
                {seller.description && (
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {seller.description}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Link
                  href={`tel:${seller.phone}`}
                  className="flex items-center gap-2 text-sm text-primary underline-offset-4 hover:underline"
                >
                  <Phone className="size-4" />
                  {seller.phone}
                </Link>
                {seller.businessEmail && (
                  <Link
                    href={`mailto:${seller.businessEmail}`}
                    className="flex items-center gap-2 text-sm text-primary underline-offset-4 hover:underline"
                  >
                    <Mail className="size-4" />
                    {seller.businessEmail}
                  </Link>
                )}

                <Link
                  href={`https://maps.google.com/?q=${seller.address}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-primary underline-offset-4 hover:underline"
                >
                  <MapPin className="size-4" />
                  {seller.address}
                </Link>

                <Link
                  href={`/cars?dealerId=${seller.id}`}
                  className="flex items-center gap-2 text-sm text-primary underline-offset-4 hover:underline"
                >
                  <ArrowRight className="size-4" />
                  Alle Fahrzeuge dieses Händlers
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold mb-3">Öffnungszeiten</h4>
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
                  Keine Öffnungszeiten verfügbar.
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
