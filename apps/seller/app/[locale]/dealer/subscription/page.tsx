import { getDealerSubscriptionPageData } from "@/lib/api/vehicles";
import { getTranslations } from "next-intl/server";
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
import {
  CreditCard,
  ExternalLink,
  Download,
  Receipt,
  CheckCircle2,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@repo/ui/src/components/card";
import { BillingPortalButton } from "./_components/billing-portal-button";
import { SubscribeButton } from "./_components/subscribe-button";
import { SubscriptionActions } from "./_components/subscription-actions";
import {
  formatPrice,
  formatDateShort,
  formatCardNumber,
  formatCardExpiry,
} from "@repo/ui/lib/helpers/format";

/**
 * Subscription Management Page
 *
 * Handles the dealer's billing lifecycle:
 * - Displays active plan details and next billing date
 * - Shows current listing quota vs. plan limits
 * - Lists available upgrade/downgrade plans fetched from DB
 * - Lists payment history (invoices)
 */
export default async function SubscriptionPage(props: {
  params: Promise<{ locale: string }>;
}) {
  // Initialize translations
  const t = await getTranslations("BillingPage");

  // Extract locale from params (Next.js 15 Promise-based approach)
  const { locale } = await props.params;

  const {
    subscriptions,
    status: subscriptionStatus,
    billing: billingData,
    plans,
  } = await getDealerSubscriptionPageData();

  const activeSubscription = subscriptions.find((s) =>
    ["active", "trialing", "past_due", "unpaid", "incomplete"].includes(
      s.status,
    ),
  );

  const currentPlanKey = activeSubscription?.plan?.toLowerCase() ?? null;
  const currentPlan =
    plans.find((p) => p.name.toLowerCase() === currentPlanKey) ?? null;

  // Calculate quota using the robust subscriptionStatus action
  const maxVehicles = subscriptionStatus.maxVehicles;
  const currentCount = subscriptionStatus.currentCount;
  const quotaPct = maxVehicles > 0 ? (currentCount / maxVehicles) * 100 : 0;
  const remainingQuota = subscriptionStatus.remainingQuota;

  const hasAnySubscription = subscriptions.length > 0;

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "trialing":
        return {
          label: t("statusTrialing"),
          color: "bg-blue-500 hover:bg-blue-600",
        };
      case "past_due":
      case "unpaid":
        return {
          label: t("statusPastDue"),
          color: "bg-red-500 hover:bg-red-600",
        };
      case "incomplete":
        return {
          label: t("statusIncomplete"),
          color: "bg-yellow-500 hover:bg-yellow-600",
        };
      default:
        return {
          label: t("statusActive"),
          color: "bg-green-500 hover:bg-green-600",
        };
    }
  };

  const statusInfo = activeSubscription
    ? getStatusInfo(activeSubscription.status)
    : null;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Current Plan + Usage */}
      {activeSubscription ? (
        <div className="rounded-lg border divide-y overflow-hidden">
          {/* Status Banners */}
          {(activeSubscription.status === "past_due" ||
            activeSubscription.status === "unpaid") && (
            <div className="px-6 py-3 bg-red-500 text-white text-sm font-medium">
              {t("paymentFailedWarning")}
            </div>
          )}

          {activeSubscription.status === "trialing" &&
            activeSubscription.trialEnd && (
              <div className="px-6 py-3 bg-blue-500 text-white text-sm font-medium">
                {t("trialEndsAt", {
                  date: formatDateShort(activeSubscription.trialEnd, locale),
                })}
              </div>
            )}

          {(activeSubscription.cancelAtPeriodEnd ||
            activeSubscription.cancelAt) && (
            <div className="px-6 py-3 bg-destructive text-white text-sm font-medium">
              {t("cancelingAt", {
                date: formatDateShort(
                  activeSubscription.cancelAt || activeSubscription.periodEnd!,
                  locale,
                ),
              })}
            </div>
          )}

          <div className="p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold capitalize">
                  {t.has(
                    `plans.${(currentPlan?.name ?? activeSubscription.plan).toLowerCase()}`,
                  )
                    ? t(
                        `plans.${(currentPlan?.name ?? activeSubscription.plan).toLowerCase()}`,
                      )
                    : (currentPlan?.name ?? activeSubscription.plan)}{" "}
                  Plan
                </h2>
                <Badge className={statusInfo?.color}>{statusInfo?.label}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatPrice(currentPlan?.price || 0)} /{" "}
                {activeSubscription.billingInterval || t("month")}
                {activeSubscription.periodEnd && (
                  <span>
                    {" · "}
                    {t("nextBilling", {
                      date: formatDateShort(
                        activeSubscription.periodEnd,
                        locale,
                      ),
                    })}
                  </span>
                )}
              </p>
            </div>
            {activeSubscription.stripeSubscriptionId && (
              <div className="shrink-0">
                <SubscriptionActions
                  subscriptionId={activeSubscription.stripeSubscriptionId}
                  isCanceling={
                    !!activeSubscription.cancelAtPeriodEnd ||
                    !!activeSubscription.cancelAt
                  }
                />
              </div>
            )}
          </div>

          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t("quota")}</span>
              <span className="font-medium">
                {t("quotaUsed", {
                  current: currentCount,
                  max: maxVehicles,
                })}
              </span>
            </div>
            <Progress value={quotaPct} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {t("slotsRemaining", {
                count: remainingQuota,
              })}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center space-y-2">
          <p className="font-semibold">{t("noSubscription")}</p>
          <p className="text-sm text-muted-foreground">
            {t("noSubscriptionDesc")}
          </p>
        </div>
      )}

      {/* Plan Cards — upgrade or subscribe */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-base font-semibold">
            {activeSubscription ? t("upgradePlanTitle") : t("selectPlanTitle")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {activeSubscription
              ? t("upgradePlanSubtitle")
              : t("selectPlanSubtitle")}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`${plan.popular ? "border-primary" : ""}`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold">
                    {t.has(`plans.${plan.name.toLowerCase()}`)
                      ? t(`plans.${plan.name.toLowerCase()}`)
                      : plan.name}
                  </CardTitle>
                  <div className="flex gap-2">
                    {activeSubscription?.plan?.toLowerCase() ===
                      plan.name.toLowerCase() && (
                      <Badge
                        variant="outline"
                        className="text-xs border-primary text-primary"
                      >
                        {t("currentPlan")}
                      </Badge>
                    )}
                    {plan.popular && <Badge>{t("popular")}</Badge>}
                  </div>
                </div>
                <CardDescription>
                  {t.has(`planDescription.${plan.name.toLowerCase()}`)
                    ? t(`planDescription.${plan.name.toLowerCase()}`)
                    : plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-primary">
                    {formatPrice(plan.price)}
                  </span>
                  <span className="text-muted-foreground">/ {t("month")}</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground">
                      {t("listingsCount", {
                        count: (plan.limits as { vehicles?: number })?.vehicles ?? 0,
                      })}
                    </span>
                  </div>

                  {plan.hasTrial && plan.trialDays && (
                    <div className="flex items-start gap-2 text-green-600 font-medium">
                      <CheckCircle2 className="size-5 shrink-0 mt-0.5" />
                      <span>
                        {t("trialDaysLabel", { days: plan.trialDays })}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                {activeSubscription?.plan?.toLowerCase() ===
                plan.name.toLowerCase() ? (
                  <Button variant="outline" className="w-full" disabled>
                    {t("currentPlan")}
                  </Button>
                ) : (
                  <SubscribeButton
                    planName={plan.name}
                    currentSubscriptionId={
                      activeSubscription?.stripeSubscriptionId ?? null
                    }
                    variant={plan.popular ? "default" : "outline"}
                    successUrl={`/${locale}/dealer/subscription`}
                    cancelUrl={`/${locale}/dealer/subscription`}
                  />
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Billing Portal */}
      {hasAnySubscription && (
        <div className="rounded-lg border p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="font-semibold">{t("billingPortalTitle")}</p>
            <p className="text-sm text-muted-foreground">
              {t("billingPortalDesc")}
            </p>
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
              <p className="font-medium">
                {formatCardNumber(
                  billingData.paymentMethod.brand,
                  billingData.paymentMethod.last4,
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("cardExpiry", {
                  expiry: formatCardExpiry(
                    billingData.paymentMethod.expMonth,
                    billingData.paymentMethod.expYear,
                  ),
                })}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t("noPaymentMethod")}
          </p>
        )}
      </div>

      {/* Invoices */}
      <div className="rounded-lg border p-6 flex flex-col gap-4">
        <div className="space-y-1">
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
                <TableHead className="text-right">
                  {t("invoiceCol.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billingData.invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Receipt className="size-4 text-muted-foreground" />
                      {invoice.number ??
                        `#${invoice.id.slice(-8).toUpperCase()}`}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateShort(new Date(invoice.date * 1000), locale)}
                  </TableCell>
                  <TableCell>{formatPrice(invoice.amount / 100)}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        invoice.status === "paid"
                          ? "bg-green-500 hover:bg-green-600"
                          : invoice.status === "open"
                            ? "bg-yellow-500 hover:bg-yellow-600"
                            : invoice.status === "draft"
                              ? "bg-muted text-muted-foreground"
                              : "bg-destructive hover:bg-destructive/90"
                      }
                    >
                      {t(`invoiceStatus.${invoice.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end">
                      {invoice.hostedUrl && (
                        <Button variant="ghost" size="icon" asChild>
                          <a
                            href={invoice.hostedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink />
                            <span className="sr-only">{t("view")}</span>
                          </a>
                        </Button>
                      )}
                      {invoice.pdfUrl && (
                        <Button variant="ghost" size="icon" asChild>
                          <a
                            href={invoice.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download />
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
          <div className="text-sm text-muted-foreground">{t("noInvoices")}</div>
        )}
      </div>
    </div>
  );
}
