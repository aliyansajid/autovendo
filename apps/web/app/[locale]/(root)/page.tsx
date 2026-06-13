import type { Metadata } from "next";
import { buildMetadata, PAGE_META } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { SearchForm } from "./_components/search-form";
import { FeaturedListings } from "./_components/featured-listings";
import { FeaturedGarage } from "./_components/featured-garage";
import { About } from "./_components/about";
import { getVehiclesFromApi } from "@/lib/api/vehicles";
import { getDealersFromApi } from "@/lib/api/dealers";
import { buildVehicleTitle } from "@repo/ui/lib/helpers/vehicle";
import {
  formatPrice,
  formatNumber,
  formatRegistrationDate,
} from "@repo/ui/lib/helpers/format";
import { getImageUrl } from "@repo/ui/lib/helpers/image";
import type { VehicleListItem, ListingProps } from "@/types/vehicle";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  return buildMetadata(locale, "", PAGE_META.home);
}

export default async function HomePage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;

  const [vehiclesResult, dealersResult, tVehicle, tCard] = await Promise.all([
    getVehiclesFromApi({ pageSize: "12", sort: "created-desc" }).catch(() => ({
      vehicles: [],
      total: 0,
      page: 1,
      pageSize: 12,
      totalPages: 0,
    })),
    getDealersFromApi({ pageSize: 8 }),
    getTranslations("Vehicle"),
    getTranslations("ListingListCard"),
  ]);

  function vehicleToListingProps(item: VehicleListItem): ListingProps {
    return {
      id: item.id,
      image: getImageUrl(item.images[0]),
      badge: item.vehicleCondition
        ? tVehicle(`conditions.${item.vehicleCondition.toUpperCase()}`)
        : undefined,
      title: buildVehicleTitle(item.make, item.model, item.version),
      price: formatPrice(item.price),
      details: [
        formatRegistrationDate(item.registrationMonth, item.registrationYear),
        `${formatNumber(item.kilometer)} km`,
        item.fuelType
          ? tVehicle(`fuelTypes.${item.fuelType.toUpperCase()}`)
          : "",
      ].filter(Boolean),
      garageName: item.dealer?.companyName ?? tCard("privateSeller"),
      garageId: item.dealer?.id ?? item.seller?.id ?? "",
      garageLocation: [
        item.dealer?.zipCode ?? item.seller?.zipCode,
        item.dealer?.city ?? item.seller?.city,
      ]
        .filter(Boolean)
        .join(" "),
    };
  }

  const listings: ListingProps[] = vehiclesResult.vehicles.map(
    vehicleToListingProps,
  );

  const garages = dealersResult.dealers.map((d) => ({
    id: d.id,
    name: d.companyName,
    image: d.coverImage
      ? getImageUrl(d.coverImage)
      : d.logo
        ? getImageUrl(d.logo)
        : "/placeholder-car.jpg",
    garageLocation: d.streetAddress || d.city,
  }));

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AutoVendo",
    url: "https://autovendo.ch",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `https://autovendo.ch/${locale}/cars?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AutoVendo",
    url: "https://autovendo.ch",
    logo: "https://autovendo.ch/logo.svg",
    sameAs: ["https://autovendo.ch"],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+41793223520",
      contactType: "customer service",
      availableLanguage: ["German", "French", "Italian", "English"],
    },
  };

  return (
    <>
      <JsonLd data={websiteSchema} />
      <JsonLd data={organizationSchema} />
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
