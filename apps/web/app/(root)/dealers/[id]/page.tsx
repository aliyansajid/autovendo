import { getDealerById, getDealerVehicles, getDealerGoogleReviews } from "@/app/actions/dealer.actions";
import { notFound } from "next/navigation";
import { DealerDetailContent } from "../_components/dealer-detail-content";

interface DealerPageParams {
  id: string;
}

export default async function DealerPage({
  params,
}: {
  params: Promise<DealerPageParams>;
}) {
  const { id } = await params;
  const dealer = await getDealerById(id);

  if (!dealer) {
    notFound();
  }

  const [initialVehicles, googleData] = await Promise.all([
    getDealerVehicles(dealer.id, 1, 12),
    dealer.googlePlaceId
      ? getDealerGoogleReviews(dealer.googlePlaceId)
      : Promise.resolve(null),
  ]);

  return (
    <DealerDetailContent
      dealer={dealer}
      initialVehicles={initialVehicles}
      googleData={googleData}
    />
  );
}
