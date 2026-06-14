import { getDealerProfileFromApi } from "@/lib/api/dealers";
import { getSubscriptionStatusFromApi } from "@/lib/api/vehicles";
import { VehicleForm } from "../_components/vehicle-form";
import { Link, redirect } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@repo/ui/src/components/button";

export default async function AddNewVehiclePage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const t = await getTranslations("NewVehiclePage");
  const [dealerProfile, subscriptionStatus] = await Promise.all([
    getDealerProfileFromApi(),
    getSubscriptionStatusFromApi(),
  ]);

  const isBlocked =
    subscriptionStatus.type !== "active" &&
    subscriptionStatus.type !== "trialing";

  if (isBlocked) {
    redirect({ href: "/dealer/dashboard/vehicles", locale: locale });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 items-start">
        <Button variant={"link"} asChild>
          <Link href="/dealer/dashboard/vehicles">
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
        subscriptionStatus={subscriptionStatus}
      />
    </div>
  );
}
