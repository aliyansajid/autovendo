"use client";

import { useFormContext } from "react-hook-form";
import { useState } from "react";
import { PlusCircle, X } from "lucide-react";
import { Button } from "@repo/ui/src/components/button";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/src/components/accordion";
import { Badge } from "@repo/ui/src/components/badge";
import {
  MakeModelDialog,
  type MakeModelValue,
} from "@/app/(root)/cars/_components/filters/make-model-dialog";

export function MakeModelSection() {
  const { watch, setValue } = useFormContext();
  const [open, setOpen] = useState(false);

  const selectedMakes: string[] = watch("make") ?? [];
  const excludedMakes: string[] = watch("excludeMake") ?? [];
  const selectedModels: string[] = watch("model") ?? [];

  const handleChange = (v: MakeModelValue) => {
    setValue("make", v.includes, { shouldDirty: true });
    setValue("excludeMake", v.excludes, { shouldDirty: true });
    setValue("model", v.models, { shouldDirty: true });
  };

  const removeMake = (make: string) => {
    setValue(
      "make",
      selectedMakes.filter((m) => m !== make),
      { shouldDirty: true },
    );
  };

  const removeExclude = (make: string) => {
    setValue(
      "excludeMake",
      excludedMakes.filter((m) => m !== make),
      { shouldDirty: true },
    );
  };

  const hasSelections = selectedMakes.length > 0 || excludedMakes.length > 0;

  return (
    <>
      <AccordionItem value="make" className="border-none">
        <AccordionTrigger className="flex items-center text-xl font-bold text-primary hover:no-underline">
          Marke &amp; Modell
        </AccordionTrigger>
        <AccordionContent className="pt-6 px-1">
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="w-full"
            onClick={() => setOpen(true)}
          >
            <PlusCircle />
            Marke hinzufügen
          </Button>

          <div className="mt-4 space-y-4">
            {selectedMakes.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Fahrzeuge einschliessen
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedMakes.map((make) => (
                    <Badge
                      key={make}
                      variant="secondary"
                      className="text-sm cursor-pointer gap-1 hover:bg-destructive/10"
                      onClick={() => removeMake(make)}
                    >
                      {make}
                      <X className="h-3 w-3" />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {excludedMakes.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-destructive uppercase tracking-wider">
                  Fahrzeuge ausschliessen
                </span>
                <div className="flex flex-wrap gap-2">
                  {excludedMakes.map((make) => (
                    <Badge
                      key={make}
                      variant="destructive"
                      className="text-sm cursor-pointer gap-1"
                      onClick={() => removeExclude(make)}
                    >
                      {make}
                      <X className="h-3 w-3" />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {!hasSelections && (
              <div className="p-8 bg-muted border-2 border-dashed rounded-xl flex items-center justify-center text-muted-foreground">
                Keine Fahrzeuge ausgewählt.
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>

      <MakeModelDialog
        open={open}
        onOpenChange={setOpen}
        value={{
          includes: selectedMakes,
          excludes: excludedMakes,
          models: selectedModels,
        }}
        onChange={handleChange}
      />
    </>
  );
}
