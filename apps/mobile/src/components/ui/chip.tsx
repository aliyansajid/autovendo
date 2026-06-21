import { Pressable, StyleSheet, Text } from "react-native";
import { FontFamily, FontSize, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Icon, type IconName } from "./icon";

export function Chip({
  label,
  selected,
  onPress,
  icon,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
}) {
  const C = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? C.primary : C.secondary,
          borderColor: selected ? C.primary : C.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      {icon && (
        <Icon name={icon} size={14} color={selected ? C.primaryForeground : C.mutedForeground} weight="medium" />
      )}
      <Text
        style={[
          styles.label,
          { color: selected ? C.primaryForeground : C.foreground },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[1],
    paddingHorizontal: Spacing[4],
    height: 38,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  label: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.sm,
  },
});
