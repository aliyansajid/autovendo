import { Pressable, StyleSheet, Text, View } from "react-native";
import { FontFamily, FontSize, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const C = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: C.foreground }]}>{title}</Text>
      {actionLabel && onAction && (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={[styles.action, { color: C.primary }]}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing[3],
  },
  title: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.lg,
    letterSpacing: -0.3,
  },
  action: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.sm,
  },
});
