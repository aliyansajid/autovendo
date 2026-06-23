import { useMemo, useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, FlatList } from "react-native";
import { router, Stack } from "expo-router";
import { swissCities } from "@repo/vehicle-constants";
import { FontFamily, FontSize, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useLocation, type SelectedLocation } from "@/lib/location";
import { Icon } from "@/components/ui/icon";

const CITIES = swissCities as { value: string; label: string }[];

export default function LocationScreen() {
  const C = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const { location, setLocation } = useLocation();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? CITIES.filter((c) => c.label.toLowerCase().includes(q)) : CITIES;
  }, [query]);

  const pick = (loc: SelectedLocation) => {
    setLocation(loc);
    router.back();
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: true, title: "Standort" }} />

      <View style={styles.searchPad}>
        <View style={[styles.searchBar, { backgroundColor: C.secondary }]}>
          <Icon name="magnifyingglass" size={16} color={C.mutedForeground} />
          <TextInput
            style={[styles.input, { color: C.foreground }]}
            placeholder="Ort suchen"
            placeholderTextColor={C.mutedForeground}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            autoFocus
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <Icon name="xmark.circle.fill" size={16} color={C.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(c) => c.value}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          query.length === 0 ? (
            <Pressable style={[styles.row, { borderBottomColor: C.border }]} onPress={() => pick(null)}>
              <Text style={[styles.rowText, { color: C.foreground }]}>Ganze Schweiz</Text>
              {location == null && <Icon name="checkmark" size={18} color={C.primary} />}
            </Pressable>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable style={[styles.row, { borderBottomColor: C.border }]} onPress={() => pick(item)}>
            <Text style={[styles.rowText, { color: C.foreground }]}>{item.label}</Text>
            {location?.value === item.value && <Icon name="checkmark" size={18} color={C.primary} />}
          </Pressable>
        )}
      />
    </View>
  );
}

function createStyles(C: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: C.background },
    searchPad: { paddingHorizontal: Spacing[5], paddingTop: Spacing[3], paddingBottom: Spacing[2] },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing[2],
      height: 46,
      borderRadius: Radius.md,
      paddingHorizontal: Spacing[3],
    },
    input: { flex: 1, fontFamily: FontFamily.sans, fontSize: FontSize.base, height: 46 },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: Spacing[5],
      paddingVertical: Spacing[4],
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    rowText: { fontFamily: FontFamily.sansMedium, fontSize: FontSize.base },
  });
}
