import { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { FontFamily, FontSize, Radius, Spacing, type ThemeColors } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Icon, type IconName } from "./icon";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  icon,
  disabled,
  loading,
  fullWidth,
  style,
}: {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const C = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);

  const isDisabled = disabled || loading;
  const heights: Record<Size, number> = { sm: 38, md: 48, lg: 54 };
  const fontSizes: Record<Size, number> = { sm: FontSize.sm, md: FontSize.base, lg: FontSize.md };

  const palette: Record<Variant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: C.primary, fg: C.primaryForeground },
    secondary: { bg: C.secondary, fg: C.foreground },
    outline: { bg: "transparent", fg: C.foreground, border: C.border },
    ghost: { bg: "transparent", fg: C.primary },
  };
  const p = palette[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          height: heights[size],
          backgroundColor: p.bg,
          borderColor: p.border ?? "transparent",
          borderWidth: p.border ? StyleSheet.hairlineWidth * 2 : 0,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
          alignSelf: fullWidth ? "stretch" : "auto",
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <View style={styles.content}>
          {icon && <Icon name={icon} size={size === "lg" ? 20 : 17} color={p.fg} weight="semibold" />}
          <Text style={[styles.label, { color: p.fg, fontSize: fontSizes[size] }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

function createStyles(_C: ThemeColors) {
  return StyleSheet.create({
    base: {
      borderRadius: Radius.md,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: Spacing[5],
      flexDirection: "row",
    },
    content: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing[2],
    },
    label: {
      fontFamily: FontFamily.sansSemiBold,
      letterSpacing: 0.2,
    },
  });
}
