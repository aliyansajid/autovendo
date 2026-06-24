import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { router } from "expo-router";
import type { Filters } from "./advanced-filter";
import type { VehicleFacets } from "@/lib/api";

// Drives the `/filter` and `/filter-make` modal routes. Payloads (the draft
// filters, facets, and result callbacks) are passed through context rather than
// route params so we never serialize large objects into the URL.
export type FilterPayload = {
  filters: Filters;
  facets: VehicleFacets | null;
  onApply: (f: Filters) => void;
};

export type MakePayload = {
  includes: string[];
  excludes: string[];
  onChange: (includes: string[], excludes: string[]) => void;
};

type Ctx = {
  filter: FilterPayload | null;
  make: MakePayload | null;
  openFilter: (p: FilterPayload) => void;
  openMake: (p: MakePayload) => void;
};

const FilterModalContext = createContext<Ctx | null>(null);

export function FilterModalProvider({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState<FilterPayload | null>(null);
  const [make, setMake] = useState<MakePayload | null>(null);

  const openFilter = useCallback((p: FilterPayload) => {
    setFilter(p);
    router.push("/filter");
  }, []);

  const openMake = useCallback((p: MakePayload) => {
    setMake(p);
    router.push("/filter-make");
  }, []);

  return (
    <FilterModalContext.Provider value={{ filter, make, openFilter, openMake }}>
      {children}
    </FilterModalContext.Provider>
  );
}

export function useFilterModal() {
  const ctx = useContext(FilterModalContext);
  if (!ctx) throw new Error("useFilterModal must be used within a FilterModalProvider");
  return ctx;
}
