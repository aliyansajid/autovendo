import { Button } from "@repo/ui/components/button";
import { Plus, AlertCircle, AlertTriangle } from "lucide-react";
import { Link } from "@/i18n/routing";
import { getSellerVehicles, getVehicleSubscriptionStatus } from "@/app/actions/vehicles.actions";
import { VehicleList } from "./_components/vehicle-list";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@repo/ui/components/alert";
import { getTranslations, getFormatter } from "next-intl/server";

export default async function VehiclesPage() {
  const t = await getTranslations("VehiclesPage");
  const format = await getFormatter();

  const [vehicles, subscriptionStatus] = await Promise.all([
    getSellerVehicles(),
    getVehicleSubscriptionStatus(),
  ]);

  const isBlocked =
    subscriptionStatus.type === "no_subscription" ||
    subscriptionStatus.type === "quota_exhausted" ||
    subscriptionStatus.type === "expired";

  return (
    <div className="space-y-6">
      {/* Grace period — subscription expired but still within 7 days */}
      {subscriptionStatus.type === "expired" &&
        !subscriptionStatus.isGraceExpired &&
        subscriptionStatus.graceEnd && (
          <Alert className="border-yellow-500 bg-yellow-50 text-yellow-900 dark:bg-yellow-950/20 dark:text-yellow-400 [&>svg]:text-yellow-500">
            <AlertTriangle />
            <AlertTitle>{t("expiredTitle")}</AlertTitle>
            <AlertDescription>
              {t("expiredGraceDescription")}{" "}
              <strong>
                {format.dateTime(new Date(subscriptionStatus.graceEnd), {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </strong>{" "}
              {t("expiredDescription", {
                date: format.dateTime(new Date(subscriptionStatus.graceEnd), {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                }),
              })}
            </AlertDescription>
          </Alert>
        )}

      {/* No subscription or grace period has expired */}
      {(subscriptionStatus.type === "no_subscription" ||
        (subscriptionStatus.type === "expired" &&
          subscriptionStatus.isGraceExpired)) && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>{t("noSubTitle")}</AlertTitle>
          <AlertDescription>
            {subscriptionStatus.type === "no_subscription"
              ? t("noSubDescription")
              : t("expiredDescription", {
                  date: subscriptionStatus.graceEnd
                     ? format.dateTime(
                         new Date(subscriptionStatus.graceEnd),
                         {
                           day: "2-digit",
                           month: "2-digit",
                           year: "numeric",
                         },
                       )
                    : "",
                })}
          </AlertDescription>
        </Alert>
      )}

      {/* Quota exhausted */}
      {subscriptionStatus.type === "quota_exhausted" && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>{t("quotaTitle")}</AlertTitle>
          <AlertDescription>
            {t("quotaDescription", {
              plan: subscriptionStatus.plan,
              current: subscriptionStatus.currentCount,
              max: subscriptionStatus.maxVehicles,
            })}
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
