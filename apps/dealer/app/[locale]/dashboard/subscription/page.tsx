import { auth } from "@repo/auth";
import { prisma } from "@repo/db";
import { headers } from "next/headers";
import { getVehicleSubscriptionStatus } from "@/app/actions/vehicles.actions";
import { getBillingData } from "@/app/actions/billing.actions";
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
import { formatPrice, formatDateTime } from "@/lib/helpers/format";

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

  // Fetch current session for identity
  const session = await auth.api.getSession({ headers: await headers() });

  /**
   * Data Aggregation Phase
   * Parallel fetch for all required dashboard data:
   * 1. Historical subscriptions from DB
   * 2. Calculated vehicle quota status
   * 3. Live billing data from Stripe (invoices, cards)
   * 4. Available subscription plans
   */
  const [subscriptions, subscriptionStatus, billingData, plans] =
    await Promise.all([
      prisma.subscription.findMany({
        where: { referenceId: session!.user.id },
        orderBy: { periodEnd: "desc" },
      }),
      getVehicleSubscriptionStatus(),
      getBillingData(),
      prisma.plan.findMany({
        orderBy: { price: "asc" },
        select: {
          name: true,
          price: true,
          description: true,
          limits: true,
          popular: true,
          hasTrial: true,
          trialDays: true,
        },
      }),
    ]);

  const activeSubscription = subscriptions.find(
    (s) => s.status === "active" || s.status === "trialing",
  );

  const currentPlanKey = activeSubscription?.plan?.toLowerCase() ?? null;
  const currentPlan =
    plans.find((p) => p.name.toLowerCase() === currentPlanKey) ?? null;

  const quotaPct =
    subscriptionStatus.maxVehicles > 0
      ? (subscriptionStatus.currentCount / subscriptionStatus.maxVehicles) * 100
      : 0;

  const hasAnySubscription = subscriptions.length > 0;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Current Plan + Usage */}
      {activeSubscription ? (
        <div className="rounded-lg border divide-y">
          <div className="p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold capitalize">
                  {currentPlan?.name ?? activeSubscription.plan} Plan
                </h2>
                <Badge className="bg-green-500 hover:bg-green-600">
                  {activeSubscription.status === "trialing"
                    ? t("statusTrialing")
                    : t("statusActive")}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {currentPlan
                  ? formatPrice(currentPlan.price)
                  : activeSubscription.plan}{" "}
                / {t("month")}
                {activeSubscription.periodEnd && (
                  <span>
                    {" · "}
                    {t("nextBilling", {
                      date: formatDateTime(activeSubscription.periodEnd, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }),
                    })}
                  </span>
                )}
              </p>
            </div>
            {activeSubscription.stripeSubscriptionId && (
              <div className="shrink-0">
                <SubscriptionActions
                  subscriptionId={activeSubscription.stripeSubscriptionId}
                  cancelAtPeriodEnd={!!activeSubscription.cancelAtPeriodEnd}
                />
              </div>
            )}
          </div>
          {activeSubscription.status === "trialing" &&
            activeSubscription.trialEnd && (
              <div className="px-6 py-3 bg-primary/10 text-primary text-sm font-medium">
                {t("trialEndsAt", {
                  date: formatDateTime(activeSubscription.trialEnd, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }),
                })}
              </div>
            )}

          {activeSubscription.cancelAtPeriodEnd &&
            activeSubscription.periodEnd && (
              <div className="px-6 py-3 bg-destructive/10 text-destructive text-sm font-medium">
                {t("cancelingAt", {
                  date: formatDateTime(activeSubscription.periodEnd, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }),
                })}
              </div>
            )}

          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t("listings")}</span>
              <span className="font-medium">
                {subscriptionStatus.currentCount} /{" "}
                {subscriptionStatus.maxVehicles}
              </span>
            </div>
            <Progress value={quotaPct} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {t("slotsRemaining", {
                count: subscriptionStatus.remainingQuota,
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
                    {plan.name}
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
                        count: (plan.limits as any)?.vehicles,
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
                    variant={plan.popular ? "default" : "outline"}
                    successUrl={`/${locale}/dashboard/subscription`}
                    cancelUrl={`/${locale}/dashboard/subscription`}
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
              <p className="font-medium capitalize">
                {billingData.paymentMethod.brand} ••••{" "}
                {billingData.paymentMethod.last4}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("cardExpiry", {
                  month: String(billingData.paymentMethod.expMonth).padStart(
                    2,
                    "0",
                  ),
                  year: billingData.paymentMethod.expYear,
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
      <div className="rounded-lg border p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                    {formatDateTime(new Date(invoice.date * 1000), {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>{formatPrice(invoice.amount / 100)}</TableCell>
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
                          <a
                            href={invoice.hostedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="size-4 mr-1" />
                            {t("view")}
                          </a>
                        </Button>
                      )}
                      {invoice.pdfUrl && (
                        <Button variant="ghost" size="sm" asChild>
                          <a
                            href={invoice.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
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
          <div className="text-sm text-muted-foreground">{t("noInvoices")}</div>
        )}
      </div>
    </div>
  );
}
