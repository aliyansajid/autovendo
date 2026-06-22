import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  type KeyboardTypeOptions,
  type ReturnKeyTypeOptions,
} from "react-native";
import { FontFamily, FontSize, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Icon, type IconName } from "./icon";

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  secure,
  keyboardType,
  autoCapitalize = "none",
  autoCorrect = false,
  error,
  returnKeyType,
  onSubmitEditing,
  rightLabel,
  onRightLabelPress,
  multiline,
  editable = true,
}: {
  label?: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  icon?: IconName;
  secure?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  error?: string | null;
  returnKeyType?: ReturnKeyTypeOptions;
  onSubmitEditing?: () => void;
  rightLabel?: string;
  onRightLabelPress?: () => void;
  multiline?: boolean;
  editable?: boolean;
}) {
  const C = useTheme();
  const [focused, setFocused] = useState(false);
  const [reveal, setReveal] = useState(false);

  return (
    <View style={styles.group}>
      {(label || rightLabel) && (
        <View style={styles.labelRow}>
          {label ? <Text style={[styles.label, { color: C.mutedForeground }]}>{label}</Text> : <View />}
          {rightLabel && onRightLabelPress && (
            <Pressable onPress={onRightLabelPress} hitSlop={8}>
              <Text style={[styles.rightLabel, { color: C.primary }]}>{rightLabel}</Text>
            </Pressable>
          )}
        </View>
      )}
      <View
        style={[
          styles.wrap,
          {
            backgroundColor: C.secondary,
            borderColor: error ? C.destructive : focused ? C.primary : C.border,
            height: multiline ? undefined : 52,
            minHeight: multiline ? 96 : undefined,
            alignItems: multiline ? "flex-start" : "center",
            opacity: editable ? 1 : 0.5,
          },
        ]}
      >
        {icon && !multiline && (
          <Icon name={icon} size={17} color={focused ? C.primary : C.mutedForeground} />
        )}
        <TextInput
          style={[styles.input, { color: C.foreground, paddingTop: multiline ? Spacing[3] : 0 }]}
          placeholder={placeholder}
          placeholderTextColor={C.mutedForeground}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          secureTextEntry={secure && !reveal}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          multiline={multiline}
          editable={editable}
        />
        {secure && (
          <Pressable onPress={() => setReveal((r) => !r)} hitSlop={8}>
            <Icon name={reveal ? "eye.slash" : "eye"} size={17} color={C.mutedForeground} />
          </Pressable>
        )}
      </View>
      {error ? <Text style={[styles.error, { color: C.destructive }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: Spacing[2] },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: { fontFamily: FontFamily.sansMedium, fontSize: FontSize.sm },
  rightLabel: { fontFamily: FontFamily.sansMedium, fontSize: FontSize.sm },
  wrap: {
    flexDirection: "row",
    gap: Spacing[3],
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth * 2,
    paddingHorizontal: Spacing[4],
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
  },
  error: { fontFamily: FontFamily.sans, fontSize: FontSize.xs },
});
