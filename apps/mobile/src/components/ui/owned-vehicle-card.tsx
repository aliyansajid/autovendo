import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { FontFamily, FontSize, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { OwnedVehicle } from "@/lib/account";
import { formatPrice, formatKm, formatRegistration, vehicleMetaLine } from "@/lib/format";
import { labelMake, labelModel, labelFuel } from "@/lib/labels";
import { imageUrl } from "@/lib/image";
import { Icon } from "./icon";
import { StatusBadge } from "./status-badge";

export function OwnedVehicleCard({
  vehicle,
  onPress,
  onMenu,
}: {
  vehicle: OwnedVehicle;
  onPress: () => void;
  onMenu: () => void;
}) {
  const C = useTheme();
  const image = imageUrl(vehicle.images?.[0]);
  const title = `${labelMake(vehicle.make)} ${labelModel(vehicle.model)}`.trim();
  const meta = vehicleMetaLine([
    formatRegistration(vehicle.registrationMonth, vehicle.registrationYear),
    formatKm(vehicle.kilometer),
    labelFuel(vehicle.fuelType),
  ]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: C.card, borderColor: C.border, opacity: pressed ? 0.96 : 1 },
      ]}
    >
      {image ? (
        <Image source={{ uri: image }} style={styles.thumb} contentFit="cover" transition={120} />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder, { backgroundColor: C.secondary }]}>
          <Icon name="car.side.fill" size={26} color={C.mutedForeground} />
        </View>
      )}

      <View style={styles.body}>
        <Text numberOfLines={1} style={[styles.title, { color: C.foreground }]}>{title}</Text>
        <Text numberOfLines={1} style={[styles.meta, { color: C.mutedForeground }]}>{meta}</Text>
        <View style={styles.bottom}>
          <Text style={[styles.price, { color: C.foreground }]}>{formatPrice(vehicle.price)}</Text>
          <StatusBadge status={vehicle.status} />
        </View>
      </View>

      <Pressable onPress={onMenu} hitSlop={10} style={styles.menuBtn}>
        <Icon name="ellipsis" size={18} color={C.mutedForeground} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: Spacing[3],
    padding: Spacing[3],
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth * 2,
    alignItems: "center",
  },
  thumb: { width: 84, height: 64, borderRadius: Radius.md },
  thumbPlaceholder: { alignItems: "center", justifyContent: "center" },
  body: { flex: 1, gap: 3 },
  title: { fontFamily: FontFamily.sansBold, fontSize: FontSize.base, letterSpacing: -0.2 },
  meta: { fontFamily: FontFamily.sans, fontSize: FontSize.xs },
  bottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 2, gap: Spacing[2] },
  price: { fontFamily: FontFamily.sansBold, fontSize: FontSize.base, letterSpacing: -0.3 },
  menuBtn: { width: 28, height: 28, alignItems: "center", justifyContent: "center", alignSelf: "flex-start" },
});
