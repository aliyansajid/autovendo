"use client";

import { Button } from "@repo/ui/src/components/button";
import { Spinner } from "@repo/ui/src/components/spinner";
import { useRouter } from "@/i18n/routing";
import { useTransition } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { upgradeSubscription, listSubscriptions } from "@/lib/api/auth-client";

interface SubscribeButtonProps {
  planName: string;
  variant?: "default" | "outline";
  label?: string;
  successUrl?: string;
  cancelUrl?: string;
  className?: string;
}

export const SubscribeButton = ({
  planName,
  variant = "default",
  label,
  successUrl,
  cancelUrl,
  className = "w-full",
}: SubscribeButtonProps) => {
  const t = useTranslations("SubscribeButton");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubscribe = () => {
    startTransition(async () => {
      try {
        const { data: subscriptions } = await listSubscriptions();
        const activeSubscription = (subscriptions as any[])?.find(
          (sub: any) => sub.status === "active" || sub.status === "trialing",
        );

        const toAbsolute = (url: string | undefined, fallback: string) => {
          if (!url) return `${window.location.origin}${fallback}`;
          return url.startsWith("http") ? url : `${window.location.origin}${url}`;
        };

        const { data, error } = await upgradeSubscription({
          plan: planName.toLowerCase(),
          successUrl: toAbsolute(successUrl, "/dashboard/subscription?success=true"),
          cancelUrl: toAbsolute(cancelUrl, "/dashboard/subscription"),
          ...(activeSubscription?.stripeSubscriptionId && {
            subscriptionId: activeSubscription.stripeSubscriptionId,
          }),
        });

        if (error) {
          toast.error((error as any).message || t("errorDefault"));
          return;
        }

        if (data?.url) {
          window.location.href = data.url;
        }
      } catch (err: any) {
        toast.error(err?.message || t("errorDefault"));
      }
    });
  };

  return (
    <Button
      className={className}
      variant={variant}
      disabled={isPending}
      onClick={handleSubscribe}
    >
      {isPending ? <Spinner /> : (label ?? t("choosePlan"))}
    </Button>
  );
};
