import { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { FontFamily, FontSize, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useTabBarHeight } from "@/hooks/use-tab-bar-height";
import { useFavorites } from "@/lib/favorites";
import {
  fetchFeaturedVehicles,
  fetchVehicles,
  fetchFeaturedDealers,
  type VehicleListItem,
  type DealerListItem,
} from "@/lib/api";
import { Icon, type IconName } from "@/components/ui/icon";
import { SectionHeader } from "@/components/ui/section-header";
import { VehicleCard } from "@/components/ui/vehicle-card";
import { DealerCard } from "@/components/ui/dealer-card";
import { Skeleton, ErrorState } from "@/components/ui/states";

const { width: SCREEN_W } = Dimensions.get("window");
const FEATURED_W = Math.min(300, SCREEN_W * 0.74);
const DEALER_W = Math.min(260, SCREEN_W * 0.66);

const CATEGORIES: { type: string; label: string; icon: IconName }[] = [
  { type: "CAR", label: "Autos", icon: "car.fill" },
  { type: "CAMPER", label: "Wohnmobile", icon: "bus.fill" },
  { type: "UTILITY", label: "Nutzfahrzeuge", icon: "truck.box.fill" },
  { type: "TRUCK", label: "Lastwagen", icon: "truck.box" },
];

function openSearch(params?: Record<string, string>) {
  router.push({ pathname: "/(tabs)/search", params });
}

export default function HomeScreen() {
  const C = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const tabBarHeight = useTabBarHeight();
  const { isFavorite, toggle } = useFavorites();

  const [featured, setFeatured] = useState<VehicleListItem[]>([]);
  const [recent, setRecent] = useState<VehicleListItem[]>([]);
  const [dealers, setDealers] = useState<DealerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(false);
    try {
      const [feat, rec, deal] = await Promise.all([
        fetchFeaturedVehicles(),
        fetchVehicles({ sort: "created-desc", pageSize: 6 }),
        fetchFeaturedDealers(),
      ]);
      setFeatured(feat);
      setRecent(rec.data);
      setDealers(deal);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: tabBarHeight + Spacing[4] }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={C.mutedForeground} />
        }
      >
        {/* Header */}
        <SafeAreaView edges={["top"]}>
          <View style={styles.header}>
            <Text style={[styles.wordmark, { color: C.foreground }]}>
              Auto<Text style={{ color: C.primary }}>Vendo</Text>
            </Text>
            <Pressable
              style={[styles.iconBtn, { backgroundColor: C.secondary }]}
              hitSlop={6}
              onPress={() => router.push("/(tabs)/profile")}
            >
              <Icon name="heart" size={19} color={C.foreground} />
            </Pressable>
          </View>
        </SafeAreaView>

        {/* Search entry */}
        <View style={styles.searchPad}>
          <Pressable style={[styles.searchBar, { backgroundColor: C.secondary, borderColor: C.border }]} onPress={() => openSearch()}>
            <Icon name="magnifyingglass" size={17} color={C.mutedForeground} />
            <Text style={[styles.searchPlaceholder, { color: C.mutedForeground }]}>
              Marke, Modell oder Stichwort
            </Text>
          </Pressable>
        </View>

        {/* Categories */}
        <View style={styles.categories}>
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.type}
              style={styles.category}
              onPress={() => openSearch({ vehicleType: cat.type })}
            >
              <View style={[styles.categoryTile, { backgroundColor: C.secondary, borderColor: C.border }]}>
                <Icon name={cat.icon} size={24} color={C.primary} />
              </View>
              <Text style={[styles.categoryLabel, { color: C.foreground }]}>{cat.label}</Text>
            </Pressable>
          ))}
        </View>

        {error ? (
          <ErrorState onRetry={() => load()} />
        ) : (
          <>
            {/* Featured */}
            <View style={styles.section}>
              <SectionHeader title="Empfohlen" actionLabel="Alle ansehen" onAction={() => openSearch()} />
            </View>
            {loading ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
                {[0, 1].map((k) => (
                  <Skeleton key={k} width={FEATURED_W} height={240} radius={Radius.lg} />
                ))}
              </ScrollView>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={FEATURED_W + Spacing[3]}
                decelerationRate="fast"
                contentContainerStyle={styles.hList}
              >
                {featured.map((v) => (
                  <VehicleCard
                    key={v.id}
                    vehicle={v}
                    width={FEATURED_W}
                    favorite={isFavorite(v.id)}
                    onToggleFavorite={() => toggle(v.id)}
                    onPress={() => router.push(`/vehicle/${v.id}`)}
                  />
                ))}
              </ScrollView>
            )}

            {/* Featured dealers */}
            {(loading || dealers.length > 0) && (
              <>
                <View style={[styles.section, { marginTop: Spacing[6] }]}>
                  <SectionHeader title="Top-Händler" actionLabel="Alle" onAction={() => router.push("/(tabs)/dealers")} />
                </View>
                {loading ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
                    {[0, 1].map((k) => (
                      <Skeleton key={k} width={DEALER_W} height={140} radius={Radius.lg} />
                    ))}
                  </ScrollView>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
                    {dealers.map((d) => (
                      <DealerCard key={d.id} dealer={d} width={DEALER_W} onPress={() => router.push(`/dealer/${d.id}`)} />
                    ))}
                  </ScrollView>
                )}
              </>
            )}

            {/* New arrivals */}
            <View style={[styles.section, { marginTop: Spacing[6] }]}>
              <SectionHeader title="Neu eingetroffen" actionLabel="Alle ansehen" onAction={() => openSearch({ sort: "created-desc" })} />
              <View style={{ gap: Spacing[3] }}>
                {loading
                  ? [0, 1, 2].map((k) => <Skeleton key={k} width="100%" height={260} radius={Radius.lg} />)
                  : recent.map((v) => (
                      <VehicleCard
                        key={v.id}
                        vehicle={v}
                        favorite={isFavorite(v.id)}
                        onToggleFavorite={() => toggle(v.id)}
                        onPress={() => router.push(`/vehicle/${v.id}`)}
                      />
                    ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
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
      paddingHorizontal: Spacing[5],
      paddingTop: Spacing[2],
      paddingBottom: Spacing[3],
    },
    wordmark: {
      fontFamily: FontFamily.sansBold,
      fontSize: FontSize.xl,
      letterSpacing: -0.6,
    },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    searchPad: {
      paddingHorizontal: Spacing[5],
      paddingBottom: Spacing[4],
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing[3],
      height: 50,
      borderRadius: Radius.md,
      paddingHorizontal: Spacing[4],
      borderWidth: StyleSheet.hairlineWidth * 2,
    },
    searchPlaceholder: {
      fontFamily: FontFamily.sans,
      fontSize: FontSize.base,
    },
    categories: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: Spacing[5],
      paddingBottom: Spacing[2],
    },
    category: {
      alignItems: "center",
      gap: Spacing[2],
      flex: 1,
    },
    categoryTile: {
      width: 60,
      height: 60,
      borderRadius: Radius.lg,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: StyleSheet.hairlineWidth * 2,
    },
    categoryLabel: {
      fontFamily: FontFamily.sansMedium,
      fontSize: FontSize.xs,
      textAlign: "center",
    },
    section: {
      paddingHorizontal: Spacing[5],
      marginTop: Spacing[6],
    },
    hList: {
      paddingHorizontal: Spacing[5],
      gap: Spacing[3],
    },
  });
}
