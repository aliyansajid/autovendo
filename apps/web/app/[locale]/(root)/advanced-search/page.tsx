import type { Metadata } from "next";
import { buildMetadata, PAGE_META } from "@/lib/seo";
import { AdvancedSearchForm } from "./_components/advanced-search-form";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  return buildMetadata(locale, "/advanced-search", PAGE_META.advancedSearch);
}

export default function AdvancedSearchPage() {
  return <AdvancedSearchForm />;
}
