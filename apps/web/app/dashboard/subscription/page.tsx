"use client";

import { SubscriptionCard } from "../_components/subscription-card";

export default function SubscriptionPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Abonnement</h1>
        <p className="text-muted-foreground">
          Verwalten Sie Ihr Paket und Ihre Rechnungsdetails.
        </p>
      </div>

      <SubscriptionCard />
    </div>
  );
}
