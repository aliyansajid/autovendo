import { getDealerProfileFromApi } from "@/lib/api/dealers";
import { getSubscriptionStatusFromApi } from "@/lib/api/vehicles";
import { getDealerVehicleById } from "@/lib/api/dealer-vehicles";
import { VehicleForm } from "../_components/vehicle-form";
import { mapVehicleToForm } from "@repo/ui/lib/helpers/vehicle";
import { notFound } from "next/navigation";
import { Link, redirect } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@repo/ui/src/components/button";

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const t = await getTranslations("EditVehiclePage");
  const { id, locale } = await params;
  const [dealerProfile, vehicle, subscriptionStatus] = await Promise.all([
    getDealerProfileFromApi(),
    getDealerVehicleById(id),
    getSubscriptionStatusFromApi(),
  ]);

  const isBlocked = ["no_subscription", "expired", "past_due"].includes(
    subscriptionStatus.type,
  );
  if (isBlocked) {
    redirect({ href: "/dealer/vehicles", locale });
  }

  if (!vehicle) {
    notFound();
  }

  const initialData = mapVehicleToForm(vehicle);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 items-start">
        <Button variant={"link"} asChild>
          <Link href="/dealer/vehicles">
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
