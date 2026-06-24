import { AdvancedFilter } from "@/components/search/advanced-filter";

// Presentation + default header are configured on the "filter" Stack.Screen in
// app/_layout.tsx. The screen reads its payload from the FilterModalProvider.
export default function FilterScreen() {
  return <AdvancedFilter />;
}
