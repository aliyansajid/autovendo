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

// Local, account-free favorites. Stores a set of vehicle IDs in secure storage.
// When the user later signs in we can offer to sync these to their account.

type FavoritesContextValue = {
  ids: string[];
  isFavorite: (id: string) => boolean;
  toggle: (id: string) => void;
  ready: boolean;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    storage.get<string[]>(STORAGE_KEYS.favorites).then((saved) => {
      if (!mounted) return;
      if (Array.isArray(saved)) setIds(saved);
      setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev];
      void storage.set(STORAGE_KEYS.favorites, next);
      return next;
    });
  }, []);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      ids,
      ready,
      isFavorite: (id: string) => ids.includes(id),
      toggle,
    }),
    [ids, ready, toggle],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within a FavoritesProvider");
  return ctx;
}
