import { Pressable, StyleSheet, Text, View, type DimensionValue } from "react-native";
import { Image } from "expo-image";
import { FontFamily, FontSize, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { DealerListItem } from "@/lib/api";
import { imageUrl } from "@/lib/image";
import { Icon } from "./icon";

export function DealerCard({
  dealer,
  onPress,
  width,
}: {
  dealer: DealerListItem;
  onPress: () => void;
  width?: DimensionValue;
}) {
  const C = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: C.card, borderColor: C.border, width: width ?? "100%", opacity: pressed ? 0.96 : 1 },
      ]}
    >
      <View style={[styles.cover, { backgroundColor: C.secondary }]}>
        {imageUrl(dealer.coverImage) ? (
          <Image source={{ uri: imageUrl(dealer.coverImage)! }} style={styles.coverImg} contentFit="cover" transition={150} />
        ) : null}
        <View style={[styles.logo, { backgroundColor: C.card, borderColor: C.border }]}>
          {imageUrl(dealer.logo) ? (
            <Image source={{ uri: imageUrl(dealer.logo)! }} style={styles.logoImg} contentFit="contain" />
          ) : (
            <Icon name="building.2.fill" size={20} color={C.mutedForeground} />
          )}
        </View>
      </View>

      <View style={styles.body}>
        <Text numberOfLines={1} style={[styles.name, { color: C.foreground }]}>
          {dealer.companyName}
        </Text>
        <View style={styles.metaRow}>
          <Icon name="mappin" size={11} color={C.mutedForeground} />
          <Text numberOfLines={1} style={[styles.metaText, { color: C.mutedForeground }]}>
            {dealer.city}
          </Text>
          {dealer.googleRating != null && (
            <>
              <View style={[styles.dot, { backgroundColor: C.mutedForeground }]} />
              <Icon name="star.fill" size={11} color={C.rating} />
              <Text style={[styles.metaText, { color: C.foreground }]}>
                {dealer.googleRating.toFixed(1)}
              </Text>
            </>
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
  cover: {
    height: 76,
    width: "100%",
  },
  coverImg: {
    width: "100%",
    height: "100%",
  },
  logo: {
    position: "absolute",
    left: Spacing[3],
    bottom: -18,
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth * 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logoImg: {
    width: "100%",
    height: "100%",
  },
  body: {
    paddingTop: Spacing[5],
    paddingHorizontal: Spacing[3],
    paddingBottom: Spacing[3],
    gap: 3,
  },
  name: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.base,
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: 2,
  },
});
