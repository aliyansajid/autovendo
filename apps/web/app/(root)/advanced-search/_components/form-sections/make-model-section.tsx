"use client";

import { useFormContext } from "react-hook-form";
import { useState } from "react";
import { PlusCircle, MinusCircle } from "lucide-react";
import { Button } from "@repo/ui/src/components/button";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/src/components/accordion";
import { Badge } from "@repo/ui/src/components/badge";
import { MakeSelectorDialog } from "@/components/make-selector-dialog";
import { MakeExclusionDialog } from "@/components/make-exclusion-dialog";

export function MakeModelSection() {
  const { watch, setValue } = useFormContext();
  const [isMakeModalOpen, setIsMakeModalOpen] = useState(false);
  const [isExclusionModalOpen, setIsExclusionModalOpen] = useState(false);
  const [excludedMakes, setExcludedMakes] = useState<string[]>([]);

  const selectedMakes: string[] = watch("make") ?? [];

  const handleMakeSelect = (make: string) => {
    if (!selectedMakes.includes(make)) {
      setValue("make", [...selectedMakes, make], { shouldDirty: true });
    }
    setIsMakeModalOpen(false);
  };

  const handleMakeExclusion = (make: string) => {
    setExcludedMakes((prev) => (prev.includes(make) ? prev : [...prev, make]));
    setIsExclusionModalOpen(false);
  };

  const removeMake = (make: string) => {
    setValue(
      "make",
      selectedMakes.filter((m) => m !== make),
      { shouldDirty: true },
    );
  };

  return (
    <>
      <AccordionItem value="make" className="border-none">
        <AccordionTrigger className="flex items-center text-xl font-bold text-primary hover:no-underline">
          Marke & Modell
        </AccordionTrigger>
        <AccordionContent className="pt-6">
          <div className="flex flex-row gap-2">
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="flex-1"
              onClick={() => setIsMakeModalOpen(true)}
            >
              <PlusCircle />
              Hinzufügen
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="flex-1"
              onClick={() => setIsExclusionModalOpen(true)}
            >
              <MinusCircle />
              Ausschliessen
            </Button>
          </div>

          <div className="mt-4 space-y-4">
            {selectedMakes.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase">
                  Include
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedMakes.map((make) => (
                    <Badge
                      key={make}
                      variant="secondary"
                      className="text-sm cursor-pointer hover:bg-destructive/20"
                      onClick={() => removeMake(make)}
                    >
                      {make}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {excludedMakes.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-red-500 uppercase tracking-wider">
                  Exclude
                </span>
                <div className="flex flex-wrap gap-2">
                  {excludedMakes.map((make) => (
                    <Badge key={make} variant="destructive" className="text-sm">
                      {make}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {selectedMakes.length === 0 && excludedMakes.length === 0 && (
              <div className="p-8 bg-muted border-2 border-dashed rounded-xl flex items-center justify-center text-muted-foreground">
                Keine Fahrzeuge ausgewählt.
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>

      <MakeSelectorDialog
        open={isMakeModalOpen}
        onOpenChange={setIsMakeModalOpen}
        onSelect={handleMakeSelect}
      />

      <MakeExclusionDialog
        open={isExclusionModalOpen}
        onOpenChange={setIsExclusionModalOpen}
        onSelect={handleMakeExclusion}
      />
    </>
  );
}
