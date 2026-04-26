import { Suspense } from "react";
import { AdvancedSearchForm } from "./_components/advanced-search-form";

export default function AdvancedSearchPage() {
  return (
    <Suspense>
      <AdvancedSearchForm />
    </Suspense>
  );
}
