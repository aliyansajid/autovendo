import { auth } from "@repo/auth";
import { prisma } from "@repo/db";
import { headers } from "next/headers";
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
import {
  CreditCard,
  ExternalLink,
  Download,
  Receipt,
  CheckCircle2,
  XCircle,
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
import { formatPrice } from "@/lib/helpers/format";

interface PricingFeature {
  name: string;
  included: boolean;
}

interface PricingTier {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: PricingFeature[];
  buttonText: string;
  popular: boolean;
}

export default async function SubscriptionPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const t = await getTranslations("BillingPage");
  const tp = await getTranslations("PricingPage");
  const format = await getFormatter();
  const { locale } = await props.params;

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

  const rawTiers = (await tp.raw("tiers")) as PricingTier[];

  const tiers = rawTiers.map((tier) => ({
    ...tier,
    price: formatPrice(Number(tier.price.replace(/[^\d.-]/g, "")), locale),
  }));

  const currentPlanKey = activeSubscription?.plan?.toLowerCase() ?? null;
  const currentTier =
    tiers.find((t) => t.name.toLowerCase() === currentPlanKey) ?? null;

  const quotaPct =
    subscriptionStatus.maxVehicles > 0
      ? (subscriptionStatus.currentCount / subscriptionStatus.maxVehicles) * 100
      : 0;

  const hasAnySubscription = subscriptions.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
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
                  {currentTier?.name ?? activeSubscription.plan} Plan
                </h2>
                <Badge className="bg-green-500 hover:bg-green-600">
                  {activeSubscription.status === "trialing"
                    ? t("statusTrialing")
                    : t("statusActive")}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {currentTier?.price ?? activeSubscription.plan} / {t("month")}
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
        <div>
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
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={`${tier.popular ? "border-primary" : ""}`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold">
                    {tier.name}
                  </CardTitle>
                  <div className="flex gap-2">
                    {activeSubscription?.plan?.toLowerCase() ===
                      tier.name.toLowerCase() && (
                      <Badge
                        variant="outline"
                        className="text-xs border-primary text-primary"
                      >
                        {t("currentPlan")}
                      </Badge>
                    )}
                    {tier.popular && <Badge>{t("popular")}</Badge>}
                  </div>
                </div>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-primary">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-muted-foreground">{tier.period}</span>
                  )}
                </div>
                <div className="space-y-4">
                  {tier.features.map((feature: PricingFeature) => (
                    <div key={feature.name} className="flex items-start gap-3">
                      {feature.included ? (
                        <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                      )}
                      <span
                        className={
                          feature.included
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }
                      >
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                {activeSubscription?.plan?.toLowerCase() ===
                tier.name.toLowerCase() ? (
                  <Button variant="outline" className="w-full" disabled>
                    {t("currentPlan")}
                  </Button>
                ) : (
                  <SubscribeButton
                    planName={tier.name}
                    variant={tier.popular ? "default" : "outline"}
                    successUrl={`/dashboard/subscription`}
                    cancelUrl={`/dashboard/subscription`}
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
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">
            {t("noInvoices")}
          </div>
        )}
      </div>
    </div>
  );
}
