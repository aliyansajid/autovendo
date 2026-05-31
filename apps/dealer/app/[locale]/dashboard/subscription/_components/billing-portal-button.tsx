"use client";

import { Button } from "@repo/ui/components/button";
import { Spinner } from "@repo/ui/components/spinner";
import { ExternalLink } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function BillingPortalButton() {
  const t = useTranslations("BillingPage");
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/dealer/billing/portal`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ returnUrl: window.location.href }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.url) throw new Error();
        window.location.href = data.url;
      } catch {
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
