export const dynamic = "force-dynamic";

import { SearchForm } from "./_components/search-form";
import { FeaturedListings } from "./_components/featured-listings";
import { HowItWorks } from "./_components/how-it-works";
import { SellCta } from "./_components/sell-cta";
import { getVehicles } from "@/app/actions/vehicles.actions";
import { buildVehicleTitle } from "@/lib/helpers/vehicle";
import {
  formatPrice,
  formatNumber,
  formatRegistrationDate,
} from "@/lib/helpers/format";
import { getImageUrl } from "@/lib/helpers/image";
import type { VehicleListItem, ListingProps } from "@/types/vehicle";
import { getTranslations } from "next-intl/server";

export default async function HomePage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;

  const [vehiclesResult, tVehicle] = await Promise.all([
    getVehicles({ pageSize: "12", sort: "created-desc" }).catch(() => ({
      vehicles: [],
      total: 0,
      page: 1,
      pageSize: 12,
      totalPages: 0,
    })),
    getTranslations("Vehicle"),
  ]);

  function vehicleToListingProps(item: VehicleListItem): ListingProps {
    const sellerName = item.dealer?.companyName ?? item.seller?.firstName
      ? `${item.seller?.firstName} ${item.seller?.lastName}`.trim()
      : "";
    const sellerLocation = item.dealer
      ? [item.dealer.zipCode, item.dealer.city].filter(Boolean).join(" ")
      : [item.seller?.zipCode, item.seller?.city].filter(Boolean).join(" ");

    return {
      id: item.id,
      image: getImageUrl(item.images[0]),
      badge: item.vehicleCondition
        ? tVehicle(`conditions.${item.vehicleCondition.toUpperCase()}`)
        : undefined,
      title: buildVehicleTitle(item.make, item.model, item.version),
      price: formatPrice(item.price, locale),
      details: [
        formatRegistrationDate(item.registrationMonth, item.registrationYear),
        `${formatNumber(item.kilometer, locale)} km`,
        item.fuelType
          ? tVehicle(`fuelTypes.${item.fuelType.toUpperCase()}`)
          : "",
      ].filter(Boolean),
      garageName: sellerName,
      garageId: item.dealer?.id ?? item.seller?.id ?? "",
      garageLocation: sellerLocation,
    };
  }

  const listings: ListingProps[] = vehiclesResult.vehicles.map(
    vehicleToListingProps,
  );

  return (
    <>
      <div className="bg-linear-to-r from-primary to-primary/80">
        <div className="w-full max-w-285 mx-auto px-4 py-12">
          <SearchForm />
        </div>
      </div>
      <FeaturedListings listings={listings} />
      <HowItWorks />
      <SellCta />
    </>
  );
}
