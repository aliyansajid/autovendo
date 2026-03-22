import {
  getDealerById,
  getDealerVehicles,
  getDealerGoogleReviews,
} from "@/app/actions/dealer.actions";
import { notFound } from "next/navigation";
import { DealerDetailContent } from "../_components/dealer-detail-content";
import { parseSearchParams } from "@/lib/helpers/vehicle";
import { VehicleSearchSchema } from "@/lib/schemas/vehicle.schema";

export default async function DealerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);

  const parsedFilters = parseSearchParams(sp);
  const filters = VehicleSearchSchema.parse(parsedFilters);
  const dealer = await getDealerById(id);

  if (!dealer) {
    notFound();
  }

  const [initialVehicles, googleData] = await Promise.all([
    getDealerVehicles(dealer.id, 1, 12, filters),
    dealer.googlePlaceId
      ? getDealerGoogleReviews(dealer.googlePlaceId)
      : Promise.resolve(null),
  ]);

  return (
    <DealerDetailContent
      dealer={dealer}
      initialVehicles={initialVehicles}
      googleData={googleData}
      initialFilters={filters}
    />
  );
}
