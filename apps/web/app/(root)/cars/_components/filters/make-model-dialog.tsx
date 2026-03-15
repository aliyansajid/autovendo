import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { ChevronRight, Search, ChevronLeft, Check } from "lucide-react";
import { ScrollArea } from "@repo/ui/src/components/scroll-area";
import { carMakes, popularCarMakes, carModels } from "@/constants/cars";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const formSchema = z.object({
  search: z.string().optional(),
});

function formatCount(n: number) {
  return new Intl.NumberFormat("de-CH").format(n);
}

function getAllMakes(): { value: string; label: string }[] {
  const items = carMakes.flatMap((group) => [...group.items]);
  return Array.from(
    new Map(items.map((item) => [item.value, item] as const)).values(),
  ) as { value: string; label: string }[];
}

export function MakeModelDialog({
  makeCounts,
}: {
  makeCounts?: Record<string, number>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const [selectedMakes, setSelectedMakes] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [currentMake, setCurrentMake] = useState<{
    value: string;
    label: string;
  } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { search: "" },
  });

  const searchQuery = (form.watch("search") || "").toLowerCase();

  useEffect(() => {
    const makeParam = searchParams.get("make");
    const modelParam = searchParams.get("model");
    setSelectedMakes(
      makeParam ? makeParam.split(",").map((s) => s.trim()).filter(Boolean) : [],
    );
    setSelectedModels(
      modelParam
        ? modelParam.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
    );
  }, [searchParams, open]);

  const applyFilters = (makes: string[], models: string[], close = false) => {
    const params = new URLSearchParams(searchParams.toString());
    if (makes.length > 0) params.set("make", makes.join(","));
    else params.delete("make");
    if (models.length > 0) params.set("model", models.join(","));
    else params.delete("model");
    params.delete("page");
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
    if (close) setOpen(false);
  };

  const handleMakeClick = (make: { value: string; label: string }) => {
    const isSelected = selectedMakes.includes(make.value);
    if (isSelected) {
      const next = selectedMakes.filter((m) => m !== make.value);
      setSelectedMakes(next);
      applyFilters(next, selectedModels, false);
      if (currentMake?.value === make.value) setCurrentMake(null);
    } else {
      const next = [...selectedMakes, make.value];
      setSelectedMakes(next);
      applyFilters(next, selectedModels, false);
      setCurrentMake(make);
    }
  };

  const toggleModel = (value: string) => {
    const next = selectedModels.includes(value)
      ? selectedModels.filter((m) => m !== value)
      : [...selectedModels, value];
    setSelectedModels(next);
    applyFilters(selectedMakes, next, false);
  };

  const handleBack = () => {
    setCurrentMake(null);
  };

  const nameToMakeValue = (name: string) => {
    let value = name.toLowerCase();
    if (name === "VW") value = "volkswagen";
    if (name === "Mercedes-Benz") value = "mercedes";
    return value;
  };

  const allMakes = getAllMakes();
  const filteredMakes = allMakes.filter((m) =>
    m.label.toLowerCase().includes(searchQuery),
  );
  const popularFiltered = popularCarMakes.filter((m) =>
    m.name.toLowerCase().includes(searchQuery),
  );

  const showModelStep = currentMake !== null;
  const modelsForCurrentMake =
    currentMake && carModels[currentMake.value as keyof typeof carModels]
      ? (
          carModels[currentMake.value as keyof typeof carModels] ?? []
        ).filter((m: { value: string; label: string }) =>
          m.label.toLowerCase().includes(searchQuery),
        )
      : [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <span className="text-primary font-medium hover:underline cursor-pointer">
          ändern
        </span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Marke & Modell</DialogTitle>
          <DialogDescription>
            {showModelStep
              ? `Modelle für ${currentMake?.label} – Klicken zum An- oder Abwählen.`
              : "Marke(n) anklicken (nochmal = Abwählen). Mit Pfeil öffnen Sie die Modellauswahl."}
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
            {showModelStep ? (
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={handleBack}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleBack();
                      }
                    }}
                    className="cursor-pointer p-1 -m-1 rounded hover:bg-muted"
                    aria-label="Zurück zu Marken"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </span>
                  <h3 className="font-semibold text-base">
                    {currentMake?.label} – Modelle
                  </h3>
                </div>
                <div className="divide-y divide-border">
                  {modelsForCurrentMake.length > 0 ? (
                    modelsForCurrentMake.map(
                      (model: { value: string; label: string }) => {
                        const isSelected = selectedModels.includes(model.value);
                        return (
                          <button
                            key={model.value}
                            type="button"
                            className={`w-full flex items-center justify-between text-base py-4 px-2 rounded-none transition-colors hover:bg-muted/50 text-left ${
                              isSelected ? "bg-primary/10" : ""
                            }`}
                            onClick={() => toggleModel(model.value)}
                          >
                            {model.label}
                            {isSelected && (
                              <Check className="h-5 w-5 text-primary shrink-0" />
                            )}
                          </button>
                        );
                      },
                    )
                  ) : (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      Keine Modelle gefunden.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {popularFiltered.length > 0 && (
                  <div className="space-y-3">
                    <FieldLabel>Meistgesuchte marken</FieldLabel>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                      {popularFiltered.map(
                        (make: { name: string; logo: string }) => {
                          const value = nameToMakeValue(make.name);
                          const isSelected = selectedMakes.includes(value);
                          return (
                            <Button
                              key={make.name}
                              variant={isSelected ? "default" : "outline"}
                              title={make.name}
                              className="h-auto aspect-square relative"
                              onClick={() =>
                                handleMakeClick({ value, label: make.name })
                              }
                            >
                              {isSelected && (
                                <span className="absolute top-1 right-1 rounded-full bg-primary-foreground p-0.5">
                                  <Check className="h-3 w-3 text-primary" />
                                </span>
                              )}
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
                                <span className="text-xs font-bold text-center">
                                  {make.name}
                                </span>
                              )}
                            </Button>
                          );
                        },
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <FieldLabel>Alle marken</FieldLabel>
                  <div className="divide-y divide-border">
                    {filteredMakes
                      .sort((a, b) => a.label.localeCompare(b.label))
                      .map((make) => {
                        const isSelected = selectedMakes.includes(make.value);
                        return (
                          <button
                            key={make.value}
                            type="button"
                            className={`w-full flex items-center justify-between text-base py-4 px-2 rounded-none transition-colors hover:bg-muted/50 text-left ${
                              isSelected ? "bg-primary/10" : ""
                            }`}
                            onClick={() => handleMakeClick(make)}
                          >
                            {make.label}
                            <div className="flex items-center gap-2 text-muted-foreground">
                              {(() => {
                              const count = makeCounts?.[make.value];
                              return count != null ? (
                                <span className="text-sm tabular-nums">
                                  {formatCount(count)}
                                </span>
                              ) : null;
                            })()}
                              {isSelected ? (
                                <Check className="h-5 w-5 text-primary shrink-0" />
                              ) : (
                                <ChevronRight className="h-5 w-5 shrink-0 opacity-60" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </FieldGroup>
      </DialogContent>
    </Dialog>
  );
}
