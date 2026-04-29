"use client";

import { restoreSubscription } from "@/app/actions/billing.actions";
import { Button } from "@repo/ui/components/button";
import { Spinner } from "@repo/ui/components/spinner";
import { useRouter } from "@/i18n/routing";
import { useTransition } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function RestoreButton({ label }: { label: string }) {
  const t = useTranslations("BillingPage");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRestore = () => {
    startTransition(async () => {
      try {
        await restoreSubscription();
        router.refresh();
        toast.success(t("restoreSuccess"));
      } catch {
        toast.error(t("restoreError"));
      }
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={handleRestore}
      className="shrink-0"
    >
      {isPending ? <Spinner /> : label}
    </Button>
  );
}
