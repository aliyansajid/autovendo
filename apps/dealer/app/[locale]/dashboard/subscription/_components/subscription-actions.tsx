"use client";

import { authClient } from "@repo/auth/client";
import { Button } from "@repo/ui/src/components/button";
import { Spinner } from "@repo/ui/src/components/spinner";
import { useRouter } from "@/i18n/routing";
import { useTransition } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface SubscriptionActionsProps {
  subscriptionId: string;
  cancelAtPeriodEnd: boolean;
}

export const SubscriptionActions = ({
  subscriptionId,
  cancelAtPeriodEnd,
}: SubscriptionActionsProps) => {
  const t = useTranslations("BillingPage");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleCancel = async () => {
    if (!confirm(t("cancelConfirm"))) return;

    startTransition(async () => {
      const { error } = await authClient.subscription.cancel({
        subscriptionId,
        returnUrl: window.location.href,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success(t("cancelSuccess"));
      router.refresh();
    });
  };

  const handleReactivate = async () => {
    startTransition(async () => {
      const { error } = await authClient.subscription.restore({
        subscriptionId,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success(t("reactivateSuccess"));
      router.refresh();
    });
  };

  if (cancelAtPeriodEnd) {
    return (
      <Button variant="outline" disabled={isPending} onClick={handleReactivate}>
        {isPending ? <Spinner /> : t("reactivateSubscription")}
      </Button>
    );
  }

  return (
    <Button variant="destructive" disabled={isPending} onClick={handleCancel}>
      {isPending ? <Spinner /> : t("cancelSubscription")}
    </Button>
  );
};
