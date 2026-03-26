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

export default async function DashboardPage() {
  const t = await getTranslations("DashboardPage");

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // @ts-ignore - subscription is added by the stripe plugin
  const subscriptionApi = (auth.api as any).subscription;
  const [subscriptionsResponse, subscriptionStatus] = await Promise.all([
    subscriptionApi
      ? subscriptionApi.list({ headers: await headers() })
      : Promise.resolve({ data: [] }),
    getVehicleSubscriptionStatus(),
  ]);

  const subscriptions = subscriptionsResponse?.data || [];
  const activeSubscription = subscriptions.find(
    (sub: any) => sub.status === "active" || sub.status === "trialing",
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">
          {t("welcomeTitle", { name: session!.user.name })}
        </h1>
        <p className="text-sm text-muted-foreground">{t("welcomeSubtitle")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("activePlan")}
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {activeSubscription
                ? `${activeSubscription.plan} Plan`
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("vehiclesTitle")}
            </CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">
              {subscriptionStatus.currentCount}
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
                    current: subscriptionStatus.currentCount,
                    max: subscriptionStatus.maxVehicles,
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("visitorsTitle")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              {t("visitorsSubtitle")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>{t("recentActivity")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground italic">
              {t("noActivity")}
            </p>
          </CardContent>
        </Card>

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
