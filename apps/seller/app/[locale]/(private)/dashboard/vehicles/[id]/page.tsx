import { VehicleForm } from "../_components/vehicle-form";
import { mapVehicleToForm } from "@repo/ui/lib/helpers/vehicle";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@repo/ui/src/components/button";
import { getMyVehicleByIdFromApi, getSellerProfile } from "@/lib/api/vehicles";

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations("EditVehiclePage");
  const { id } = await params;

  const [sellerProfile, vehicle] = await Promise.all([
    getSellerProfile(),
    getMyVehicleByIdFromApi(id),
  ]);

  // getMyVehicleByIdFromApi returns null only on 404; other errors throw and propagate
  if (vehicle === null) {
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
        sellerProfile={sellerProfile}
        initialData={initialData}
        vehicleId={id}
        isPaid={!!vehicle.listingPaidAt}
        listingPlan={(vehicle.listingPlan as "standard" | "best_value") || undefined}
      />
    </div>
  );
}
