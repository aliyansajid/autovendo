"use client";

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
import { Switch } from "@repo/ui/components/switch";
import { Label } from "@repo/ui/components/label";
import { FieldGroup, FieldLabel } from "@repo/ui/components/field";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/components/custom-form-field";
import { ChevronRight, Search, ChevronLeft, Check, X } from "lucide-react";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { carMakes, popularCarMakes, carModels } from "@repo/vehicle-constants";
import Image from "next/image";
import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { formatCount } from "@repo/ui/lib/helpers/format";

const formSchema = z.object({
  search: z.string().optional(),
});

function getAllMakes(): { value: string; label: string }[] {
  const items = carMakes.flatMap((group) => [...group.items]);
  return Array.from(
    new Map(items.map((item) => [item.value, item] as const)).values(),
  ) as { value: string; label: string }[];
}

const nameToMakeValue = (name: string) => {
  let value = name.toLowerCase();
  if (name === "VW") value = "volkswagen";
  if (name === "Mercedes-Benz") value = "mercedes";
  return value;
};

// ─── Public types ────────────────────────────────────────────────────────────

export interface MakeModelValue {
  includes: string[];
  excludes: string[];
  models: string[];
}

interface MakeModelDialogProps {
  makeCounts?: Record<string, number>;
  // Controlled mode — used by advanced search (no URL routing)
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  value?: MakeModelValue;
  onChange?: (value: MakeModelValue) => void;
  defaultExcludeMode?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function MakeModelDialog({
  makeCounts,
  open,
  onOpenChange,
  value,
  onChange,
  defaultExcludeMode = false,
}: MakeModelDialogProps) {
  const t = useTranslations("AdvancedSearch.FiltersSidebar.dialogs.makeModel");
  const tCommon = useTranslations("AdvancedSearch.FiltersSidebar.dialogs");
  const isControlled = onChange !== undefined;

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();


  // Uncontrolled (URL) mode state
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [urlIncludes, setUrlIncludes] = useState<string[]>([]);
  const [urlModels, setUrlModels] = useState<string[]>([]);

  // Shared UI state
  const [isExcludeMode, setIsExcludeMode] = useState(defaultExcludeMode);
  const [currentMake, setCurrentMake] = useState<{
    value: string;
    label: string;
  } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { search: "" },
  });
  const searchQuery = (form.watch("search") || "").toLowerCase();

  // Derived values — single source of truth for rendering
  const effectiveIncludes = isControlled
    ? (value?.includes ?? [])
    : urlIncludes;
  const effectiveExcludes = isControlled ? (value?.excludes ?? []) : [];
  const effectiveModels = isControlled ? (value?.models ?? []) : urlModels;

  // Sync URL → state (URL mode only)
  useEffect(() => {
    if (isControlled) return;
    const makeParam = searchParams.get("make");
    const modelParam = searchParams.get("model");
    setUrlIncludes(
      makeParam
        ? makeParam
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    );
    setUrlModels(
      modelParam
        ? modelParam
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    );
  }, [searchParams, uncontrolledOpen, isControlled]);

  const applyChange = (
    includes: string[],
    excludes: string[],
    models: string[],
  ) => {
    if (isControlled) {
      onChange!({ includes, excludes, models });
    } else {
      const params = new URLSearchParams(searchParams.toString());
      if (includes.length > 0) params.set("make", includes.join(","));
      else params.delete("make");
      if (models.length > 0) params.set("model", models.join(","));
      else params.delete("model");
      params.delete("page");
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }
  };

  const getMakeState = (
    makeValue: string,
  ): "included" | "excluded" | "none" => {
    if (effectiveIncludes.includes(makeValue)) return "included";
    if (effectiveExcludes.includes(makeValue)) return "excluded";
    return "none";
  };

  const handleMakeClick = (make: { value: string; label: string }) => {
    let nextIncludes = [...effectiveIncludes];
    let nextExcludes = [...effectiveExcludes];

    if (isExcludeMode && isControlled) {
      if (nextExcludes.includes(make.value)) {
        nextExcludes = nextExcludes.filter((m) => m !== make.value);
      } else {
        nextExcludes = [...nextExcludes, make.value];
        nextIncludes = nextIncludes.filter((m) => m !== make.value);
      }
    } else {
      if (nextIncludes.includes(make.value)) {
        nextIncludes = nextIncludes.filter((m) => m !== make.value);
        if (currentMake?.value === make.value) setCurrentMake(null);
      } else {
        nextIncludes = [...nextIncludes, make.value];
        nextExcludes = nextExcludes.filter((m) => m !== make.value);
        setCurrentMake(make);
      }
    }

    if (!isControlled) setUrlIncludes(nextIncludes);
    applyChange(nextIncludes, nextExcludes, effectiveModels);
  };

  const toggleModel = (modelValue: string) => {
    const nextModels = effectiveModels.includes(modelValue)
      ? effectiveModels.filter((m) => m !== modelValue)
      : [...effectiveModels, modelValue];
    if (!isControlled) setUrlModels(nextModels);
    applyChange(effectiveIncludes, effectiveExcludes, nextModels);
  };

  const handleBack = () => setCurrentMake(null);

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
      ? (carModels[currentMake.value as keyof typeof carModels] ?? []).filter(
          (m: { value: string; label: string }) =>
            m.label.toLowerCase().includes(searchQuery),
        )
      : [];

  // Open / close handling
  const isOpen = isControlled ? (open ?? false) : uncontrolledOpen;
  const handleOpenChange = (next: boolean) => {
    if (isControlled) {
      onOpenChange?.(next);
    } else {
      setUncontrolledOpen(next);
    }
    if (!next) {
      setCurrentMake(null);
      setIsExcludeMode(defaultExcludeMode);
      form.reset();
    }
  };

  // Sync exclude mode whenever the dialog opens (handles dynamic defaultExcludeMode)
  useEffect(() => {
    if (isOpen) {
      setIsExcludeMode(defaultExcludeMode);
    }
  }, [isOpen, defaultExcludeMode]);

  const dialogContent = (
    <DialogContent>
      <DialogHeader>
        <div className="flex items-center justify-between">
          <DialogTitle>{t("title")}</DialogTitle>
          {isControlled && (
            <div className="flex items-center gap-2 pr-6">
              <Switch
                id="exclude-toggle"
                checked={isExcludeMode}
                onCheckedChange={setIsExcludeMode}
                disabled={defaultExcludeMode}
              />
              <Label
                htmlFor="exclude-toggle"
                className={`text-sm font-medium ${defaultExcludeMode ? "cursor-default" : "cursor-pointer"} ${isExcludeMode ? "text-destructive" : "text-muted-foreground"}`}
              >
                {t("excludeCars")}
              </Label>
            </div>
          )}
        </div>
        <DialogDescription>
          {showModelStep
            ? t("modelsFor", { make: currentMake?.label })
            : isExcludeMode
              ? t("excludeSelect")
              : t("includeSelect")}
        </DialogDescription>
      </DialogHeader>

      <FieldGroup>
        <CustomFormField
          control={form.control}
          fieldType={FormFieldType.INPUT_GROUP}
          name="search"
          placeholder={t("searchPlaceholder")}
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
                  aria-label={t("backToMakes")}
                >
                  <ChevronLeft className="h-5 w-5" />
                </span>
                <h3 className="font-semibold text-base">
                  {t("titleWithModels", { make: currentMake?.label })}
                </h3>
              </div>
              <div className="divide-y divide-border">
                {modelsForCurrentMake.length > 0 ? (
                  modelsForCurrentMake.map(
                    (model: { value: string; label: string }) => {
                      const isSelected = effectiveModels.includes(model.value);
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
                    {t("noModelsFound")}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {popularFiltered.length > 0 && (
                <div className="space-y-3">
                  <FieldLabel>{t("popularMakes")}</FieldLabel>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                    {popularFiltered.map(
                      (make: { name: string; logo: string }) => {
                        const makeValue = nameToMakeValue(make.name);
                        const state = getMakeState(makeValue);
                        return (
                          <Button
                            key={make.name}
                            variant={state !== "none" ? "default" : "outline"}
                            title={make.name}
                            className={`h-auto aspect-square relative ${
                              state === "excluded"
                                ? "bg-destructive/10 border-destructive hover:bg-destructive/20"
                                : ""
                            }`}
                            onClick={() =>
                              handleMakeClick({
                                value: makeValue,
                                label: make.name,
                              })
                            }
                          >
                            {state !== "none" && (
                              <span className="absolute top-1 right-1 rounded-full bg-primary-foreground p-0.5">
                                {state === "excluded" ? (
                                  <X className="h-3 w-3 text-destructive" />
                                ) : (
                                  <Check className="h-3 w-3 text-primary" />
                                )}
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
                <FieldLabel>{t("allMakes")}</FieldLabel>
                <div className="divide-y divide-border">
                  {filteredMakes
                    .sort((a, b) => a.label.localeCompare(b.label))
                    .map((make) => {
                      const state = getMakeState(make.value);
                      return (
                        <button
                          key={make.value}
                          type="button"
                          className={`w-full flex items-center justify-between text-base py-4 px-2 rounded-none transition-colors hover:bg-muted/50 text-left ${
                            state === "included"
                              ? "bg-primary/10"
                              : state === "excluded"
                                ? "bg-destructive/10"
                                : ""
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
                            {state === "included" ? (
                              <Check className="h-5 w-5 text-primary shrink-0" />
                            ) : state === "excluded" ? (
                              <X className="h-5 w-5 text-destructive shrink-0" />
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
  );

  if (isControlled) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <span className="text-primary font-medium hover:underline cursor-pointer">
          {tCommon("change")}
        </span>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}
