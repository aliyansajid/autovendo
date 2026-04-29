import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { prisma } from "@repo/db";
import { getVehicleSubscriptionStatus } from "@/app/actions/vehicles.actions";
import { getBillingData } from "@/app/actions/billing.actions";
import { getTranslations, getFormatter } from "next-intl/server";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Progress } from "@repo/ui/components/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { CreditCard, ExternalLink, Download, Receipt, CheckCircle2 } from "lucide-react";
import { BillingPortalButton } from "./_components/billing-portal-button";
import { SubscribeButton } from "@/app/[locale]/(root)/pricing/_components/subscribe-button";

const PLANS = [
  { name: "Bronze", key: "bronze", price: 180, listings: 5 },
  { name: "Silver", key: "silver", price: 280, listings: 10 },
  { name: "Gold", key: "gold", price: 325, listings: 15, popular: true },
  { name: "Diamond", key: "diamond", price: 408, listings: 25 },
] as const;

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

  const currentPlanKey = activeSubscription?.plan?.toLowerCase() ?? null;
  const currentPlan = PLANS.find((p) => p.key === currentPlanKey) ?? null;

  const quotaPct =
    subscriptionStatus.maxVehicles > 0
      ? (subscriptionStatus.currentCount / subscriptionStatus.maxVehicles) * 100
      : 0;

  const hasAnySubscription = subscriptions.length > 0;
  const showPlanCards = true; // always show plan selection/upgrade section

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Current Plan + Usage */}
      {activeSubscription && currentPlan ? (
        <div className="rounded-lg border divide-y">
          <div className="p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold capitalize">{currentPlan.name} Plan</h2>
                <Badge className="bg-green-500 hover:bg-green-600">
                  {activeSubscription.status === "trialing"
                    ? t("statusTrialing")
                    : t("statusActive")}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {format.number(currentPlan.price, {
                  style: "currency",
                  currency: "CHF",
                  minimumFractionDigits: 0,
                })}{" "}
                / {t("month")}
                {activeSubscription.periodEnd && (
                  <span>
                    {" · "}
                    {t("nextBilling", {
                      date: format.dateTime(activeSubscription.periodEnd, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }),
                    })}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t("listings")}</span>
              <span className="font-medium">
                {subscriptionStatus.currentCount} / {subscriptionStatus.maxVehicles}
              </span>
            </div>
            <Progress value={quotaPct} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {t("slotsRemaining", { count: subscriptionStatus.remainingQuota })}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center space-y-2">
          <p className="font-semibold">{t("noSubscription")}</p>
          <p className="text-sm text-muted-foreground">{t("noSubscriptionDesc")}</p>
        </div>
      )}

      {/* Plan Cards — upgrade or subscribe */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold">
            {activeSubscription ? t("upgradePlanTitle") : t("selectPlanTitle")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {activeSubscription ? t("upgradePlanSubtitle") : t("selectPlanSubtitle")}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan) => {
            const isCurrent = plan.key === currentPlanKey;
            return (
              <div
                key={plan.key}
                className={`rounded-lg border p-5 flex flex-col gap-4 ${
                  isCurrent ? "border-primary bg-primary/5" : ""
                } ${plan.popular && !isCurrent ? "border-primary/50" : ""}`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base">{plan.name}</span>
                    {isCurrent && (
                      <Badge variant="outline" className="text-xs border-primary text-primary">
                        {t("currentPlan")}
                      </Badge>
                    )}
                    {plan.popular && !isCurrent && (
                      <Badge className="text-xs">Popular</Badge>
                    )}
                  </div>
                  <p className="text-2xl font-bold">
                    CHF {plan.price}
                    <span className="text-sm font-normal text-muted-foreground">/{t("month")}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="size-4 text-primary shrink-0" />
                  {t("listingsCount", { count: plan.listings })}
                </div>
                {isCurrent ? (
                  <Button variant="outline" className="w-full" disabled>
                    {t("currentPlan")}
                  </Button>
                ) : (
                  <SubscribeButton
                    planName={plan.name}
                    variant={plan.popular ? "default" : "outline"}
                    successUrl={`/dashboard/subscription`}
                    cancelUrl={`/dashboard/subscription`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Billing Portal */}
      {hasAnySubscription && (
        <div className="rounded-lg border p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="font-semibold">{t("billingPortalTitle")}</p>
            <p className="text-sm text-muted-foreground">{t("billingPortalDesc")}</p>
          </div>
          <div className="shrink-0">
            <BillingPortalButton />
          </div>
        </div>
      )}

      {/* Payment Method */}
      <div className="rounded-lg border p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="font-semibold">{t("paymentTitle")}</p>
          <p className="text-sm text-muted-foreground">{t("paymentDesc")}</p>
        </div>
        {billingData.paymentMethod ? (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md border bg-muted/50">
              <CreditCard className="size-5 text-muted-foreground" />
            </div>
            <div>
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
      </div>

      {/* Invoices */}
      <div className="rounded-lg border">
        <div className="px-6 py-4 border-b">
          <p className="font-semibold">{t("invoicesTitle")}</p>
          <p className="text-sm text-muted-foreground">{t("invoicesDesc")}</p>
        </div>
        {billingData.invoices.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("invoiceCol.number")}</TableHead>
                <TableHead>{t("invoiceCol.date")}</TableHead>
                <TableHead>{t("invoiceCol.amount")}</TableHead>
                <TableHead>{t("invoiceCol.status")}</TableHead>
                <TableHead className="text-right">{t("invoiceCol.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billingData.invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Receipt className="size-4 text-muted-foreground" />
                      {invoice.number ?? `#${invoice.id.slice(-8).toUpperCase()}`}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format.dateTime(new Date(invoice.date * 1000), {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    {format.number(invoice.amount / 100, {
                      style: "currency",
                      currency: invoice.currency.toUpperCase(),
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        invoice.status === "paid"
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-destructive"
                      }
                    >
                      {t(`invoiceStatus.${invoice.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {invoice.hostedUrl && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={invoice.hostedUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="size-4 mr-1" />
                            {t("view")}
                          </a>
                        </Button>
                      )}
                      {invoice.pdfUrl && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="size-4" />
                            <span className="sr-only">{t("download")}</span>
                          </a>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">
            {t("noInvoices")}
          </div>
        )}
      </div>
    </div>
  );
}
