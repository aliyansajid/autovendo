import { Button } from "@repo/ui/components/button";
import { Plus, AlertCircle } from "lucide-react";
import { Link } from "@/i18n/routing";
import { getDealerVehicles, getVehicleSubscriptionStatus } from "@/app/actions/vehicles.actions";
import { VehicleList } from "./_components/vehicle-list";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@repo/ui/components/alert";
import { getTranslations } from "next-intl/server";

export default async function VehiclesPage() {
  const t = await getTranslations("VehiclesPage");

  const [vehicles, subscriptionStatus] = await Promise.all([
    getDealerVehicles(),
    getVehicleSubscriptionStatus(),
  ]);

  const isBlocked =
    subscriptionStatus.type === "no_subscription" ||
    subscriptionStatus.type === "quota_exhausted" ||
    subscriptionStatus.type === "expired";

  return (
    <div className="space-y-6">
      {/* No subscription or expired */}
      {(subscriptionStatus.type === "no_subscription" ||
        subscriptionStatus.type === "expired") && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>{t("noSubTitle")}</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>
              {subscriptionStatus.type === "no_subscription"
                ? t("noSubDescription")
                : t("expiredGraceDescription")}
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/subscription">
                {t("subscribeNow")}
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Quota exhausted */}
      {subscriptionStatus.type === "quota_exhausted" && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>{t("quotaTitle")}</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>
              {t("quotaDescription", {
                plan: subscriptionStatus.plan,
                current: subscriptionStatus.currentCount,
                max: subscriptionStatus.maxVehicles,
              })}
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/subscription">
                {t("upgradePlan")}
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{t("pageTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("pageSubtitle")}</p>
        </div>

        {isBlocked ? (
          <Button disabled>
            <Plus className="mr-2 size-4" />
            {t("newListing")}
          </Button>
        ) : (
          <Button asChild>
            <Link href="/dashboard/vehicles/new">
              <Plus className="mr-2 size-4" />
              {t("newListing")}
            </Link>
          </Button>
        )}
      </div>

      <VehicleList
        vehicles={vehicles as any}
        subscriptionStatus={subscriptionStatus}
      />
    </div>
  );
}
