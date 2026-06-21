import { Pressable, StyleSheet, Text, View, type DimensionValue } from "react-native";
import { Image } from "expo-image";
import { FontFamily, FontSize, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { VehicleListItem } from "@/lib/api";
import { formatPrice, formatKm, formatPower, formatRegistration, vehicleMetaLine } from "@/lib/format";
import { labelMake, labelModel, labelFuel, labelCondition } from "@/lib/labels";
import { imageUrl } from "@/lib/image";
import { cardShadow } from "./skeleton";
import { Icon } from "./icon";

const BLUR_HASH = "L6Pj0^jE.AyE_3t7t7R**0o#DgR4";

export function VehicleCard({
  vehicle,
  onPress,
  width,
  favorite,
  onToggleFavorite,
}: {
  vehicle: VehicleListItem;
  onPress: () => void;
  width?: DimensionValue;
  favorite?: boolean;
  onToggleFavorite?: () => void;
}) {
  const C = useTheme();
  const image = imageUrl(vehicle.images?.[0]);
  const title = `${labelMake(vehicle.make)} ${labelModel(vehicle.model)}`.trim();
  const city = vehicle.dealer?.city ?? vehicle.seller?.city ?? null;
  const isDealer = !!vehicle.dealer;

  const meta = vehicleMetaLine([
    formatRegistration(vehicle.registrationMonth, vehicle.registrationYear),
    formatKm(vehicle.kilometer),
    vehicle.hp || vehicle.kw ? formatPower(vehicle.hp, vehicle.kw) : null,
    labelFuel(vehicle.fuelType),
  ]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: C.card, width: width ?? "100%", opacity: pressed ? 0.97 : 1 },
        cardShadow,
      ]}
    >
      {/* Photo */}
      <View style={[styles.imageWrap, { backgroundColor: C.secondary }]}>
        {image ? (
          <Image
            source={{ uri: image }}
            style={styles.image}
            contentFit="cover"
            placeholder={{ blurhash: BLUR_HASH }}
            transition={220}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Icon name="car.side.fill" size={44} color={C.mutedForeground} />
          </View>
        )}

        {vehicle.vehicleCondition ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{labelCondition(vehicle.vehicleCondition)}</Text>
          </View>
        ) : null}

        {onToggleFavorite && (
          <Pressable onPress={onToggleFavorite} hitSlop={10} style={styles.heart}>
            <Icon name={favorite ? "heart.fill" : "heart"} size={17} color={favorite ? "#ff4d6d" : "#fff"} />
          </Pressable>
        )}
      </View>

      {/* Body */}
      <View style={[styles.body, { backgroundColor: C.secondary }]}>
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={[styles.title, { color: C.foreground }]}>{title}</Text>
          <Text style={[styles.price, { color: C.primary }]}>{formatPrice(vehicle.price)}</Text>
        </View>

        <Text numberOfLines={1} style={[styles.meta, { color: C.mutedForeground }]}>{meta}</Text>

        <View style={[styles.divider, { backgroundColor: C.border }]} />

        <View style={styles.footer}>
          <View style={styles.location}>
            <Icon name={isDealer ? "building.2.fill" : "person.fill"} size={12} color={C.mutedForeground} />
            <Text numberOfLines={1} style={[styles.locationText, { color: C.mutedForeground }]}>
              {city ?? (isDealer ? "Händler" : "Privat")}
            </Text>
          </View>
          <View style={[styles.typePill, { backgroundColor: C.card }]}>
            <Text style={[styles.typeText, { color: C.secondaryForeground }]}>{isDealer ? "Händler" : "Privat"}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, overflow: "hidden" },
  imageWrap: { width: "100%", aspectRatio: 16 / 11 },
  image: { width: "100%", height: "100%" },
  imagePlaceholder: { flex: 1, alignItems: "center", justifyContent: "center" },
  badge: {
    position: "absolute",
    top: Spacing[3],
    left: Spacing[3],
    backgroundColor: "rgba(15,18,32,0.66)",
    paddingHorizontal: Spacing[3],
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: { fontFamily: FontFamily.sansMedium, fontSize: FontSize.xs, color: "#fff" },
  heart: {
    position: "absolute",
    top: Spacing[3],
    right: Spacing[3],
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(15,18,32,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  body: { padding: Spacing[4] },
  titleRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: Spacing[2] },
  title: { flex: 1, fontFamily: FontFamily.sansBold, fontSize: FontSize.base, letterSpacing: -0.3 },
  price: { fontFamily: FontFamily.sansBold, fontSize: FontSize.md, letterSpacing: -0.3, flexShrink: 0 },
  meta: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, marginTop: 4 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: Spacing[3] },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: Spacing[2] },
  location: { flexDirection: "row", alignItems: "center", gap: 5, flex: 1 },
  locationText: { fontFamily: FontFamily.sansMedium, fontSize: FontSize.xs },
  typePill: { paddingHorizontal: Spacing[3], paddingVertical: 4, borderRadius: 999 },
  typeText: { fontFamily: FontFamily.sansSemiBold, fontSize: FontSize.xs },
});
