import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  type ReturnKeyTypeOptions,
} from "react-native";
import { FontFamily, FontSize, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Icon } from "./icon";

// Borderless filled search pill (magnifying glass + optional clear button).
// Shared across the search tab, dealers, location picker, and the select/make
// modal sheets so every search input looks and behaves the same.
export function SearchField({
  value,
  onChangeText,
  placeholder = "Suchen",
  autoFocus,
  returnKeyType,
  onSubmitEditing,
  onClear,
  style,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  returnKeyType?: ReturnKeyTypeOptions;
  onSubmitEditing?: () => void;
  /** When provided, a clear (✕) button shows while the field is non-empty. */
  onClear?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const C = useTheme();
  return (
    <View style={[styles.bar, { backgroundColor: C.secondary }, style]}>
      <Icon name="magnifyingglass" size={17} color={C.mutedForeground} />
      <TextInput
        style={[styles.input, { color: C.foreground }]}
        placeholder={placeholder}
        placeholderTextColor={C.mutedForeground}
        value={value}
        onChangeText={onChangeText}
        autoFocus={autoFocus}
        autoCorrect={false}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
      />
      {onClear && value.length > 0 && (
        <Pressable onPress={onClear} hitSlop={8}>
          <Icon name="xmark.circle.fill" size={16} color={C.mutedForeground} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[2],
    height: 46,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing[3],
  },
  input: { flex: 1, fontFamily: FontFamily.sans, fontSize: FontSize.base, height: 46 },
});
