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
  hostedUrl: string | null;
};

async function getStripeCustomerId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  });
  return user?.stripeCustomerId ?? null;
}

export async function getBillingData(): Promise<{
  paymentMethod: PaymentMethod | null;
  invoices: Invoice[];
}> {
  const customerId = await getStripeCustomerId();
  if (!customerId) return { paymentMethod: null, invoices: [] };

  const [paymentMethods, invoices] = await Promise.all([
    stripeClient.paymentMethods.list({ customer: customerId, type: "card" }),
    stripeClient.invoices.list({ customer: customerId, limit: 12 }),
  ]);

  const pm = paymentMethods.data[0]?.card ?? null;
  const paymentMethod: PaymentMethod | null = pm
    ? { brand: pm.brand, last4: pm.last4, expMonth: pm.exp_month, expYear: pm.exp_year }
    : null;

  const mappedInvoices: Invoice[] = invoices.data.map((inv) => ({
    id: inv.id,
    number: inv.number,
    date: inv.created,
    amount: inv.amount_paid,
    currency: inv.currency,
    status: inv.status ?? "unknown",
    pdfUrl: inv.invoice_pdf ?? null,
    hostedUrl: inv.hosted_invoice_url ?? null,
  }));

  return { paymentMethod, invoices: mappedInvoices };
}

export async function createBillingPortalUrl(returnUrl: string): Promise<string> {
  const customerId = await getStripeCustomerId();
  if (!customerId) throw new Error("No Stripe customer");

  const portalSession = await stripeClient.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return portalSession.url;
}
