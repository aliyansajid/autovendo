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
import { makes, popularMakes, models } from "@/constants";
import Image from "next/image";

const formSchema = z.object({
  search: z.string().optional(),
});

export function MakeModelDialog() {
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

  const searchQuery = (form.watch("search") || "").toLowerCase();

  function onSubmit(data: z.infer<typeof formSchema>) {
    console.log(data);
  }

  return (
    <Dialog>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <DialogTrigger asChild>
          <Button variant="link">ändern</Button>
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
                    {models[selectedMake.value as keyof typeof models]
                      ?.length ? (
                      (models[selectedMake.value as keyof typeof models] ?? [])
                        .filter((model) =>
                          model.label.toLowerCase().includes(searchQuery),
                        )
                        .map((model) => (
                          <Button
                            key={model.value}
                            variant="ghost"
                            className="w-full flex items-center justify-between text-base py-6 px-2 rounded-none transition-colors"
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
                  {popularMakes.filter((make) =>
                    make.name.toLowerCase().includes(searchQuery),
                  ).length > 0 && (
                    <div className="space-y-3">
                      <FieldLabel>Meistgesuchte marken</FieldLabel>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                        {popularMakes
                          .filter((make) =>
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
                            makes as unknown as {
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
                            !popularMakes.some(
                              (pm) =>
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
                              setSelectedMake({
                                value: make.value,
                                label: make.label,
                              })
                            }
                          >
                            {make.label}
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <span className="text-sm tabular-nums text-muted-foreground/60">
                                {Math.floor(
                                  Math.random() * 50000,
                                ).toLocaleString("de-CH")}
                              </span>
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
        </DialogContent>
      </form>
    </Dialog>
  );
}
