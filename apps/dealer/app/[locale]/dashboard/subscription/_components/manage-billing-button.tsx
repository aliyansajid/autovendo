"use client";

import { authClient } from "@repo/auth/client";
import { Button } from "@repo/ui/components/button";
import { Spinner } from "@repo/ui/components/spinner";
import { useTransition, ReactNode } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface ManageBillingButtonProps {
  label: string;
  variant?: "default" | "outline";
  icon?: ReactNode;
}

export function ManageBillingButton({
  label,
  variant = "default",
  icon,
}: ManageBillingButtonProps) {
  const t = useTranslations("BillingPage");
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const { data, error } = await authClient.subscription.billingPortal({
        returnUrl: window.location.href,
      });

      if (error) {
        toast.error(error.message || t("portalError"));
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    });
  };

  return (
    <Button variant={variant} disabled={isPending} onClick={handleClick}>
      {isPending ? (
        <>
          <Spinner />
          {t("portalOpening")}
        </>
      ) : (
        <>
          {label}
          {icon}
        </>
      )}
    </Button>
  );
}
