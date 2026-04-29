"use client";

import { createPaymentUpdateUrl } from "@/app/actions/billing.actions";
import { Button } from "@repo/ui/components/button";
import { Spinner } from "@repo/ui/components/spinner";
import { useTransition } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function UpdatePaymentButton({ label }: { label: string }) {
  const t = useTranslations("BillingPage");
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      try {
        const url = await createPaymentUpdateUrl(window.location.href);
        window.location.href = url;
      } catch {
        toast.error(t("paymentUpdateError"));
      }
    });
  };

  return (
    <Button variant="outline" size="sm" disabled={isPending} onClick={handleClick}>
      {isPending ? <Spinner /> : label}
    </Button>
  );
}
