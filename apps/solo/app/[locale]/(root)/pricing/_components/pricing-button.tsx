"use client";

import { authClient } from "@repo/auth/client";
import { Button } from "@repo/ui/src/components/button";
import { useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";

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
  const locale = useLocale();
  const { data: session } = authClient.useSession();

  const handleClick = () => {
    const destination = "/dashboard/billing";
    if (session) {
      router.push(destination);
    } else {
      const callbackUrl = `/${locale}/dashboard/billing`;
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
  };

  return (
    <Button className={className} variant={variant} onClick={handleClick}>
      {label}
    </Button>
  );
};
