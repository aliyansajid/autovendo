import { Button } from "@repo/ui/components/button";
import { Plus, AlertCircleIcon } from "lucide-react";
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

/**
 * Vehicles Inventory Page
 * 
 * Displays the list of vehicles owned by the dealer.
 * Implements a subscription guard that:
 * 1. Alerts users if they lack an active subscription
 * 2. Blocks new listings if the quota is exhausted
 */
export default async function VehiclesPage(props: {
  params: Promise<{ locale: string }>;
}) {
  // Extract locale and initialize translations
  const { locale } = await props.params;
  const t = await getTranslations("VehiclesPage");

  /**
   * Data Fetching
   * Fetches the dealer's vehicles and their current subscription quota status in parallel
   */
  const [vehicles, subscriptionStatus] = await Promise.all([
    getDealerVehicles(),
    getVehicleSubscriptionStatus(),
  ]);

  /**
   * Subscription Logic
   * Determine if the user is prevented from creating new listings
   */
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
              : t("expiredDescription")}
          </AlertDescription>
          <AlertAction>
            <Button size="xs" variant="outline" asChild>
              <Link href="/dashboard/subscription" locale={locale}>
                {t("subscribeNow")}
              </Link>
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
              <Link href="/dashboard/subscription" locale={locale}>
                {t("upgradePlan")}
              </Link>
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
            <Link href="/dashboard/vehicles/new" locale={locale}>
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
