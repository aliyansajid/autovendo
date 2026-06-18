"use client";

import { Button } from "@repo/ui/src/components/button";
import { Spinner } from "@repo/ui/src/components/spinner";
import { useTransition } from "react";
import { useRouter } from "@/i18n/routing";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { cancelSubscription, restoreSubscription } from "@/lib/api/auth-client";

interface SubscriptionActionsProps {
  subscriptionId: string;
  isCanceling: boolean;
}

export const SubscriptionActions = ({
  subscriptionId,
  isCanceling,
}: SubscriptionActionsProps) => {
  const t = useTranslations("BillingPage");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleAction = () => {
    startTransition(async () => {
      if (isCanceling) {
        const { error } = await restoreSubscription({ subscriptionId });
        if (error) {
          toast.error((error as { message?: string }).message || t("reactivateError"));
          return;
        }
        toast.success(t("reactivateSuccess"));
        router.refresh();
      } else {
        const { data, error } = await cancelSubscription({
          subscriptionId,
          returnUrl: window.location.href,
        });
        if (error) {
          toast.error((error as { message?: string }).message || t("cancelError"));
          return;
        }
        if ((data as any)?.url) {
          window.location.href = (data as any).url;
          return;
        }
        toast.success(t("cancelSuccess"));
        router.refresh();
      }
    });
  };

  return (
    <Button
      variant={isCanceling ? "outline" : "destructive"}
      disabled={isPending}
      onClick={handleAction}
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
