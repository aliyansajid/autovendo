"use client";

import { Button } from "@repo/ui/components/button";
import { Phone, Mail } from "lucide-react";
import Link from "next/link";

interface StickyActionBarProps {
  price: number;
  sellerPhone: string;
}

export const StickyActionBar = ({
  price,
  sellerPhone,
}: StickyActionBarProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-50 lg:hidden shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
      <div className="flex items-center gap-3 max-w-285 mx-auto">
        <p className="flex-1 font-bold text-xl">€ {price.toLocaleString()}</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="w-full flex-1" asChild>
            <Link href={`mailto:${sellerPhone}`}>
              <Mail />
              Contact
            </Link>
          </Button>
          <Button className="w-full flex-1" asChild>
            <Link href={`tel:${sellerPhone}`}>
              <Phone />
              Phone
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
