"use client";

import { Share2, Printer, ArrowLeft } from "lucide-react";
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

interface ListingHeaderProps {
  make: string;
  model: string;
  trim: string;
}

export const ListingHeader = ({ make, model, trim }: ListingHeaderProps) => {
  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-2">
        <Button variant="link" size="sm">
          <ArrowLeft />
          Back
        </Button>
        <Separator
          orientation="vertical"
          className="hidden md:block h-4! mr-2.5"
        />
        <Breadcrumb className="hidden md:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/search">Used cars</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">{make}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">{model}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{trim}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Share2 />
          <span className="hidden sm:inline">Share</span>
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Printer />
          <span className="hidden sm:inline">Print</span>
        </Button>
      </div>
    </div>
  );
};
