import { notFound } from "next/navigation";
import { getDealer } from "@/app/actions/dealer.actions";
import { DealerForm } from "../../_components/dealer-form";

interface EditDealerPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditDealerPage({ params }: EditDealerPageProps) {
  const { id } = await params;
  const dealer = await getDealer(id);

  if (!dealer) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">Edit Dealer</h2>
        <p className="text-sm text-muted-foreground">
          Update the dealer information below.
        </p>
      </div>
      <DealerForm initialData={dealer} dealerId={dealer.id} />
    </div>
  );
}
