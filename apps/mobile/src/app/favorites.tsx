import { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { FontFamily, FontSize, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useFavorites } from "@/lib/favorites";
import { fetchVehicle, type VehicleListItem, type VehicleDetail } from "@/lib/api";
import { Icon } from "@/components/ui/icon";
import { VehicleCard } from "@/components/ui/vehicle-card";
import { EmptyState } from "@/components/ui/states";

// Favorites store only IDs; the detail payload is a superset of the list shape.
function toListItem(v: VehicleDetail): VehicleListItem {
  return {
    id: v.id,
    make: v.make,
    model: v.model,
    version: v.version,
    price: v.price,
    kilometer: v.kilometer,
    registrationMonth: v.registrationMonth,
    registrationYear: v.registrationYear,
    kw: v.kw,
    hp: v.hp,
    fuelType: v.fuelType,
    vehicleCondition: v.vehicleCondition,
    bodyType: v.bodyType ?? "",
    color: v.color ?? "",
    createdAt: v.createdAt,
    images: v.images,
    dealer: v.dealer
      ? {
          id: v.dealer.id,
          companyName: v.dealer.companyName,
          city: v.dealer.city,
          zipCode: v.dealer.zipCode,
          phoneNumber: v.dealer.phoneNumber,
          googleRating: v.dealer.googleRating,
          googleReviewCount: v.dealer.googleReviewCount,
        }
      : null,
    seller: v.seller,
  };
}

export default function FavoritesScreen() {
  const C = useTheme();
  const { ids, isFavorite, toggle } = useFavorites();
  const [items, setItems] = useState<VehicleListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const styles = useMemo(() => createStyles(C), [C]);

  const load = useCallback(async () => {
    if (ids.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const results = await Promise.allSettled(ids.map((id) => fetchVehicle(id)));
    const ok = results
      .filter((r): r is PromiseFulfilledResult<VehicleDetail> => r.status === "fulfilled")
      .map((r) => toListItem(r.value));
    setItems(ok);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.length]);

  useEffect(() => {
    load();
  }, [load]);

  // Keep visible list in sync when a card is un-favorited on this screen.
  const visible = items.filter((v) => isFavorite(v.id));

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.back}>
            <Icon name="chevron.left" size={22} color={C.foreground} />
          </Pressable>
          <Text style={[styles.title, { color: C.foreground }]}>Favoriten</Text>
          <View style={styles.back} />
        </View>
      </SafeAreaView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={C.mutedForeground} />
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(v) => v.id}
          contentContainerStyle={styles.listPad}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: Spacing[3] }} />}
          renderItem={({ item }) => (
            <VehicleCard
              vehicle={item}
              favorite={isFavorite(item.id)}
              onToggleFavorite={() => toggle(item.id)}
              onPress={() => router.push(`/vehicle/${item.id}`)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="heart"
              title="Noch keine Favoriten"
              message="Tippen Sie auf das Herz, um Fahrzeuge zu speichern."
              actionLabel="Fahrzeuge entdecken"
              onAction={() => router.push("/(tabs)/search")}
            />
          }
        />
      )}
    </View>
  );
}

function createStyles(C: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: C.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: Spacing[4],
      paddingTop: Spacing[2],
      paddingBottom: Spacing[3],
    },
    back: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
    title: { fontFamily: FontFamily.sansBold, fontSize: FontSize.lg, letterSpacing: -0.4 },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    listPad: { paddingHorizontal: Spacing[5], paddingTop: Spacing[2], flexGrow: 1 },
  });
}
