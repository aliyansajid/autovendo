import { getDealerById } from "@/app/actions/dealer.actions";
import { notFound } from "next/navigation";
import { DealerDetailContent } from "./_components/dealer-detail-content";

interface DealerPageParams {
  id: string;
}

export default async function DealerPage({
  params,
}: {
  params: DealerPageParams;
}) {
  const dealer = await getDealerById(params.id);

  if (!dealer) {
    notFound();
  }

  return <DealerDetailContent dealer={dealer} />;
}
