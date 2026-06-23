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
import { useStatusBarStyle } from "@/hooks/use-status-bar-style";
import { carMakes } from "@repo/vehicle-constants";
import { FontFamily, FontSize, Radius, Shadow, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useTabBarHeight } from "@/hooks/use-tab-bar-height";
import { useFavorites } from "@/lib/favorites";
import { useLocation } from "@/lib/location";
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
import { VehicleCardSkeleton, DealerCardSkeleton, ErrorState } from "@/components/ui/states";

const { width: SCREEN_W } = Dimensions.get("window");
const FEATURED_W = Math.min(300, SCREEN_W * 0.78);
const DEALER_W = Math.min(260, SCREEN_W * 0.66);

const HEADER_FG = "#ffffff";
const HEADER_MUTED = "rgba(255,255,255,0.6)";

const ACTIONS: { key: string; label: string; icon: IconName; go: () => void }[] = [
  { key: "buy", label: "Kaufen", icon: "car.fill", go: () => openSearch() },
  { key: "sell", label: "Verkaufen", icon: "tag.fill", go: () => router.push("/listing/new") },
  { key: "dealers", label: "Händler", icon: "building.2.fill", go: () => router.push("/(tabs)/dealers") },
];

// Top brands from the shared source of truth (UPPERCASE enum values).
const TOP_BRANDS = (carMakes[0]?.items ?? []).slice(0, 8);

function openSearch(params?: Record<string, string>) {
  router.push({ pathname: "/(tabs)/search", params });
}

export default function HomeScreen() {
  const C = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const tabBarHeight = useTabBarHeight();
  const { isFavorite, toggle } = useFavorites();
  const { location } = useLocation();

  // Dark header ⇒ light icons while focused; restores dark for white screens.
  useStatusBarStyle("light");

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
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={HEADER_MUTED} />
        }
      >
        {/* ── Dark header ─────────────────────────────────────────────── */}
        <View style={[styles.header, { backgroundColor: C.foreground }]}>
          <SafeAreaView edges={["top"]}>
            <View style={styles.headerTop}>
              <Pressable onPress={() => router.push("/location")} hitSlop={6}>
                <Text style={styles.locationLabel}>Standort</Text>
                <View style={styles.locationRow}>
                  <Text style={styles.locationCity} numberOfLines={1}>
                    {location?.label ?? "Schweiz"}
                  </Text>
                  <Icon name="chevron.down" size={13} color={HEADER_FG} />
                </View>
              </Pressable>
              <Pressable
                style={styles.avatar}
                onPress={() => router.push("/favorites")}
                hitSlop={6}
              >
                <Icon name="heart.fill" size={18} color={HEADER_FG} />
              </Pressable>
            </View>

            {/* Search */}
            <View style={styles.searchRow}>
              <Pressable style={styles.searchBar} onPress={() => openSearch()}>
                <Icon name="magnifyingglass" size={17} color={C.mutedForeground} />
                <Text style={[styles.searchPlaceholder, { color: C.mutedForeground }]}>Fahrzeug finden …</Text>
              </Pressable>
              <Pressable style={[styles.filterBtn, { backgroundColor: C.primary }]} onPress={() => openSearch()}>
                <Icon name="slider.horizontal.3" size={18} color={C.primaryForeground} />
              </Pressable>
            </View>

            {/* Quick actions */}
            <View style={[styles.actionBar, { backgroundColor: C.primary }]}>
              {ACTIONS.map((a, i) => (
                <Pressable key={a.key} style={[styles.action, i < ACTIONS.length - 1 && styles.actionDivider]} onPress={a.go}>
                  <Icon name={a.icon} size={20} color={C.primaryForeground} />
                  <Text style={[styles.actionLabel, { color: C.primaryForeground }]}>{a.label}</Text>
                </Pressable>
              ))}
            </View>
          </SafeAreaView>
        </View>

        {/* ── Body ─────────────────────────────────────────────────────── */}
        {/* Brands */}
        <View style={styles.brandsSection}>
          <SectionHeader title="Marken" actionLabel="Alle" onAction={() => openSearch()} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brandsRow}>
          {TOP_BRANDS.map((b) => (
            <Pressable key={b.value} style={[styles.brandTile, { backgroundColor: C.card, borderColor: C.border }]} onPress={() => openSearch({ make: b.value })}>
              <Text style={[styles.brandText, { color: C.foreground }]} numberOfLines={1}>{b.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {error ? (
          <ErrorState onRetry={() => load()} />
        ) : (
          <>
            {/* Featured */}
            <View style={styles.section}>
              <SectionHeader title="Beliebte Fahrzeuge" actionLabel="Alle ansehen" onAction={() => openSearch()} />
            </View>
            {loading ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
                {[0, 1].map((k) => <VehicleCardSkeleton key={k} width={FEATURED_W} />)}
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

            {/* Dealers */}
            {(loading || dealers.length > 0) && (
              <>
                <View style={[styles.section, { marginTop: Spacing[6] }]}>
                  <SectionHeader title="Top-Händler" actionLabel="Alle" onAction={() => router.push("/(tabs)/dealers")} />
                </View>
                {loading ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
                    {[0, 1].map((k) => <DealerCardSkeleton key={k} width={DEALER_W} />)}
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
              <View style={{ gap: Spacing[4] }}>
                {loading
                  ? [0, 1].map((k) => <VehicleCardSkeleton key={k} />)
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
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
      paddingHorizontal: Spacing[5],
      paddingBottom: Spacing[5],
    },
    headerTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: Spacing[4],
    },
    locationLabel: { fontFamily: FontFamily.sans, fontSize: FontSize.xs, color: HEADER_MUTED },
    locationRow: { flexDirection: "row", alignItems: "center", gap: Spacing[1], marginTop: 2 },
    locationCity: { fontFamily: FontFamily.sansBold, fontSize: FontSize.md, color: HEADER_FG, letterSpacing: -0.3 },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: "rgba(255,255,255,0.12)",
      alignItems: "center",
      justifyContent: "center",
    },

    searchRow: { flexDirection: "row", gap: Spacing[2] },
    searchBar: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing[2],
      height: 52,
      borderRadius: Radius.lg,
      backgroundColor: C.card,
      paddingHorizontal: Spacing[4],
    },
    searchPlaceholder: { fontFamily: FontFamily.sans, fontSize: FontSize.base },
    filterBtn: { width: 52, height: 52, borderRadius: Radius.lg, alignItems: "center", justifyContent: "center" },

    actionBar: {
      flexDirection: "row",
      borderRadius: Radius.lg,
      marginTop: Spacing[4],
      paddingVertical: Spacing[3],
    },
    action: { flex: 1, alignItems: "center", gap: 6 },
    actionDivider: { borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: "rgba(255,255,255,0.25)" },
    actionLabel: { fontFamily: FontFamily.sansSemiBold, fontSize: FontSize.sm },

    brandsSection: { paddingHorizontal: Spacing[5], marginTop: Spacing[6] },
    brandsRow: { paddingHorizontal: Spacing[5], gap: Spacing[2], paddingTop: Spacing[1] },
    brandTile: {
      height: 48,
      paddingHorizontal: Spacing[4],
      borderRadius: Radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      alignItems: "center",
      justifyContent: "center",
      ...Shadow.sm,
    },
    brandText: { fontFamily: FontFamily.sansSemiBold, fontSize: FontSize.sm },

    section: { paddingHorizontal: Spacing[5], marginTop: Spacing[6] },
    hList: { paddingHorizontal: Spacing[5], gap: Spacing[3], paddingTop: Spacing[1], paddingBottom: Spacing[1] },
  });
}
