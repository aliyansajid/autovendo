import { StyleSheet, Text, View } from "react-native";
import { FontFamily, FontSize, Radius, Shadow, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Icon, type IconName } from "./icon";

// Elevated icon tile used in the vehicle-detail spec grid:
// small icon top-left, muted label, bold value.
export function SpecTile({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) {
  const C = useTheme();
  return (
    <View style={[styles.tile, { backgroundColor: C.card, borderColor: C.border }, Shadow.sm]}>
      <Icon name={icon} size={18} color={C.foreground} />
      <Text style={[styles.label, { color: C.mutedForeground }]} numberOfLines={1}>
        {label}
      </Text>
      <Text style={[styles.value, { color: C.foreground }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[3],
    gap: Spacing[2],
    minHeight: 92,
    justifyContent: "space-between",
  },
  label: { fontFamily: FontFamily.sans, fontSize: FontSize.xs },
  value: { fontFamily: FontFamily.sansBold, fontSize: FontSize.sm, letterSpacing: -0.2 },
});
