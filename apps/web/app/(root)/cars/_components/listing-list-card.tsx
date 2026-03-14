import { Card, CardContent } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import Image from "next/image";
import { Check, Star, Phone } from "lucide-react";
import Link from "next/link";
import { Separator } from "@repo/ui/src/components/separator";
import type { VehicleListItem } from "@/lib/schemas/vehicle.schema";
import { formatPrice, formatNumber, formatRegistrationDate, formatEnumLabel } from "@/lib/helpers/format";
import { getImageUrl } from "@/lib/helpers/image";
import { buildVehicleTitle, extractEquipment, formatEquipmentLabel } from "@/lib/helpers/vehicle";

export interface ListingListCardProps {
  item: VehicleListItem;
  showDealerLink?: boolean;
}

/**
 * Vehicle List Card - Pure UI Component
 * Uses helpers for all formatting and business logic
 */
export function ListingListCard({
  item,
  showDealerLink = true,
}: ListingListCardProps) {
  // Use helpers for ALL formatting
  const title = buildVehicleTitle(item.make, item.model, item.version);
  const formattedPrice = formatPrice(item.price);
  const formattedKm = formatNumber(item.kilometer);
  const registrationDate = formatRegistrationDate(item.registrationMonth, item.registrationYear);
  const equipmentList = extractEquipment(item.equipment, 4);

  return (
    <Card className="hover:border-primary transition-colors group relative cursor-pointer">
      <Link
        href={`/cars/${item.id}`}
        className="absolute inset-0 z-10"
        aria-label={title}
      />

      <CardContent className="flex flex-col sm:flex-row gap-6">
        <div className="flex flex-col gap-2 w-full sm:w-[280px] md:w-[320px]">
          <div className="relative w-full aspect-4/3 rounded-md overflow-hidden bg-muted">
            <Image
              src={getImageUrl(item.images[0])}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, 320px"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {item.images.slice(1, 4).map((img, i) => (
              <div
                key={i}
                className="relative w-full aspect-4/3 rounded-md overflow-hidden bg-muted"
              >
                <Image
                  src={getImageUrl(img)}
                  alt={`${title} - image ${i + 2}`}
                  fill
                  className="object-cover opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col grow py-1 text-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {item.vehicleCondition === "NEW" && (
                <Badge
                  variant="secondary"
                  className="text-xs font-semibold uppercase rounded-sm"
                >
                  NEU
                </Badge>
              )}
              <span className="text-sm font-semibold">{item.make}</span>
            </div>

            <h2 className="text-lg font-bold">{title}</h2>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <p className="text-2xl font-bold">{formattedPrice}</p>

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
            <span>EZ {registrationDate}</span>
            <span className="text-muted-foreground">•</span>
            <span>{formattedKm} km</span>
            <span className="text-muted-foreground">•</span>
            {item.kw !== null && item.kw !== undefined && (
              <>
                <span>
                  {item.kw} kW{item.hp ? ` (${item.hp} PS)` : ""}
                </span>
                <span className="text-muted-foreground">•</span>
              </>
            )}
            {item.fuelType && <span>{formatEnumLabel(item.fuelType)}</span>}
          </div>

          <div className="my-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
            {equipmentList.map((eq) => (
              <div key={eq} className="flex items-center gap-2">
                <Check className="size-4" />
                <span>{formatEquipmentLabel(eq)}</span>
              </div>
            ))}
            {equipmentList.length === 0 && (
              <div className="flex items-center gap-2">
                <Check className="size-4" />
                <span>Gepflegter Zustand</span>
              </div>
            )}
          </div>

          <Separator />

          <div className="mt-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 ">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Link
                  href={`/dealers/${item.dealer.id}`}
                  className="text-sm font-bold truncate hover:underline relative z-20"
                >
                  {item.dealer.companyName}
                </Link>

                <div className="flex items-center text-rating">
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current opacity-30" />
                </div>
                <span className="text-xs text-muted-foreground">(0)</span>
              </div>

              <span className="text-xs text-muted-foreground truncate">
                {item.dealer.zipCode} {item.dealer.city}
              </span>
            </div>

            <Button asChild className="relative z-20">
              <Link href={`tel:${item.dealer.phoneNumber}`}>
                <Phone />
                Kontakt
              </Link>
            </Button>
          </div>

          {showDealerLink && (
            <Link
              href={`/dealers/${item.dealer.id}`}
              className="mt-4 text-sm text-primary hover:underline relative z-20"
            >
              Alle Fahrzeuge von diesem Händler
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
