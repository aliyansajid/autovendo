"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/src/components/select";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@repo/ui/src/components/input-group";

const sortOptions = [
  { label: "Standard-Sortierung", value: "relevance" },
  { label: "Preis (niedrigster zuerst)", value: "price-asc" },
  { label: "Preis (höchster zuerst)", value: "price-desc" },
  { label: "Kilometerstand (niedrigster zuerst)", value: "kilometer-asc" },
  { label: "Kilometerstand (höchster zuerst)", value: "kilometer-desc" },
  { label: "Erstzulassung (älteste zuerst)", value: "registration-asc" },
  { label: "Erstzulassung (jüngste zuerst)", value: "registration-desc" },
  { label: "Inserate (älteste zuerst)", value: "created-asc" },
  { label: "Inserate (neueste zuerst)", value: "created-desc" },
] as const;

export function ListingControls({
  initialSearch,
  initialSort,
  debounceMs = 250,
}: {
  initialSearch: string;
  initialSort: string;
  debounceMs?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState(initialSort);

  // Keep local state in sync with back/forward navigation.
  useEffect(() => {
    setSearch(sp.get("search") ?? "");
    setSort(sp.get("sort") ?? "relevance");
  }, [sp]);

  const nextBase = useMemo(() => new URLSearchParams(sp.toString()), [sp]);

  // Debounced URL update for search (AJAX RSC navigation).
  useEffect(() => {
    const timer = setTimeout(() => {
      const next = new URLSearchParams(nextBase.toString());
      if (search.trim()) next.set("search", search.trim());
      else next.delete("search");
      // Reset to page 1 on search, but don't add page=1 to URL
      next.delete("page");

      const queryString = next.toString();
      const currentQueryString = window.location.search.replace(/^\?/, "");

      if (queryString !== currentQueryString) {
        startTransition(() => {
          router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
        });
      }
    }, debounceMs);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, debounceMs, pathname, router, nextBase]);

  function onSortChange(value: string) {
    setSort(value);
    const next = new URLSearchParams(sp.toString());
    next.set("sort", value);
    // Reset to page 1 on sort, but don't add page=1 to URL
    next.delete("page");

    const queryString = next.toString();
    startTransition(() => {
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    });
  }

  return (
    <div className="flex items-center gap-3 w-full">
      <InputGroup className={isPending ? "opacity-80" : undefined}>
        <InputGroupInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Suchen…"
          aria-label="Fahrzeuge suchen"
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
      </InputGroup>

      <Select value={sort} onValueChange={onSortChange}>
        <SelectTrigger aria-label="Sortieren">
          <SelectValue placeholder="Sortieren nach" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

