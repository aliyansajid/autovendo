export const dynamic = "force-dynamic";

import { getBillingDataFromApi } from "@/lib/api/billing";
import { getTranslations } from "next-intl/server";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { CreditCard, ExternalLink, Download, Receipt } from "lucide-react";
import { BillingPortalButton } from "./_components/billing-portal-button";
import {
  formatPrice,
  formatDateShort,
  formatCardNumber,
  formatCardExpiry,
} from "@repo/ui/lib/helpers/format";

export default async function BillingPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const t = await getTranslations("BillingPage");
  const { locale } = await props.params;
  const billingData = await getBillingDataFromApi();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Billing Portal */}
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
