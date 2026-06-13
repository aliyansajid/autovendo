"use client";

import { useTranslations } from "next-intl";
import { Button } from "@repo/ui/components/button";
import { Phone, Mail } from "lucide-react";
import { Link } from "@/i18n/routing";
import { formatPrice } from "@repo/ui/lib/helpers/format";

interface StickyActionBarProps {
  price: number;
  sellerPhone: string;
  sellerEmail?: string;
}

export const StickyActionBar = ({
  price,
  sellerPhone,
  sellerEmail,
}: StickyActionBarProps) => {
  const t = useTranslations("StickyActionBar");
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-50 lg:hidden shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
      <div className="flex items-center gap-3 max-w-285 mx-auto">
        <p className="flex-1 font-bold text-xl">{formatPrice(price)}</p>
        <div className="flex items-center gap-2">
          {sellerEmail && (
            <Button variant="outline" className="w-full flex-1" asChild>
              <Link href={`mailto:${sellerEmail}`}>
                <Mail />
                {t("contact")}
              </Link>
            </Button>
          )}
          <Button className="w-full flex-1" asChild>
            <Link href={`tel:${sellerPhone}`}>
              <Phone />
              {t("phone")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
