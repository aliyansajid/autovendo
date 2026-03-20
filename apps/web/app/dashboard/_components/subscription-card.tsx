"use client";

import { authClient } from "@repo/auth/client";
import { Button } from "@repo/ui/src/components/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@repo/ui/src/components/card";
import { Spinner } from "@repo/ui/src/components/spinner";
import { Badge } from "@repo/ui/src/components/badge";
import { useTransition } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { CreditCard, ExternalLink } from "lucide-react";
import { format } from "date-fns";

type SubscriptionData = {
  id: string;
  plan: string;
  status: string;
  periodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

interface SubscriptionCardProps {
  subscriptions: SubscriptionData[];
}

export function SubscriptionCard({ subscriptions }: SubscriptionCardProps) {
  const [isPending, startTransition] = useTransition();

  const activeSubscription = subscriptions.find(
    (s) => s.status === "active" || s.status === "trialing",
  );

  const handleManageBilling = () => {
    startTransition(async () => {
      const { data, error } = await authClient.subscription.billingPortal({
        returnUrl: window.location.href,
      });

      if (error) {
        toast.error(
          error.message || "Abrechnungsportal konnte nicht geöffnet werden.",
        );
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="size-5" />
          Abonnement
        </CardTitle>
        <CardDescription>
          Verwalten Sie Ihr Abonnement und Ihre Rechnungsdetails.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeSubscription ? (
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
            <div className="space-y-1">
              <p className="font-semibold capitalize">
                {activeSubscription.plan} Plan
              </p>
              <p className="text-sm text-muted-foreground">
                {activeSubscription.cancelAtPeriodEnd
                  ? "Kündigung zum Periodenende"
                  : activeSubscription.periodEnd
                    ? `Nächste Abrechnung: ${format(new Date(activeSubscription.periodEnd), "dd.MM.yyyy")}`
                    : "Aktives Abonnement"}
              </p>
            </div>
            <Badge className="bg-green-500 hover:bg-green-600">
              {activeSubscription.status === "trialing" ? "Testphase" : "Aktiv"}
            </Badge>
          </div>
        ) : (
          <div className="p-4 border border-dashed rounded-lg text-center space-y-2">
            <p className="text-muted-foreground">Kein aktives Abonnement</p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/pricing">Pläne anzeigen</Link>
            </Button>
          </div>
        )}
      </CardContent>
      {activeSubscription && (
        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            disabled={isPending}
            onClick={handleManageBilling}
          >
            {isPending ? (
              <>
                <Spinner />
                Wird geöffnet...
              </>
            ) : (
              <>
                Abrechnung verwalten
                <ExternalLink />
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
