import { SearchForm } from "./_components/search-form";
import { FeaturedListings } from "./_components/featured-listings";
import { FeaturedGarage } from "./_components/featured-garage";
import { About } from "./_components/about";
import { getVehicles } from "@/app/actions/vehicles.actions";
import { getDealers } from "@/app/actions/dealer.actions";
import { buildVehicleTitle } from "@/lib/helpers/vehicle";
import {
  formatPrice,
  formatNumber,
  formatRegistrationDate,
  formatEnumLabel,
} from "@/lib/helpers/format";
import { getImageUrl } from "@/lib/helpers/image";
import type { VehicleListItem } from "@/lib/schemas/vehicle.schema";
import { ListingProps } from "@/types";

function vehicleToListingProps(item: VehicleListItem): ListingProps {
  return {
    id: item.id,
    image: getImageUrl(item.images[0]),
    badge: item.vehicleCondition
      ? formatEnumLabel(item.vehicleCondition)
      : undefined,
    title: buildVehicleTitle(item.make, item.model, item.version),
    price: formatPrice(item.price),
    details: [
      formatRegistrationDate(item.registrationMonth, item.registrationYear),
      `${formatNumber(item.kilometer)} km`,
      item.fuelType ? formatEnumLabel(item.fuelType) : "",
    ].filter(Boolean),
    garageName: item.dealer.companyName,
    garageId: item.dealer.id,
    garageLocation: [item.dealer.zipCode, item.dealer.city]
      .filter(Boolean)
      .join(" "),
  };
}

export default async function HomePage() {
  const [vehiclesResult, dealersResult] = await Promise.all([
    getVehicles({ pageSize: "12", sort: "created-desc" }),
    getDealers({ pageSize: 8 }),
  ]);

  const listings: ListingProps[] = vehiclesResult.vehicles.map(
    vehicleToListingProps,
  );

  const garages = dealersResult.dealers.map((d) => ({
    id: d.id,
    name: d.companyName,
    image: d.logo
      ? d.logo.startsWith("http")
        ? d.logo
        : getImageUrl(d.logo)
      : "/placeholder-car.jpg",
    garageLocation: d.address || d.city,
  }));

  return (
    <>
      <div className="bg-linear-to-r from-primary to-primary/80">
        <div className="w-full max-w-285 mx-auto px-4 py-12">
          <SearchForm />
        </div>
      </div>
      <FeaturedListings listings={listings} />
      <FeaturedGarage garages={garages} />
      <About />
    </>
  );
}
