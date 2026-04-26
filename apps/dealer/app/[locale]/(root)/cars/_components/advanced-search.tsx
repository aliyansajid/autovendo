"use client";

import { Button } from "@repo/ui/src/components/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui/src/components/sheet";
import { useState } from "react";
import { Filter } from "lucide-react";
import { FiltersSidebar } from "./filters-sidebar";

export function AdvancedSearch() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <div className="w-full">
          <Button variant="outline" className="w-full">
            <Filter /> Advanced Filters
          </Button>
        </div>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl flex flex-col p-0 gap-0 border-0">
        <SheetHeader className="px-6 py-4 border-b bg-background z-10 sticky top-0">
          <SheetTitle>Detail Search</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-hidden">
          <FiltersSidebar onClose={() => setIsOpen(false)} showActions={true} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
