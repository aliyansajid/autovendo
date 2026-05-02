import { Button } from "@repo/ui/components/button";
import { Plus, AlertCircle, AlertCircleIcon } from "lucide-react";
import { Link } from "@/i18n/routing";
import {
  getDealerVehicles,
  getVehicleSubscriptionStatus,
} from "@/app/actions/vehicles.actions";
import { VehicleList } from "./_components/vehicle-list";
import { getTranslations } from "next-intl/server";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@repo/ui/src/components/alert";

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
          <AlertCircleIcon />
          <AlertTitle>{t("noSubTitle")}</AlertTitle>
          <AlertDescription>
            {subscriptionStatus.type === "no_subscription"
              ? t("noSubDescription")
              : t("expiredGraceDescription")}
          </AlertDescription>
          <AlertAction>
            <Button size="xs" variant="outline" asChild>
              <Link href="/dashboard/subscription">{t("subscribeNow")}</Link>
            </Button>
          </AlertAction>
        </Alert>
      )}

      {/* Quota exhausted */}
      {subscriptionStatus.type === "quota_exhausted" && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>{t("quotaTitle")}</AlertTitle>
          <AlertDescription>
            {t("quotaDescription", {
              plan: subscriptionStatus.plan,
              current: subscriptionStatus.currentCount,
              max: subscriptionStatus.maxVehicles,
            })}
          </AlertDescription>
          <AlertAction>
            <Button size="xs" variant="outline" asChild>
              <Link href="/dashboard/subscription">{t("upgradePlan")}</Link>
            </Button>
          </AlertAction>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{t("pageTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("pageSubtitle")}</p>
        </div>

        {isBlocked ? (
          <Button disabled>
            <Plus />
            {t("newListing")}
          </Button>
        ) : (
          <Button asChild>
            <Link href="/dashboard/vehicles/new">
              <Plus />
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
