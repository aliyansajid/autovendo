import type { Metadata } from "next";
import { buildAlternates } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { getImageUrl } from "@repo/ui/lib/helpers/image";
import {
  getDealerByIdFromApi,
  getDealerVehiclesFromApi,
  getDealerGoogleReviewsFromApi,
} from "@/lib/api/dealers";
import { notFound } from "next/navigation";
import { DealerDetailContent } from "../_components/dealer-detail-content";
import { parseSearchParams } from "@repo/ui/lib/helpers/vehicle";
import { createVehicleSearchSchema } from "@/schema/vehicle-search-schema";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}): Promise<Metadata> {
  const { id, locale } = await params;
  const dealer = await getDealerByIdFromApi(id);
  if (!dealer) return {};

  const location = [dealer.zipCode, dealer.city].filter(Boolean).join(" ");
  const title = `${dealer.companyName}${location ? ` – ${location}` : ""} | AutoVendo`;
  const description = `${dealer.companyName} in ${dealer.city ?? "der Schweiz"}: Gebrauchtwagen und Occasionen kaufen. Alle Inserate und Kontakt auf autovendo.ch.`;
  const ogImage = dealer.logo
    ? getImageUrl(dealer.logo)
    : "/web-app-manifest-512x512.png";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: ogImage, width: 512, height: 512, alt: dealer.companyName }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    alternates: buildAlternates(locale, `/dealers/${id}`),
  };
}

export default async function DealerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [{ id, locale }, sp] = await Promise.all([params, searchParams]);

  const parsedFilters = parseSearchParams(sp);
  const t_schema = await getTranslations("VehicleSearchSchema");
  const schema = createVehicleSearchSchema(t_schema);
  const filters = schema.parse(parsedFilters);
  const dealer = await getDealerByIdFromApi(id);

  if (!dealer) {
    notFound();
  }

  const [initialVehicles, googleData] = await Promise.all([
    getDealerVehiclesFromApi(dealer.id, 1, 12, filters),
    getDealerGoogleReviewsFromApi(dealer.id),
  ]);

  const dealerSchema = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: dealer.companyName,
    url: dealer.website ?? `https://autovendo.ch/${locale}/dealers/${dealer.id}`,
    telephone: dealer.phoneNumber ?? undefined,
    description: dealer.description ?? undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: dealer.streetAddress ?? undefined,
      postalCode: dealer.zipCode ?? undefined,
      addressLocality: dealer.city ?? undefined,
      addressCountry: "CH",
    },
    sameAs: dealer.website ? [dealer.website] : undefined,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "AutoVendo",
        item: `https://autovendo.ch/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name:
          locale === "fr"
            ? "Concessionnaires"
            : locale === "it"
              ? "Concessionari"
              : "Händler",
        item: `https://autovendo.ch/${locale}/dealers`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: dealer.companyName,
        item: `https://autovendo.ch/${locale}/dealers/${dealer.id}`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={dealerSchema} />
      <JsonLd data={breadcrumbSchema} />
      <DealerDetailContent
        dealer={dealer}
        initialVehicles={initialVehicles}
        googleData={googleData}
        initialFilters={filters}
      />
    </>
  );
}
