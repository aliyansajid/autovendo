"use client";

import { authClient } from "@repo/auth/client";
import { Button } from "@repo/ui/src/components/button";
import { Spinner } from "@repo/ui/src/components/spinner";
import { useRouter } from "@/i18n/routing";
import { useTransition } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

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
  const { data: session } = authClient.useSession();
  const [isPending, startTransition] = useTransition();

  const handleSubscribe = () => {
    if (!session) {
      toast.error(t("loginRequired"));
      router.push(`/login?callbackUrl=/dashboard/billing`);
      return;
    }

    startTransition(async () => {
      const { data: subscriptions } = await authClient.subscription.list();
      const activeSubscription = subscriptions?.find(
        (sub: any) => sub.status === "active" || sub.status === "trialing",
      );

      const toAbsolute = (url: string | undefined, fallback: string) => {
        if (!url) return `${window.location.origin}${fallback}`;
        return url.startsWith("http") ? url : `${window.location.origin}${url}`;
      };

      const { data, error } = await authClient.subscription.upgrade({
        plan: planName.toLowerCase(),
        successUrl: toAbsolute(
          successUrl,
          "/dashboard/billing?success=true",
        ),
        cancelUrl: toAbsolute(cancelUrl, "/dashboard/billing"),
        ...(activeSubscription?.stripeSubscriptionId && {
          subscriptionId: activeSubscription.stripeSubscriptionId,
        }),
      });

      if (error) {
        toast.error(error.message || t("errorDefault"));
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
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
