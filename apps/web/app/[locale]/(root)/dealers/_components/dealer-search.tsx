"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@repo/ui/src/components/input-group";
import { useTranslations } from "next-intl";

export function DealerSearch({ initialSearch }: { initialSearch: string }) {
  const t = useTranslations("DealersList");
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [search, setSearch] = useState(initialSearch);

  useEffect(() => {
    setSearch(sp.get("q") ?? "");
  }, [sp]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const next = new URLSearchParams(sp.toString());
      if (search.trim()) next.set("q", search.trim());
      else next.delete("q");
      if (search.trim() !== (sp.get("q") ?? "").trim()) next.delete("page");
      const qs = next.toString();
      const currentQs = window.location.search.replace(/^\?/, "");
      if (qs !== currentQs) {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search, sp, pathname, router]);

  return (
    <InputGroup className="w-full md:w-96">
      <InputGroupInput
        placeholder={t("searchPlaceholder")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <InputGroupAddon>
        <Search className="size-4" />
      </InputGroupAddon>
    </InputGroup>
  );
}
