import { MakeSheet } from "@/components/search/advanced-filter";

// Presentation + default header are configured on the "filter-make" Stack.Screen
// in app/_layout.tsx. Reads its payload from the FilterModalProvider.
export default function FilterMakeScreen() {
  return <MakeSheet />;
}
