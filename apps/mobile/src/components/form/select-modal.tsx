import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { router } from "expo-router";
import type { SelectOption } from "./select-field";

// One open select request. Options are dynamic (make depends on vehicle type,
// model on make, …) so we pass them through context rather than route params.
export type SelectRequest = {
  title: string;
  options: SelectOption[];
  value: string | null | undefined;
  optional?: boolean;
  searchable?: boolean;
  onSelect: (value: string) => void;
};

type Ctx = {
  request: SelectRequest | null;
  open: (req: SelectRequest) => void;
};

const SelectModalContext = createContext<Ctx | null>(null);

// Wraps the app so any SelectField can open the shared `/select` modal route.
export function SelectModalProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<SelectRequest | null>(null);

  const open = useCallback((req: SelectRequest) => {
    setRequest(req);
    router.push("/select");
  }, []);

  return (
    <SelectModalContext.Provider value={{ request, open }}>
      {children}
    </SelectModalContext.Provider>
  );
}

export function useSelectModal() {
  const ctx = useContext(SelectModalContext);
  if (!ctx) throw new Error("useSelectModal must be used within a SelectModalProvider");
  return ctx;
}
