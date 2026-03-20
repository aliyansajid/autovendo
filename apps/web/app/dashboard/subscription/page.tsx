import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { prisma } from "@repo/db";
import { SubscriptionCard } from "../_components/subscription-card";

export default async function SubscriptionPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  const subscriptions = await prisma.subscription.findMany({
    where: { referenceId: session!.user.id },
    orderBy: { periodEnd: "desc" },
    select: {
      id: true,
      plan: true,
      status: true,
      periodEnd: true,
      cancelAtPeriodEnd: true,
    },
  });

  // Serialize Date objects before passing to client component
  const serialized = subscriptions.map((s) => ({
    id: s.id,
    plan: s.plan,
    status: s.status,
    periodEnd: s.periodEnd?.toISOString() ?? null,
    cancelAtPeriodEnd: s.cancelAtPeriodEnd ?? false,
  }));

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Abonnement</h1>
        <p className="text-muted-foreground">
          Verwalten Sie Ihr Paket und Ihre Rechnungsdetails.
        </p>
      </div>
      <SubscriptionCard subscriptions={serialized} />
    </div>
  );
}
