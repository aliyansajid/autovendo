import { useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { FontFamily, FontSize, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Icon } from "@/components/ui/icon";
import { useSelectModal } from "./select-modal";

export type SelectOption = { value: string; label: string; group?: string };

// Labeled row that opens the shared searchable single-select modal (`/select`).
// Used for make, city, body type, and every enum select in the form.
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
  disabled,
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
  disabled?: boolean;
}) {
  const C = useTheme();
  const { open } = useSelectModal();

  const selectedLabel = useMemo(
    () => options.find((o) => o.value === value)?.label ?? null,
    [options, value],
  );

  return (
    <View style={styles.group}>
      <Text style={[styles.label, { color: C.mutedForeground }]}>
        {label}
        {required ? " *" : ""}
      </Text>
      <Pressable
        disabled={disabled}
        style={[styles.control, { backgroundColor: C.secondary, borderColor: error ? C.destructive : C.border, opacity: disabled ? 0.5 : 1 }]}
        onPress={() => open({ title: label, options, value, optional, searchable, onSelect: onChange })}
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
});
