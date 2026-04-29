import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { prisma } from "@repo/db";
import { getVehicleSubscriptionStatus } from "@/app/actions/vehicles.actions";
import { getBillingData } from "@/app/actions/billing.actions";
import { getTranslations, getFormatter } from "next-intl/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Progress } from "@repo/ui/components/progress";
import { Separator } from "@repo/ui/components/separator";
import { Link } from "@/i18n/routing";
import { Button } from "@repo/ui/components/button";
import {
  CreditCard,
  ArrowUpRight,
  Download,
  Car,
  Receipt,
  ExternalLink,
} from "lucide-react";
import { ManageBillingButton } from "./_components/manage-billing-button";

const PLAN_PRICES: Record<string, number> = {
  bronze: 180,
  silver: 280,
  gold: 325,
  diamond: 408,
};

export default async function SubscriptionPage() {
  const t = await getTranslations("BillingPage");
  const format = await getFormatter();

  const session = await auth.api.getSession({ headers: await headers() });

  const [subscriptions, subscriptionStatus, billingData] = await Promise.all([
    prisma.subscription.findMany({
      where: { referenceId: session!.user.id },
      orderBy: { periodEnd: "desc" },
    }),
    getVehicleSubscriptionStatus(),
    getBillingData(),
  ]);

  const activeSubscription = subscriptions.find(
    (s) => s.status === "active" || s.status === "trialing",
  );

  const planName = activeSubscription?.plan?.toLowerCase() ?? "";
  const planPrice = PLAN_PRICES[planName] ?? null;

  return (
    <div className="max-w-4xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>{t("planTitle")}</CardTitle>
          <CardDescription>{t("planDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {activeSubscription ? (
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold capitalize">
                    {activeSubscription.plan} Plan
                  </p>
                  <Badge className="bg-green-500 hover:bg-green-600">
                    {activeSubscription.status === "trialing"
                      ? t("statusTrialing")
                      : t("statusActive")}
                  </Badge>
                </div>
                {planPrice && (
                  <p className="text-sm text-muted-foreground">
                    {t("planPrice", {
                      price: format.number(planPrice, {
                        style: "currency",
                        currency: "CHF",
                        minimumFractionDigits: 0,
                      }),
                    })}
                  </p>
                )}
                {activeSubscription.cancelAtPeriodEnd ? (
                  <p className="text-sm text-destructive">
                    {t("cancelAtPeriodEnd")}
                    {activeSubscription.periodEnd &&
                      ` ${format.dateTime(activeSubscription.periodEnd, { day: "2-digit", month: "2-digit", year: "numeric" })}`}
                  </p>
                ) : activeSubscription.periodEnd ? (
                  <p className="text-sm text-muted-foreground">
                    {t("nextBilling", {
                      date: format.dateTime(activeSubscription.periodEnd, {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      }),
                    })}
                  </p>
                ) : null}
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/pricing">
                  {t("upgradePlan")}
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">{t("noSubscription")}</p>
              <Button asChild size="sm">
                <Link href="/pricing">{t("choosePlan")}</Link>
              </Button>
            </div>
          )}

          <Separator />

          {/* Usage */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Car className="size-4 text-muted-foreground" />
              <p className="font-medium">{t("usageTitle")}</p>
            </div>
            {subscriptionStatus.type !== "no_subscription" ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("listings")}</span>
                  <span className="font-medium">
                    {t("quotaUsed", {
                      current: subscriptionStatus.currentCount,
                      max: subscriptionStatus.maxVehicles,
                    })}
                  </span>
                </div>
                <Progress
                  value={
                    subscriptionStatus.maxVehicles > 0
                      ? (subscriptionStatus.currentCount /
                          subscriptionStatus.maxVehicles) *
                        100
                      : 0
                  }
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {t("quotaRemaining", {
                    remaining: subscriptionStatus.remainingQuota,
                  })}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("noUsage")}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("paymentTitle")}</CardTitle>
              <CardDescription>{t("paymentDesc")}</CardDescription>
            </div>
            {activeSubscription && (
              <ManageBillingButton label={t("updatePayment")} />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {billingData.paymentMethod ? (
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
              <CreditCard className="size-8 text-muted-foreground" />
              <div className="space-y-0.5">
                <p className="font-medium capitalize">
                  {billingData.paymentMethod.brand} •••• {billingData.paymentMethod.last4}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("cardExpiry", {
                    month: String(billingData.paymentMethod.expMonth).padStart(2, "0"),
                    year: billingData.paymentMethod.expYear,
                  })}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("noPaymentMethod")}</p>
          )}
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("invoicesTitle")}</CardTitle>
              <CardDescription>{t("invoicesDesc")}</CardDescription>
            </div>
            {activeSubscription && (
              <ManageBillingButton label={t("viewAllInvoices")} variant="outline" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {billingData.invoices.length > 0 ? (
            <div className="divide-y">
              {billingData.invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <Receipt className="size-4 text-muted-foreground shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">
                        {invoice.number ?? invoice.id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format.dateTime(new Date(invoice.date * 1000), {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {format.number(invoice.amount / 100, {
                          style: "currency",
                          currency: invoice.currency.toUpperCase(),
                          minimumFractionDigits: 2,
                        })}
                      </p>
                      <Badge
                        variant={invoice.status === "paid" ? "default" : "destructive"}
                        className={`text-xs ${invoice.status === "paid" ? "bg-green-500 hover:bg-green-600" : ""}`}
                      >
                        {t(`invoiceStatus.${invoice.status}`)}
                      </Badge>
                    </div>
                    {invoice.pdfUrl && (
                      <a
                        href={invoice.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Download className="size-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("noInvoices")}</p>
          )}
        </CardContent>
      </Card>

      {/* Manage Billing */}
      {activeSubscription && (
        <Card>
          <CardHeader>
            <CardTitle>{t("portalTitle")}</CardTitle>
            <CardDescription>{t("portalDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ManageBillingButton
              label={t("openPortal")}
              icon={<ExternalLink className="size-4" />}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
