import { Hono } from "hono";
import { prisma } from "@repo/db";
import { stripeClient } from "@repo/auth";

type Variables = {
  user: { id: string; email: string; role?: string | null } | null;
  session: unknown | null;
};

const router = new Hono<{ Variables: Variables }>();

// ─── Auth guard ───────────────────────────────────────────────────────────────

router.use("*", async (c, next) => {
  if (!c.get("user")) return c.json({ error: "Unauthorized" }, 401);
  await next();
});

async function getStripeCustomerId(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });
  return user?.stripeCustomerId ?? null;
}

// ─── GET /data — payment method + invoice list ────────────────────────────────

router.get("/data", async (c) => {
  const user = c.get("user")!;
  const customerId = await getStripeCustomerId(user.id);

  if (!customerId) {
    return c.json({ paymentMethod: null, invoices: [] });
  }

  const [paymentMethods, invoices] = await Promise.all([
    stripeClient.paymentMethods.list({ customer: customerId, type: "card" }),
    stripeClient.invoices.list({ customer: customerId, limit: 12 }),
  ]);

  const pm = paymentMethods.data[0]?.card ?? null;
  const paymentMethod = pm
    ? { brand: pm.brand, last4: pm.last4, expMonth: pm.exp_month, expYear: pm.exp_year }
    : null;

  const mappedInvoices = invoices.data.map((inv) => ({
    id: inv.id,
    number: inv.number,
    date: inv.created,
    amount: inv.amount_paid,
    currency: inv.currency,
    status: inv.status ?? "unknown",
    pdfUrl: inv.invoice_pdf ?? null,
    hostedUrl: inv.hosted_invoice_url ?? null,
  }));

  return c.json({ paymentMethod, invoices: mappedInvoices });
});

// ─── POST /portal — create Stripe billing portal session ─────────────────────

router.post("/portal", async (c) => {
  const user = c.get("user")!;
  const customerId = await getStripeCustomerId(user.id);

  if (!customerId) return c.json({ error: "No Stripe customer" }, 400);

  const body = await c.req.json().catch(() => ({}));
  const returnUrl = (body as any).returnUrl as string | undefined;

  if (!returnUrl) return c.json({ error: "returnUrl is required" }, 400);

  const portalSession = await stripeClient.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return c.json({ url: portalSession.url });
});

export default router;
