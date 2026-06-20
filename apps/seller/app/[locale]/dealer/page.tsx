import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Progress } from "@repo/ui/components/progress";
import {
  Car,
  CheckCircle2,
  FileText,
  LayoutDashboard,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { getSubscriptionStatusFromApi, getDashboardSummaryFromApi, getPlansFromApi, getActiveSubscriptionsFromApi } from "@/lib/api/vehicles";
import { SubscriptionCard } from "./subscription/_components/subscription-card";
import { getTranslations } from "next-intl/server";
import {
  formatPrice,
  formatDateShort,
  formatNumber,
} from "@repo/ui/lib/helpers/format";
import { Link } from "@/i18n/routing";
import { Button } from "@repo/ui/components/button";
import Image from "next/image";
import { getImageUrl } from "@repo/ui/lib/helpers/image";

export default async function DashboardPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const t = await getTranslations("DashboardPage");

  const [subscriptionStatus, summary, plans, subscriptions] = await Promise.all([
    getSubscriptionStatusFromApi(),
    getDashboardSummaryFromApi(),
    getPlansFromApi(),
    getActiveSubscriptionsFromApi(),
  ]);

  const currentPlan = plans.find(
    (p) => p.name.toLowerCase() === subscriptionStatus.plan?.toLowerCase(),
  );

  const quotaPct =
    subscriptionStatus.maxVehicles > 0
      ? (subscriptionStatus.currentCount / subscriptionStatus.maxVehicles) * 100
      : 0;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{t("welcome")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button asChild>
          <Link href="/dealer/vehicles/new">
            <Plus />
            {t("newListing")}
          </Link>
        </Button>
      </div>

      {/* Critical Alerts */}
      {subscriptionStatus.type === "past_due" && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-start gap-3 text-destructive animate-in fade-in slide-in-from-top-4">
          <AlertCircle className="size-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">{t("paymentFailedTitle")}</p>
            <p className="text-sm opacity-90">{t("paymentFailedDesc")}</p>
            <Button size="sm" variant="destructive" asChild className="mt-2">
              <Link href="/dealer/subscription">{t("fixPayment")}</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t("totalVehicles")}
          value={summary.totalCount}
          icon={<Car className="size-5" />}
          description={t("totalVehiclesDesc")}
          color="blue"
        />
        <StatCard
          title={t("published")}
          value={summary.publishedCount}
          icon={<TrendingUp className="size-5" />}
          description={t("publishedDesc")}
          color="green"
        />
        <StatCard
          title={t("drafts")}
          value={summary.draftCount}
          icon={<FileText className="size-5" />}
          description={t("draftsDesc")}
          color="amber"
        />
        <StatCard
          title={t("sold")}
          value={summary.soldCount}
          icon={<CheckCircle2 className="size-5" />}
          description={t("soldDesc")}
          color="purple"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <LayoutDashboard className="size-5 text-primary" />
                  {t("planOverview")}
                </CardTitle>
                {subscriptionStatus.type !== "no_subscription" && (
                  <Badge
                    className={
                      subscriptionStatus.type === "active"
                        ? "bg-green-500 hover:bg-green-600 border-0"
                        : "bg-destructive border-0 text-white"
                    }
                  >
                    {subscriptionStatus.type.toUpperCase()}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">
                    {t("currentPlan")}
                  </p>
                  <p className="text-2xl font-bold">
                    {currentPlan?.name || "No Active Plan"}
                  </p>
                </div>
                <div className="text-right sm:text-left">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">
                    {t("price")}
                  </p>
                  <p className="text-2xl font-bold">
                    {formatPrice(currentPlan?.price || 0)}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      / {t("month")}
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>{t("listingQuota")}</span>
                  <span>
                    {summary.publishedCount} / {subscriptionStatus.maxVehicles}
                  </span>
                </div>
                <Progress value={quotaPct} className="h-3 rounded-full" />
                <p className="text-xs text-muted-foreground text-right italic">
                  {t("remainingSlots", {
                    count: subscriptionStatus.remainingQuota,
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{t("recentListings")}</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link
                    href="/dealer/vehicles"
                    className="flex items-center"
                  >
                    {t("viewAll")}
                    <ArrowRight />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {summary.recentVehicles.length > 0 ? (
                <div className="divide-y">
                  {summary.recentVehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative size-12 rounded-md overflow-hidden bg-muted shrink-0 border">
                          {vehicle.images?.[0] ? (
                            <Image
                              src={getImageUrl(vehicle.images[0])}
                              alt={vehicle.make}
                              fill
                              className="object-cover transition-transform group-hover:scale-110"
                            />
                          ) : (
                            <Car className="size-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground/30" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {vehicle.make} {vehicle.model}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateShort(
                              new Date(vehicle.createdAt),
                              locale,
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatPrice(vehicle.price)}
                        </p>
                        <Badge variant="secondary">{vehicle.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center border-2 border-dashed rounded-lg bg-muted/20">
                  <Car className="size-10 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {t("noRecentVehicles")}
                  </p>
                  <Button variant="outline" size="sm" asChild className="mt-4">
                    <Link href="/dealer/vehicles/new">
                      {t("addFirstVehicle")}
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar / Quick Actions (1/3) */}
        <div className="space-y-6">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-lg">{t("quickActions")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="secondary"
                className="w-full justify-start"
                asChild
              >
                <Link href="/dealer/vehicles/new">
                  <Plus />
                  {t("newListing")}
                </Link>
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                asChild
              >
                <Link href="/dealer/vehicles">
                  <Car />
                  {t("manageInventory")}
                </Link>
              </Button>
            </CardContent>
          </Card>

          <SubscriptionCard
            subscriptions={subscriptions}
            currentCount={subscriptionStatus.currentCount}
            maxVehicles={subscriptionStatus.maxVehicles}
            hasSubscription={subscriptions.length > 0}
          />

          {/* Need Help? */}
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="text-center space-y-3">
              <div className="bg-primary/10 size-12 rounded-full flex items-center justify-center mx-auto">
                <LayoutDashboard className="size-6 text-primary" />
              </div>
              <p className="font-semibold">{t("needHelp")}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("helpDesc")}
              </p>
              <Button variant="link" size="sm" className="text-primary" asChild>
                <a href="mailto:support@autovendo.ch">{t("contactSupport")}</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/**
 * Reusable Stat Card Component
 */
function StatCard({
  title,
  value,
  icon,
  description,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
  color: "blue" | "green" | "amber" | "purple";
}) {
  const colorMap = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    green: "text-green-600 bg-green-50 border-green-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    purple: "text-purple-600 bg-purple-50 border-purple-100",
  };

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-lg border ${colorMap[color]}`}>
            {icon}
          </div>
          <span className="text-2xl font-bold tracking-tight">
            {formatNumber(value)}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-xs text-muted-foreground/60 mt-0.5 line-clamp-1">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
