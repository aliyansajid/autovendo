import { useEffect } from "react";
import { StyleSheet, View, type DimensionValue } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

// Soft pulsing block. Provide either `height` or `aspectRatio`.
export function Skeleton({
  width = "100%",
  height,
  aspectRatio,
  radius = Radius.md,
  style,
}: {
  width?: DimensionValue;
  height?: number;
  aspectRatio?: number;
  radius?: number;
  style?: object;
}) {
  const C = useTheme();
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 850, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        { width, borderRadius: radius, backgroundColor: C.secondary },
        height != null ? { height } : null,
        aspectRatio != null ? { aspectRatio } : null,
        animStyle,
        style,
      ]}
    />
  );
}

// Matches VehicleCard's shape so loading → loaded is seamless.
export function VehicleCardSkeleton({ width }: { width?: DimensionValue }) {
  const C = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: C.card, width: width ?? "100%" }, cardShadow]}>
      <Skeleton width="100%" aspectRatio={16 / 11} radius={0} />
      <View style={[styles.body, { backgroundColor: C.secondary }]}>
        <View style={styles.rowBetween}>
          <Skeleton width="55%" height={16} radius={6} style={{ backgroundColor: C.muted }} />
          <Skeleton width="24%" height={16} radius={6} style={{ backgroundColor: C.muted }} />
        </View>
        <Skeleton width="80%" height={12} radius={6} style={{ marginTop: Spacing[3], backgroundColor: C.muted }} />
      </View>
    </View>
  );
}

export function DealerCardSkeleton({ width }: { width?: DimensionValue }) {
  const C = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: C.card, width: width ?? "100%" }, cardShadow]}>
      <Skeleton width="100%" height={76} radius={0} />
      <View style={[styles.body, { paddingTop: Spacing[5] }]}>
        <Skeleton width="60%" height={14} radius={6} />
        <Skeleton width="40%" height={11} radius={6} style={{ marginTop: Spacing[2] }} />
      </View>
    </View>
  );
}

export const cardShadow = {
  shadowColor: "#0b1220",
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.07,
  shadowRadius: 18,
  elevation: 4,
};

const styles = StyleSheet.create({
  card: { borderRadius: 24, overflow: "hidden" },
  body: { padding: Spacing[4] },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
});
