import { StyleSheet, Text, View } from "react-native";
import { FontFamily, FontSize, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Icon, type IconName } from "./icon";
import { Button } from "./button";

// Re-exported so existing `import { Skeleton } from "@/components/ui/states"`
// keeps working with the new animated implementation.
export { Skeleton, VehicleCardSkeleton, DealerCardSkeleton } from "./skeleton";

export function EmptyState({
  icon = "tray",
  title,
  message,
  actionLabel,
  onAction,
}: {
  icon?: IconName;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const C = useTheme();
  return (
    <View style={styles.center}>
      <View style={[styles.iconCircle, { backgroundColor: C.secondary }]}>
        <Icon name={icon} size={28} color={C.mutedForeground} />
      </View>
      <Text style={[styles.title, { color: C.foreground }]}>{title}</Text>
      {message && <Text style={[styles.message, { color: C.mutedForeground }]}>{message}</Text>}
      {actionLabel && onAction && (
        <Button label={actionLabel} onPress={onAction} variant="secondary" size="sm" style={{ marginTop: Spacing[4] }} />
      )}
    </View>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon="exclamationmark.triangle"
      title="Etwas ist schiefgelaufen"
      message="Bitte versuchen Sie es erneut."
      actionLabel={onRetry ? "Erneut versuchen" : undefined}
      onAction={onRetry}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing[12],
    paddingHorizontal: Spacing[6],
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing[4],
  },
  title: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: FontSize.md,
    textAlign: "center",
  },
  message: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    textAlign: "center",
    marginTop: Spacing[1],
    lineHeight: FontSize.sm * 1.4,
  },
});
