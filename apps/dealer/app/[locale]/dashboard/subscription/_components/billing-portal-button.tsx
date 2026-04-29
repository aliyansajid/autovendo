"use client";

import { createBillingPortalUrl } from "@/app/actions/billing.actions";
import { Button } from "@repo/ui/components/button";
import { Spinner } from "@repo/ui/components/spinner";
import { ExternalLink } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function BillingPortalButton() {
  const t = useTranslations("BillingPage");
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
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
    <Button variant="outline" disabled={isPending} onClick={handleClick}>
      {isPending ? <Spinner /> : (
        <>
          <ExternalLink className="size-4" />
          {t("billingPortalCta")}
        </>
      )}
    </Button>
  );
}
