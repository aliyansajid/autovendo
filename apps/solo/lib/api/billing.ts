import { serverFetch, clientFetch } from "./fetch-helpers";

// ─── Server-side ──────────────────────────────────────────────────────────────

export async function getBillingDataFromApi(): Promise<{
  paymentMethod: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  } | null;
  invoices: {
    id: string;
    number: string | null;
    date: number;
    amount: number;
    status: string;
    hostedUrl: string | null;
    pdfUrl: string | null;
  }[];
}> {
  const res = await serverFetch("/api/seller/billing/data");
  if (!res.ok) return { paymentMethod: null, invoices: [] };
  return res.json();
}

// ─── Client-side ──────────────────────────────────────────────────────────────

export async function apiBillingPortal(
  returnUrl: string,
): Promise<{ url: string } | null> {
  const res = await clientFetch("/api/seller/billing/portal", {
    method: "POST",
    body: JSON.stringify({ returnUrl }),
  });
  const data = await res.json().catch(() => ({}));
  return (data as any)?.url ? data : null;
}
