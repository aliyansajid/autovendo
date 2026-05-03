import { auth } from "@repo/auth";
import { headers } from "next/headers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Progress } from "@repo/ui/components/progress";
import { Car, CreditCard, Users } from "lucide-react";
import { getVehicleSubscriptionStatus } from "@/app/actions/vehicles.actions";
import { getTranslations } from "next-intl/server";
import { formatNumber, formatCount } from "@/lib/helpers/format";

/**
 * Dashboard Overview Page
 *
 * Provides a high-level summary of the dealer's account, including:
 * - Active subscription status and plan details
 * - Vehicle listing quota usage
 * - Recent activity and quick access links
 */
export default async function DashboardPage() {
  // Initialize translations and formatting helpers
  const t = await getTranslations("DashboardPage");

  // Fetch the current session to identify the user
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  /**
   * Data Fetching Phase
   * We fetch both the raw subscription data from the Stripe plugin
   * and our own calculated vehicle subscription status (quota check).
   */
  // @ts-ignore - subscription is added by the stripe plugin
  const subscriptionApi = (auth.api as any).subscription;
  const [subscriptionsResponse, subscriptionStatus] = await Promise.all([
    subscriptionApi
      ? subscriptionApi.list({ headers: await headers() })
      : Promise.resolve({ data: [] }),
    getVehicleSubscriptionStatus(),
  ]);

  // Extract the primary active subscription (if any)
  const subscriptions = subscriptionsResponse?.data || [];
  const activeSubscription = subscriptions.find(
    (sub: any) => sub.status === "active" || sub.status === "trialing",
  );

  return (
    <div className="space-y-6">
      {/* Welcome Header Section */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">
          {t("welcomeTitle", { name: session!.user.name })}
        </h1>
        <p className="text-sm text-muted-foreground">{t("welcomeSubtitle")}</p>
      </div>

      {/* Main Stats Grid: Subscription, Vehicles, and Analytics */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Subscription Card: Displays current plan and status badge */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {t("activePlan")}
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {activeSubscription
                ? t("planLabel", { plan: activeSubscription.plan })
                : t("noSubscription")}
            </div>
            {activeSubscription && (
              <Badge className="mt-2 bg-green-500 hover:bg-green-600">
                {activeSubscription.status === "trialing"
                  ? t("statusTrialing")
                  : t("statusActive")}
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Vehicles Card: Displays current listing count vs. max quota */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {t("vehiclesTitle")}
            </CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">
              {formatNumber(subscriptionStatus.currentCount)}
            </div>
            {subscriptionStatus.type !== "no_subscription" ? (
              <>
                <Progress
                  value={
                    (subscriptionStatus.currentCount /
                      subscriptionStatus.maxVehicles) *
                    100
                  }
                  className="h-1.5"
                />
                <p className="text-xs text-muted-foreground">
                  {t("usedSlots", {
                    current: formatNumber(subscriptionStatus.currentCount),
                    max: formatNumber(subscriptionStatus.maxVehicles),
                  })}
                </p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                {t("postedVehicles")}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Visitors Card: Placeholder for future analytics integration */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {t("visitorsTitle")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCount(0)}</div>
            <p className="text-xs text-muted-foreground">
              {t("visitorsSubtitle")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity and Quick Access Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity: Historical log of changes/updates */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>{t("recentActivity")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground italic">
            {t("noActivity")}
          </CardContent>
        </Card>

        {/* Quick Access: Fast links to frequently used dashboard features */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>{t("quickAccess")}</CardTitle>
            <CardDescription>{t("frequentFeatures")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2"></CardContent>
        </Card>
      </div>
    </div>
  );
}
