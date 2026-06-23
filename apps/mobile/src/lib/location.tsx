import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { storage, STORAGE_KEYS } from "./storage";

// Local, account-free location preference. `null` means "Ganze Schweiz"
// (whole Switzerland). Persisted in secure storage so it survives restarts.

export type SelectedLocation = { value: string; label: string } | null;

type LocationContextValue = {
  location: SelectedLocation;
  setLocation: (loc: SelectedLocation) => void;
  ready: boolean;
};

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLoc] = useState<SelectedLocation>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    storage.get<SelectedLocation>(STORAGE_KEYS.location).then((saved) => {
      if (!mounted) return;
      if (saved && typeof saved === "object" && "value" in saved) setLoc(saved);
      setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const setLocation = useCallback((loc: SelectedLocation) => {
    setLoc(loc);
    if (loc) void storage.set(STORAGE_KEYS.location, loc);
    else void storage.remove(STORAGE_KEYS.location);
  }, []);

  const value = useMemo<LocationContextValue>(
    () => ({ location, setLocation, ready }),
    [location, setLocation, ready],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used within a LocationProvider");
  return ctx;
}
