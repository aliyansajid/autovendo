import { auth, stripeClient } from "@repo/auth";
import { prisma } from "@repo/db";
import { headers } from "next/headers";

export type PaymentMethod = {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
};

export type Invoice = {
  id: string;
  number: string | null;
  date: number;
  amount: number;
  currency: string;
  status: string;
  pdfUrl: string | null;
};

export async function getBillingData(): Promise<{
  paymentMethod: PaymentMethod | null;
  invoices: Invoice[];
}> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { paymentMethod: null, invoices: [] };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) return { paymentMethod: null, invoices: [] };

  const customerId = user.stripeCustomerId;

  const [paymentMethods, invoices] = await Promise.all([
    stripeClient.paymentMethods.list({ customer: customerId, type: "card" }),
    stripeClient.invoices.list({ customer: customerId, limit: 12 }),
  ]);

  const pm = paymentMethods.data[0]?.card ?? null;
  const paymentMethod: PaymentMethod | null = pm
    ? {
        brand: pm.brand,
        last4: pm.last4,
        expMonth: pm.exp_month,
        expYear: pm.exp_year,
      }
    : null;

  const mappedInvoices: Invoice[] = invoices.data.map((inv) => ({
    id: inv.id,
    number: inv.number,
    date: inv.created,
    amount: inv.amount_paid,
    currency: inv.currency,
    status: inv.status ?? "unknown",
    pdfUrl: inv.invoice_pdf ?? null,
  }));

  return { paymentMethod, invoices: mappedInvoices };
}
