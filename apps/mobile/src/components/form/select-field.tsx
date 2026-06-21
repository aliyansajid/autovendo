import { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, Modal, TextInput, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontFamily, FontSize, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Icon } from "@/components/ui/icon";

export type SelectOption = { value: string; label: string };

// Labeled row that opens a searchable single-select sheet. Optional values can be
// cleared. Used for make, city, body type, and every enum select in the form.
export function SelectField({
  label,
  value,
  options,
  placeholder = "Auswählen",
  onChange,
  required,
  searchable,
  optional,
  error,
}: {
  label: string;
  value: string | null | undefined;
  options: SelectOption[];
  placeholder?: string;
  onChange: (v: string) => void;
  required?: boolean;
  searchable?: boolean;
  optional?: boolean;
  error?: string | null;
}) {
  const C = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedLabel = useMemo(
    () => options.find((o) => o.value === value)?.label ?? null,
    [options, value],
  );

  const filtered = useMemo(() => {
    if (!query) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  return (
    <View style={styles.group}>
      <Text style={[styles.label, { color: C.mutedForeground }]}>
        {label}
        {required ? " *" : ""}
      </Text>
      <Pressable
        style={[styles.control, { backgroundColor: C.secondary, borderColor: error ? C.destructive : C.border }]}
        onPress={() => {
          setQuery("");
          setOpen(true);
        }}
      >
        <Text
          style={[styles.value, { color: selectedLabel ? C.foreground : C.mutedForeground }]}
          numberOfLines={1}
        >
          {selectedLabel ?? placeholder}
        </Text>
        <Icon name="chevron.down" size={15} color={C.mutedForeground} />
      </Pressable>
      {error ? <Text style={[styles.errorText, { color: C.destructive }]}>{error}</Text> : null}

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)} presentationStyle="pageSheet">
        <View style={[styles.sheet, { backgroundColor: C.background }]}>
          <SafeAreaView edges={["top"]}>
            <View style={[styles.sheetHeader, { borderBottomColor: C.border }]}>
              <Pressable onPress={() => setOpen(false)} hitSlop={10} style={styles.sideBtn}>
                <Icon name="xmark" size={20} color={C.foreground} />
              </Pressable>
              <Text style={[styles.sheetTitle, { color: C.foreground }]} numberOfLines={1}>{label}</Text>
              <View style={styles.sideBtn} />
            </View>
            {searchable && (
              <View style={[styles.searchBar, { backgroundColor: C.secondary }]}>
                <Icon name="magnifyingglass" size={16} color={C.mutedForeground} />
                <TextInput
                  style={[styles.searchInput, { color: C.foreground }]}
                  placeholder="Suchen"
                  placeholderTextColor={C.mutedForeground}
                  value={query}
                  onChangeText={setQuery}
                  autoFocus
                  autoCorrect={false}
                />
              </View>
            )}
          </SafeAreaView>

          <FlatList
            data={filtered}
            keyExtractor={(o) => o.value}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
              optional && !query ? (
                <Pressable
                  style={[styles.row, { borderBottomColor: C.border }]}
                  onPress={() => {
                    onChange("");
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.rowText, { color: C.mutedForeground }]}>Keine Angabe</Text>
                  {!value && <Icon name="checkmark" size={18} color={C.primary} />}
                </Pressable>
              ) : null
            }
            renderItem={({ item }) => (
              <Pressable
                style={[styles.row, { borderBottomColor: C.border }]}
                onPress={() => {
                  onChange(item.value);
                  setOpen(false);
                }}
              >
                <Text style={[styles.rowText, { color: C.foreground }]}>{item.label}</Text>
                {item.value === value && <Icon name="checkmark" size={18} color={C.primary} />}
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: Spacing[2] },
  label: { fontFamily: FontFamily.sansMedium, fontSize: FontSize.sm },
  control: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 52,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth * 2,
    paddingHorizontal: Spacing[4],
  },
  value: { flex: 1, fontFamily: FontFamily.sans, fontSize: FontSize.base },
  errorText: { fontFamily: FontFamily.sans, fontSize: FontSize.xs, marginTop: -Spacing[1] },
  sheet: { flex: 1 },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[3],
    paddingBottom: Spacing[3],
    minHeight: 44,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sideBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  sheetTitle: { flex: 1, textAlign: "center", fontFamily: FontFamily.sansBold, fontSize: FontSize.md },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[2],
    margin: Spacing[5],
    marginBottom: Spacing[2],
    height: 46,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing[4],
  },
  searchInput: { flex: 1, fontFamily: FontFamily.sans, fontSize: FontSize.base, height: 46 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowText: { fontFamily: FontFamily.sansMedium, fontSize: FontSize.base, flex: 1 },
});
