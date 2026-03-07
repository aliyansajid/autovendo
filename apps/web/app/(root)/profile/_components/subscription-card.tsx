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
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { CreditCard, ExternalLink } from "lucide-react";

export const SubscriptionCard = () => {
  const [isPending, startTransition] = useTransition();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      const { data, error } = await authClient.subscription.list();
      if (!error && data) {
        setSubscriptions(data);
      }
      setIsLoading(false);
    };
    fetchSubscriptions();
  }, []);

  const activeSubscription = subscriptions.find(
    (sub) => sub.status === "active" || sub.status === "trialing",
  );

  const handleManageBilling = () => {
    startTransition(async () => {
      const { data, error } = await authClient.subscription.billingPortal({
        returnUrl: window.location.href,
      });

      if (error) {
        toast.error(error.message || "Failed to open billing portal");
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10 flex justify-center">
          <Spinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="size-5" />
          Subscription
        </CardTitle>
        <CardDescription>
          Manage your subscription and billing details.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeSubscription ? (
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
            <div>
              <p className="font-semibold capitalize text-lg">
                {activeSubscription.plan} Plan
              </p>
              <p className="text-sm text-muted-foreground">
                {activeSubscription.periodEnd
                  ? `Next billing date: ${new Date(
                      activeSubscription.periodEnd,
                    ).toLocaleDateString()}`
                  : "Active subscription"}
              </p>
            </div>
            <Badge className="bg-green-500 hover:bg-green-600">
              {activeSubscription.status === "trialing" ? "Trial" : "Active"}
            </Badge>
          </div>
        ) : (
          <div className="p-4 border border-dashed rounded-lg text-center space-y-2">
            <p className="text-muted-foreground">No active subscription</p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/pricing">View Plans</Link>
            </Button>
          </div>
        )}
      </CardContent>
      {activeSubscription && (
        <CardFooter>
          <Button
            variant="outline"
            className="w-full gap-2"
            disabled={isPending}
            onClick={handleManageBilling}
          >
            {isPending ? (
              <Spinner />
            ) : (
              <>
                Manage Billing
                <ExternalLink className="size-4" />
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
