"use client";

import { Button } from "@repo/ui/components/button";
import { Spinner } from "@repo/ui/components/spinner";
import { ExternalLink } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { apiBillingPortal } from "@/lib/api/billing";

export function BillingPortalButton() {
  const t = useTranslations("BillingPage");
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const data = await apiBillingPortal(window.location.href);
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error(t("billingPortalError"));
      }
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
