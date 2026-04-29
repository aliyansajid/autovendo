import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { prisma } from "@repo/db";
import { getVehicleSubscriptionStatus } from "@/app/actions/vehicles.actions";
import { getBillingData } from "@/app/actions/billing.actions";
import { getTranslations, getFormatter } from "next-intl/server";
import { Badge } from "@repo/ui/components/badge";
import { Progress } from "@repo/ui/components/progress";
import { Separator } from "@repo/ui/components/separator";
import { Button } from "@repo/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { Link } from "@/i18n/routing";
import {
  CreditCard,
  AlertTriangle,
  ArrowUpRight,
  Download,
  ExternalLink,
  Receipt,
} from "lucide-react";
import { CancelButton } from "./_components/cancel-button";
import { RestoreButton } from "./_components/restore-button";
import { UpdatePaymentButton } from "./_components/update-payment-button";

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
  const canceledSubscription = !activeSubscription
    ? subscriptions.find((s) => s.status === "canceled")
    : null;

  const planName = activeSubscription?.plan?.toLowerCase() ?? "";
  const planPrice = PLAN_PRICES[planName] ?? null;
  const quotaPct =
    subscriptionStatus.maxVehicles > 0
      ? (subscriptionStatus.currentCount / subscriptionStatus.maxVehicles) * 100
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Cancellation warning */}
      {activeSubscription?.cancelAtPeriodEnd && activeSubscription.periodEnd && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-yellow-500/40 bg-yellow-500/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="size-5 text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-700 dark:text-yellow-400">
                {t("cancelWarning")}
              </p>
              <p className="text-sm text-yellow-600/80 dark:text-yellow-400/70">
                {t("cancelWarningDate", {
                  date: format.dateTime(activeSubscription.periodEnd, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }),
                })}
              </p>
            </div>
          </div>
          <RestoreButton label={t("keepSubscription")} />
        </div>
      )}

      {/* No subscription */}
      {!activeSubscription && !canceledSubscription && (
        <div className="rounded-lg border border-dashed p-10 text-center space-y-3">
          <p className="font-medium">{t("noSubscription")}</p>
          <p className="text-sm text-muted-foreground">{t("noSubscriptionDesc")}</p>
          <Button asChild className="mt-2">
            <Link href="/pricing">{t("choosePlan")}</Link>
          </Button>
        </div>
      )}

      {/* Canceled — offer resubscribe */}
      {canceledSubscription && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-destructive/30 bg-destructive/5">
          <div>
            <p className="font-medium text-destructive">{t("subExpired")}</p>
            {canceledSubscription.endedAt && (
              <p className="text-sm text-muted-foreground">
                {t("subExpiredOn", {
                  date: format.dateTime(canceledSubscription.endedAt, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }),
                })}
              </p>
            )}
          </div>
          <Button asChild>
            <Link href="/pricing">{t("resubscribe")}</Link>
          </Button>
        </div>
      )}

      {/* Plan & Usage */}
      {activeSubscription && (
        <div className="rounded-lg border divide-y">
          {/* Plan info */}
          <div className="p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold capitalize">{planName} Plan</h2>
                <Badge className="bg-green-500 hover:bg-green-600">
                  {activeSubscription.status === "trialing"
                    ? t("statusTrialing")
                    : t("statusActive")}
                </Badge>
              </div>
              {planPrice && (
                <p className="text-sm text-muted-foreground">
                  {format.number(planPrice, {
                    style: "currency",
                    currency: "CHF",
                    minimumFractionDigits: 0,
                  })}{" "}
                  / {t("month")}
                  {activeSubscription.periodEnd && !activeSubscription.cancelAtPeriodEnd && (
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
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" asChild>
                <Link href="/pricing">
                  {t("upgradePlan")}
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
              {!activeSubscription.cancelAtPeriodEnd && (
                <CancelButton label={t("cancelSubscription")} />
              )}
            </div>
          </div>

          {/* Usage */}
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
      )}

      {/* Payment Method */}
      <div className="rounded-lg border divide-y">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <p className="font-semibold">{t("paymentTitle")}</p>
            <p className="text-sm text-muted-foreground">{t("paymentDesc")}</p>
          </div>
          {activeSubscription && <UpdatePaymentButton label={t("updatePayment")} />}
        </div>
        <div className="px-6 py-4">
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
                            <ExternalLink className="size-4" />
                            <span className="sr-only">{t("view")}</span>
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
