"use client";

import { authClient } from "@repo/auth/client";
import { Button } from "@repo/ui/src/components/button";
import { useRouter } from "@/i18n/routing";

interface PricingButtonProps {
  variant?: "default" | "outline";
  label: string;
  className?: string;
}

export const PricingButton = ({
  variant = "default",
  label,
  className = "w-full",
}: PricingButtonProps) => {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const handleClick = () => {
    const callbackUrl = "/dashboard/subscription";
    if (session) {
      router.push(callbackUrl);
    } else {
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
  };

  return (
    <Button className={className} variant={variant} onClick={handleClick}>
      {label}
    </Button>
  );
};
