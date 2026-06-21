import { StyleSheet, Text, View } from "react-native";
import { FontFamily, FontSize, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT: { label: "Entwurf", color: "#8a8a94", bg: "rgba(138,138,148,0.15)" },
  PUBLISHED: { label: "Veröffentlicht", color: "#1a9e78", bg: "rgba(26,158,120,0.15)" },
  PAUSED: { label: "Pausiert", color: "#d98a00", bg: "rgba(217,138,0,0.15)" },
  SOLD: { label: "Verkauft", color: "#2c5bc8", bg: "rgba(44,91,200,0.15)" },
  ARCHIVED: { label: "Archiviert", color: "#8a8a94", bg: "rgba(138,138,148,0.15)" },
  BANNED: { label: "Gesperrt", color: "#d4431e", bg: "rgba(212,67,30,0.15)" },
};

export function StatusBadge({ status }: { status: string }) {
  const C = useTheme();
  const s = STATUS[status] ?? { label: status, color: C.mutedForeground, bg: C.secondary };
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <View style={[styles.dot, { backgroundColor: s.color }]} />
      <Text style={[styles.text, { color: s.color }]}>{s.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[1],
    paddingHorizontal: Spacing[2],
    paddingVertical: 3,
    borderRadius: Radius.sm,
    alignSelf: "flex-start",
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontFamily: FontFamily.sansSemiBold, fontSize: FontSize.xs },
});
