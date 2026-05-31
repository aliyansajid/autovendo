import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { getDealerProfile } from "@/app/actions/dealer.actions";
import { getSubscriptionStatusFromApi } from "@/lib/api/vehicles";
import { getDealerVehicleById } from "@/lib/api/dealer-vehicles";
import { VehicleForm } from "../_components/vehicle-form";
import { mapVehicleToForm } from "@/lib/helpers/vehicle";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@repo/ui/src/components/button";

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations("EditVehiclePage");
  const { id } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const [dealerProfile, vehicle, subscriptionStatus] = await Promise.all([
    session?.user?.id ? getDealerProfile() : null,
    getDealerVehicleById(id),
    getSubscriptionStatusFromApi(),
  ]);

  if (!vehicle) {
    notFound();
  }

  const initialData = mapVehicleToForm(vehicle);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 items-start">
        <Button variant={"link"} asChild>
          <Link href="/dashboard/vehicles">
            <ArrowLeft />
            {t("back")}
          </Link>
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>
      <VehicleForm
        dealerProfile={dealerProfile}
        initialData={initialData}
        vehicleId={id}
        subscriptionStatus={subscriptionStatus}
      />
    </div>
  );
}
