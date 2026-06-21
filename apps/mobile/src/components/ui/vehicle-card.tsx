import { Pressable, StyleSheet, Text, View, type DimensionValue } from "react-native";
import { Image } from "expo-image";
import { FontFamily, FontSize, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { VehicleListItem } from "@/lib/api";
import { formatPrice, formatRegistration, formatKm, vehicleMetaLine } from "@/lib/format";
import { labelMake, labelModel, labelFuel, labelCondition } from "@/lib/labels";
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
  const image = vehicle.images?.[0];
  const title = `${labelMake(vehicle.make)} ${labelModel(vehicle.model)}`.trim();
  const city = vehicle.dealer?.city ?? vehicle.seller?.city ?? null;
  const isDealer = !!vehicle.dealer;

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
        { backgroundColor: C.card, borderColor: C.border, width: width ?? "100%", opacity: pressed ? 0.96 : 1 },
      ]}
    >
      <View style={styles.imageWrap}>
        {image ? (
          <Image
            source={{ uri: image }}
            style={styles.image}
            contentFit="cover"
            placeholder={{ blurhash: BLUR_HASH }}
            transition={200}
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder, { backgroundColor: C.secondary }]}>
            <Icon name="car.side.fill" size={40} color={C.mutedForeground} />
          </View>
        )}

        {vehicle.vehicleCondition && (
          <View style={[styles.badge, styles.badgeTopLeft, { backgroundColor: "rgba(0,0,0,0.62)" }]}>
            <Text style={styles.badgeText}>{labelCondition(vehicle.vehicleCondition)}</Text>
          </View>
        )}

        {onToggleFavorite && (
          <Pressable
            onPress={onToggleFavorite}
            hitSlop={10}
            style={[styles.heart, { backgroundColor: "rgba(0,0,0,0.45)" }]}
          >
            <Icon
              name={favorite ? "heart.fill" : "heart"}
              size={16}
              color={favorite ? "#ff4d6d" : "#fff"}
            />
          </Pressable>
        )}
      </View>

      <View style={styles.body}>
        <Text numberOfLines={1} style={[styles.title, { color: C.foreground }]}>
          {title}
        </Text>
        {vehicle.version ? (
          <Text numberOfLines={1} style={[styles.subtitle, { color: C.mutedForeground }]}>
            {vehicle.version}
          </Text>
        ) : null}

        <Text numberOfLines={1} style={[styles.meta, { color: C.mutedForeground }]}>
          {meta}
        </Text>

        <View style={styles.footer}>
          <Text style={[styles.price, { color: C.foreground }]}>{formatPrice(vehicle.price)}</Text>
          {city && (
            <View style={styles.location}>
              <Icon name={isDealer ? "building.2.fill" : "mappin"} size={11} color={C.mutedForeground} />
              <Text numberOfLines={1} style={[styles.locationText, { color: C.mutedForeground }]}>
                {city}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth * 2,
    overflow: "hidden",
  },
  imageWrap: {
    width: "100%",
    aspectRatio: 4 / 3,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    paddingHorizontal: Spacing[2],
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  badgeTopLeft: {
    top: Spacing[2],
    left: Spacing[2],
  },
  badgeText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.xs,
    color: "#fff",
  },
  heart: {
    position: "absolute",
    top: Spacing[2],
    right: Spacing[2],
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    padding: Spacing[3],
    gap: 2,
  },
  title: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.base,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
  },
  meta: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing[2],
    gap: Spacing[2],
  },
  price: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.md,
    letterSpacing: -0.3,
  },
  location: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    flexShrink: 1,
  },
  locationText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
  },
});
