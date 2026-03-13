import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { FieldGroup, FieldLabel } from "@repo/ui/components/field";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/src/components/custom-form-field";
import { ChevronRight, Search, ChevronLeft } from "lucide-react";
import { ScrollArea } from "@repo/ui/src/components/scroll-area";
import { carMakes, popularCarMakes, carModels } from "@/constants/cars";
import Image from "next/image";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect } from "react";

const formSchema = z.object({
  search: z.string().optional(),
});

function formatCount(n: number) {
  return new Intl.NumberFormat("de-CH").format(n);
}

export function MakeModelDialog({
  makeCounts,
  resultCount,
}: {
  makeCounts?: Record<string, number>;
  resultCount?: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [selectedMake, setSelectedMake] = useState<{
    value: string;
    label: string;
  } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: "",
    },
  });

  // Initialize selectedMake from URL
  useEffect(() => {
    const makeVal = searchParams.get("make");
    if (makeVal && makeVal !== "any") {
      // Find label from constants if possible, but for simplicity:
      setSelectedMake({ value: makeVal, label: makeVal });
    } else {
      setSelectedMake(null);
    }
  }, [searchParams]);

  const searchQuery = (form.watch("search") || "").toLowerCase();

  const handleMakeSelect = (make: { value: string; label: string }) => {
    setSelectedMake(make);
    // If there are no models for this make, we can just apply the make filter
    if (!carModels[make.value as keyof typeof carModels]) {
        applyFilters(make.value, "any");
    }
  };

  const handleModelSelect = (modelValue: string) => {
    if (selectedMake) {
        applyFilters(selectedMake.value, modelValue);
    }
  };

  const applyFilters = (make: string, model: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (make && make !== "any") params.set("make", make);
    else params.delete("make");
    
    if (model && model !== "any") params.set("model", model);
    else params.delete("model");
    
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Dialog>
      <div>
        <DialogTrigger asChild>
          <span className="text-primary font-medium hover:underline cursor-pointer">
            ändern
          </span>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marke & Modell</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT_GROUP}
              name="search"
              placeholder="Suche"
              inputGroupIcon={<Search />}
            />

            <ScrollArea className="h-[60vh]">
              {selectedMake ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setSelectedMake(null)}
                    >
                      <ChevronLeft />
                    </Button>
                    <h3 className="font-semibold text-base">
                      {selectedMake.label} Modelle
                    </h3>
                  </div>
                  <div className="divide-y divide-border">
                    {carModels[selectedMake.value as keyof typeof carModels]
                      ?.length ? (
                      (
                        carModels[
                          selectedMake.value as keyof typeof carModels
                        ] ?? []
                      )
                        .filter((model: { value: string; label: string }) =>
                          model.label.toLowerCase().includes(searchQuery),
                        )
                        .map((model: { value: string; label: string }) => (
                          <Button
                            key={model.value}
                            variant="ghost"
                            className="w-full flex items-center justify-between text-base py-6 px-2 rounded-none transition-colors"
                            onClick={() => handleModelSelect(model.value)}
                          >
                            {model.label}
                          </Button>
                        ))
                    ) : (
                      <div className="p-4 text-center text-muted-foreground text-sm flex-1 mt-10">
                        Keine Modelle gefunden.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {popularCarMakes.filter(
                    (make: { name: string; logo: string }) =>
                      make.name.toLowerCase().includes(searchQuery),
                  ).length > 0 && (
                    <div className="space-y-3">
                      <FieldLabel>Meistgesuchte marken</FieldLabel>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                        {popularCarMakes
                          .filter((make: { name: string; logo: string }) =>
                            make.name.toLowerCase().includes(searchQuery),
                          )
                          .map((make: { name: string; logo: string }) => (
                            <Button
                              key={make.name}
                              variant="outline"
                              title={make.name}
                              className="h-auto aspect-square"
                              onClick={() => {
                                let value = make.name.toLowerCase();
                                if (make.name === "VW") value = "volkswagen";
                                if (make.name === "Mercedes-Benz")
                                  value = "mercedes";
                                setSelectedMake({ value, label: make.name });
                              }}
                            >
                              {make.logo ? (
                                <div className="relative w-full h-full">
                                  <Image
                                    src={make.logo}
                                    alt={make.name}
                                    fill
                                    className="object-contain"
                                  />
                                </div>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted/50 text-xs font-bold text-center rounded-sm">
                                  {make.name}
                                </div>
                              )}
                            </Button>
                          ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <FieldLabel>Alle marken</FieldLabel>
                    <div className="divide-y divide-border">
                      {Array.from(
                        new Map(
                          (
                            carMakes as unknown as {
                              items: readonly {
                                value: string;
                                label: string;
                              }[];
                            }[]
                          )
                            .flatMap((group) => group.items)
                            .map(
                              (item: any) =>
                                [item.value, item] as [string, any],
                            ),
                        ).values(),
                      )
                        .filter(
                          (make: any) =>
                            make.label.toLowerCase().includes(searchQuery) &&
                            !popularCarMakes.some(
                              (pm: { name: string; logo: string }) =>
                                pm.name.toLowerCase() ===
                                  make.label.toLowerCase() ||
                                (pm.name === "VW" &&
                                  make.value === "volkswagen") ||
                                (pm.name === "Mercedes-Benz" &&
                                  make.value === "mercedes"),
                            ),
                        )
                        .sort((a: any, b: any) =>
                          a.label.localeCompare(b.label),
                        )
                        .map((make: any) => (
                          <Button
                            key={make.value}
                            variant="ghost"
                            className="w-full flex items-center justify-between text-base py-6 px-2 rounded-none transition-colors"
                            onClick={() =>
                              handleMakeSelect({
                                value: make.value,
                                label: make.label,
                              })
                            }
                          >
                            {make.label}
                            <div className="flex items-center gap-2 text-muted-foreground">
                              {makeCounts?.[make.value] !== undefined && (
                                <span className="text-sm tabular-nums text-muted-foreground/60">
                                  {formatCount(makeCounts[make.value])}
                                </span>
                              )}
                              <ChevronRight className="text-muted-foreground/60" />
                            </div>
                          </Button>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>
          </FieldGroup>

          {resultCount !== undefined && (
            <div className="pt-2 text-xs text-muted-foreground">
              {formatCount(resultCount)} Angebote
            </div>
          )}
        </DialogContent>
      </div>
    </Dialog>
  );
}
