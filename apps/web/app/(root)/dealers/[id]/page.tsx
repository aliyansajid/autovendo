import { getDealerById } from "@/app/actions/dealer-actions";
import { notFound } from "next/navigation";
import { DealerDetailContent } from "./_components/dealer-detail-content";

export default async function DealerPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const dealer = await getDealerById(params.id);

  if (!dealer) {
    notFound();
  }

  // Map phoneNumber to phone for compatibility with DealerDetailContent
  const dealerWithPhone = {
    ...dealer,
    phone: dealer.phoneNumber,
  };

  return <DealerDetailContent dealer={dealerWithPhone} />;
}
