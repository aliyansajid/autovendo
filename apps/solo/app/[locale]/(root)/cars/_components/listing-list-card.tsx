"use client";

import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import Image from "next/image";
import { Check, Phone } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Separator } from "@repo/ui/src/components/separator";
import type { VehicleListItem } from "@/types/vehicle";
import {
  formatPrice,
  formatNumber,
  formatRegistrationDate,
} from "@/lib/helpers/format";
import { getImageUrl } from "@/lib/helpers/image";
import {
  extractEquipment,
  formatEquipmentLabel,
  formatVehicleName,
} from "@/lib/helpers/vehicle";

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
  const t = useTranslations();
  const tCard = useTranslations("ListingListCard");
  const tVehicle = useTranslations("Vehicle");
  const locale = useLocale();

  const getVehicleLabel = (namespace: string, key: string | null | undefined) => {
    if (!key) return undefined;
    const formattedKey = `${namespace}.${key.toUpperCase().replace(/-/g, "_")}` as any;
    const translated = tVehicle(formattedKey);
    return translated !== formattedKey ? translated : key;
  };

  // Use helpers for ALL formatting
  const title = formatVehicleName([item.make, item.model, item.version]);
  const formattedPrice = formatPrice(item.price);
  const formattedKm = formatNumber(item.kilometer);
  const registrationDate = formatRegistrationDate(
    item.registrationMonth,
    item.registrationYear,
  );
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
            {item.vehicleCondition && (
              <Badge className="absolute top-2 left-2 bg-rating text-foreground font-semibold text-xs">
                {getVehicleLabel("conditions", item.vehicleCondition)}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {item.images.slice(1, 4).map((img, i) => (
              <div
                key={i}
                className="relative w-full aspect-4/3 rounded-md overflow-hidden bg-muted"
              >
                <Image
                  src={getImageUrl(img)}
                  alt={`${title} - Bild ${i + 2}`}
                  fill
                  className="object-cover opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col grow py-1 text-sm">
          <div className="space-y-1.5">
            <Badge variant="secondary" className="font-bold uppercase">
              {item.make}
            </Badge>
            <h2 className="text-lg font-bold leading-tight">
              {formatVehicleName(["", item.model, item.version])}
            </h2>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <p className="text-2xl font-bold">{formattedPrice}</p>

              {item.priceRating && (
                <div className="flex flex-col items-start gap-1">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <div
                        key={i}
                        className={`h-2 w-5 rounded-sm ${
                          i < item.priceRating!.bars
                            ? item.priceRating!.sentiment === "red"
                              ? "bg-red-500"
                              : item.priceRating!.sentiment === "yellow"
                                ? "bg-yellow-500"
                                : "bg-green-600"
                            : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      item.priceRating.sentiment === "red"
                        ? "text-red-500"
                        : item.priceRating.sentiment === "yellow"
                          ? "text-yellow-500"
                          : "text-green-600"
                    }`}
                  >
                    {t(`Vehicle.priceRating.${item.priceRating.label}` as any)}
                  </span>
                </div>
              )}
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
                  {formatNumber(item.kw)} kW
                  {item.hp ? ` (${formatNumber(item.hp)} PS)` : ""}
                </span>
                <span className="text-muted-foreground">•</span>
              </>
            )}
            {item.fuelType && (
              <span>{getVehicleLabel("fuelTypes", item.fuelType)}</span>
            )}
          </div>

          <div className="my-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
            {equipmentList.map((eq) => (
              <div key={eq} className="flex items-center gap-2">
                <Check className="size-4" />
                <span>
                  {(() => {
                    const normalizedEq = eq
                      .replace(/([a-z])([A-Z])/g, "$1_$2")
                      .toUpperCase()
                      .replace(/[-]/g, "_");
                    const translationKey = `equipment.${normalizedEq}` as any;
                    const translated = tVehicle(translationKey);
                    // If next-intl returns the key itself, it means translation was not found
                    return translated !== translationKey
                      ? translated
                      : formatEquipmentLabel(eq);
                  })()}
                </span>
              </div>
            ))}
            {equipmentList.length === 0 && (
              <div className="flex items-center gap-2">
                <Check className="size-4" />
                <span>{tCard("wellMaintained")}</span>
              </div>
            )}
          </div>

          <Separator />

          <div className="mt-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 ">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-bold truncate">
                {item.seller
                  ? `${item.seller.firstName} ${item.seller.lastName}`
                  : ""}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {item.seller?.zipCode} {item.seller?.city}
              </span>
            </div>

            {item.seller?.phoneNumber && (
              <Button asChild className="relative z-20">
                <Link href={`tel:${item.seller.phoneNumber}`}>
                  <Phone />
                  {tCard("contact")}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
