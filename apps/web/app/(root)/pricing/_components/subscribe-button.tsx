"use client";

import { authClient } from "@repo/auth/client";
import { Button } from "@repo/ui/src/components/button";
import { Spinner } from "@repo/ui/src/components/spinner";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

interface SubscribeButtonProps {
  planName: string;
  variant?: "default" | "outline";
}

export const SubscribeButton = ({
  planName,
  variant = "default",
}: SubscribeButtonProps) => {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [isPending, startTransition] = useTransition();

  const handleSubscribe = () => {
    if (!session) {
      toast.error("Please login to choose a plan");
      router.push(`/login?callbackUrl=/pricing`);
      return;
    }

    startTransition(async () => {
      const { data, error } = await authClient.subscription.upgrade({
        plan: planName.toLowerCase(),
        successUrl: `${window.location.origin}/profile?success=true`,
        cancelUrl: `${window.location.origin}/pricing`,
      });

      if (error) {
        toast.error(error.message || "Something went wrong");
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    });
  };

  return (
    <Button
      className="w-full"
      variant={variant}
      disabled={isPending}
      onClick={handleSubscribe}
    >
      {isPending ? (
        <Spinner />
      ) : (
        <>
          Paket wählen
          <ArrowRight />
        </>
      )}
    </Button>
  );
};
