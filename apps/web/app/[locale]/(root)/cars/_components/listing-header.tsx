"use client";

import { Share2, ArrowLeft } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@repo/ui/src/components/breadcrumb";
import { Separator } from "@repo/ui/src/components/separator";
import Link from "next/link";
import { formatVehicleName } from "@/lib/helpers/vehicle";

interface ListingHeaderProps {
  make: string;
  model: string;
  trim: string;
}

export const ListingHeader = ({ make, model, trim }: ListingHeaderProps) => {
  const displayName = formatVehicleName([make, model, trim]);
  const displayMake = formatVehicleName([make]);
  const displayModel = formatVehicleName([model]);
  const displayTrim = formatVehicleName([trim]);

  const handleShare = async () => {
    const shareData = {
      title: displayName,
      text: `${displayName} – AutoVendo`,
      url: window.location.href,
    };

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link in die Zwischenablage kopiert.");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-2">
        <Button variant="link" asChild>
          <Link href="/cars">
            <ArrowLeft />
            Zurück
          </Link>
        </Button>

        <Separator
          orientation="vertical"
          className="hidden md:block h-4! mr-2.5"
        />

        <Breadcrumb className="hidden md:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Start</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/cars">Fahrzeuge</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">{displayMake}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">{displayModel}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{displayTrim}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground"
        onClick={handleShare}
      >
        <Share2 />
        <span className="hidden sm:inline">Teilen</span>
      </Button>
    </div>
  );
};
