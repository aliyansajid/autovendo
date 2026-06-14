"use client";

import { Button } from "@repo/ui/components/button";
import { Spinner } from "@repo/ui/components/spinner";
import { ExternalLink } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { openBillingPortal } from "@/lib/api/auth-client";

export function BillingPortalButton() {
  const t = useTranslations("BillingPage");
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const { data, error } = await openBillingPortal({ returnUrl: window.location.href });
      if (error || !data?.url) {
        toast.error(t("billingPortalError"));
        return;
      }
      window.location.href = data.url;
    });
  };

  return (
    <Button variant="outline" disabled={isPending} onClick={handleClick}>
      {isPending ? (
        <Spinner />
      ) : (
        <>
          <ExternalLink />
          {t("billingPortalCta")}
        </>
      )}
    </Button>
  );
}
