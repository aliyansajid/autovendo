import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { getSellerProfile } from "@/app/actions/seller.actions";
import { getVehicleSubscriptionStatus } from "@/app/actions/vehicles.actions";
import { VehicleForm } from "../_components/vehicle-form";
import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function AddNewVehiclePage() {
  const t = await getTranslations("NewVehiclePage");
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const [sellerProfile, subscriptionStatus] = await Promise.all([
    session?.user?.id ? getSellerProfile() : null,
    getVehicleSubscriptionStatus(),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <Link
          href="/dashboard/vehicles"
          className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("back")}
        </Link>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>
      <VehicleForm
        sellerProfile={sellerProfile}
        subscriptionStatus={subscriptionStatus}
      />
    </div>
  );
}
