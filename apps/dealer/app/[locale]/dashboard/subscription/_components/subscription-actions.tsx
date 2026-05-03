"use client";

import { authClient } from "@repo/auth/client";
import { Button } from "@repo/ui/src/components/button";
import { Spinner } from "@repo/ui/src/components/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui/src/components/alert-dialog";
import { useRouter } from "@/i18n/routing";
import { useTransition, useState } from "react";
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleCancel = async () => {
    startTransition(async () => {
      const { data, error } = await authClient.subscription.cancel({
        subscriptionId,
        returnUrl: window.location.href,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      toast.success(t("cancelSuccess"));
      setIsAlertOpen(false);
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

  if (isCanceling) {
    return (
      <Button variant="outline" disabled={isPending} onClick={handleReactivate}>
        {isPending ? <Spinner /> : t("reactivateSubscription")}
      </Button>
    );
  }

  return (
    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" disabled={isPending}>
          {isPending ? <Spinner /> : t("cancelSubscription")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("cancelConfirmTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription>{t("cancelConfirm")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant={"destructive"}
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault();
              handleCancel();
            }}
          >
            {isPending ? <Spinner /> : null}
            {t("cancelSubscription")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
