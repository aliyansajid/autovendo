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
  label?: string;
  variant?: "default" | "outline";
  className?: string;
}

export const SubscribeButton = ({
  planName,
  label,
  variant = "default",
  className,
}: SubscribeButtonProps) => {
  const t = useTranslations("SubscribeButton");
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [isPending, startTransition] = useTransition();

  const handleSubscribe = () => {
    if (!session) {
      toast.error(t("loginRequired"));
      router.push(`/login?callbackUrl=/pricing`);
      return;
    }

    startTransition(async () => {
      const { data, error } = await authClient.subscription.upgrade({
        plan: planName.toLowerCase().replace(/\s+/g, "_"),
        successUrl: `${window.location.origin}/profile?success=true`,
        cancelUrl: `${window.location.origin}/pricing`,
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
      className={className || "w-full"}
      variant={variant}
      disabled={isPending}
      onClick={handleSubscribe}
    >
      {isPending ? <Spinner /> : label || t("choosePlan")}
    </Button>
  );
};
