import { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, FlatList } from "react-native";
import { Stack, router } from "expo-router";
import { FontFamily, FontSize, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Icon } from "@/components/ui/icon";
import { SearchField } from "@/components/ui/search-field";
import { useSelectModal, type SelectRequest } from "@/components/form/select-modal";

// Shared single-select modal. Presentation + header come from the default
// Expo Router modal (registered in app/_layout.tsx) — no custom header styling.
// Only the option list below is styled.
export default function SelectModalScreen() {
  const C = useTheme();
  const { request } = useSelectModal();
  const [query, setQuery] = useState("");

  if (!request) return null;

  return <SelectContent request={request} query={query} setQuery={setQuery} C={C} />;
}

function SelectContent({
  request,
  query,
  setQuery,
  C,
}: {
  request: SelectRequest;
  query: string;
  setQuery: (q: string) => void;
  C: ReturnType<typeof useTheme>;
}) {
  const { title, options, value, optional, searchable, onSelect } = request;

  const filtered = useMemo(() => {
    if (!query) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  // Flatten into header + item rows so grouped options (e.g. makes:
  // "Top-Marken" / "Alle Marken") render section headers on group transitions.
  const rows = useMemo(() => {
    const out: (
      | { kind: "header"; key: string; label: string }
      | { kind: "item"; key: string; option: (typeof options)[number] }
    )[] = [];
    let last: string | undefined;
    for (const o of filtered) {
      if (o.group && o.group !== last) {
        out.push({ kind: "header", key: `__h:${o.group}`, label: o.group });
        last = o.group;
      }
      out.push({ kind: "item", key: o.value, option: o });
    }
    return out;
  }, [filtered]);

  const pick = (v: string) => {
    onSelect(v);
    router.back();
  };

  return (
    <View style={[styles.sheet, { backgroundColor: C.background }]}>
      <Stack.Screen
        options={{
          title,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <Icon name="xmark" size={20} color={C.foreground} />
            </Pressable>
          ),
        }}
      />

      {searchable && (
        <SearchField
          style={styles.search}
          placeholder="Suchen"
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
      )}

      <FlatList
        data={rows}
        keyExtractor={(r) => r.key}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          optional && !query ? (
            <Pressable style={[styles.row, { borderBottomColor: C.border }]} onPress={() => pick("")}>
              <Text style={[styles.rowText, { color: C.mutedForeground }]}>Keine Angabe</Text>
              {!value && <Icon name="checkmark" size={18} color={C.primary} />}
            </Pressable>
          ) : null
        }
        renderItem={({ item }) => {
          if (item.kind === "header") {
            return (
              <View style={[styles.groupHeader, { backgroundColor: C.secondary }]}>
                <Text style={[styles.groupHeaderText, { color: C.mutedForeground }]}>{item.label}</Text>
              </View>
            );
          }
          const o = item.option;
          return (
            <Pressable style={[styles.row, { borderBottomColor: C.border }]} onPress={() => pick(o.value)}>
              <Text style={[styles.rowText, { color: C.foreground }]}>{o.label}</Text>
              {o.value === value && <Icon name="checkmark" size={18} color={C.primary} />}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: { flex: 1 },
  search: { margin: Spacing[5], marginBottom: Spacing[2] },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowText: { fontFamily: FontFamily.sansMedium, fontSize: FontSize.base, flex: 1 },
  groupHeader: {
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[2],
  },
  groupHeaderText: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
