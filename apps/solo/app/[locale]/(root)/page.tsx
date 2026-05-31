export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { buildMetadata, PAGE_META } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { SearchForm } from "./_components/search-form";
import { FeaturedListings } from "./_components/featured-listings";
import { About } from "./_components/about";
import { getVehicles } from "@/app/actions/vehicles.actions";
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
        item.fuelType ? tVehicle(`fuelTypes.${item.fuelType.toUpperCase()}`) : "",
      ].filter(Boolean),
      garageName: item.seller?.user?.name ?? "",
      garageId: item.seller?.id ?? item.id,
      garageLocation: [item.seller?.zipCode, item.seller?.city]
        .filter(Boolean)
        .join(" "),
    };
  }

  const listings: ListingProps[] = vehiclesResult.vehicles.map(
    vehicleToListingProps,
  );

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AutoSolo",
    url: "https://autosolo.ch",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `https://autosolo.ch/cars?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AutoSolo",
    url: "https://autosolo.ch",
    logo: "https://autosolo.ch/logo.svg",
    sameAs: ["https://autosolo.ch"],
    contactPoint: {
      "@type": "ContactPoint",
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
      <About />
    </>
  );
}
