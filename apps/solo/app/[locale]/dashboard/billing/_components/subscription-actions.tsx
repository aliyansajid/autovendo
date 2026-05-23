"use client";

import { createBillingPortalUrl } from "@/app/actions/billing.actions";
import { Button } from "@repo/ui/src/components/button";
import { Spinner } from "@repo/ui/src/components/spinner";
import { useTransition } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface SubscriptionActionsProps {
  subscriptionId: string;
  isCanceling: boolean;
}

export const SubscriptionActions = ({
  subscriptionId,
  isCanceling,
}: SubscriptionActionsProps) => {
  const t = useTranslations("BillingPage");
  const [isPending, startTransition] = useTransition();

  const handleGoToStripe = async () => {
    startTransition(async () => {
      try {
        const url = await createBillingPortalUrl(window.location.href);
        window.location.href = url;
      } catch {
        toast.error(t("billingPortalError"));
      }
    });
  };

  return (
    <Button
      variant={isCanceling ? "outline" : "destructive"}
      disabled={isPending}
      onClick={handleGoToStripe}
    >
      {isPending ? (
        <Spinner />
      ) : isCanceling ? (
        t("reactivateSubscription")
      ) : (
        t("cancelSubscription")
      )}
    </Button>
  );
};
