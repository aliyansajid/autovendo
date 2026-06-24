import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { FontFamily, FontSize, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useTabBarHeight } from "@/hooks/use-tab-bar-height";
import { useFavorites } from "@/lib/favorites";
import {
  fetchVehicles,
  type SortOption,
  type VehicleListItem,
  type VehicleFacets,
} from "@/lib/api";
import { SORT_OPTIONS, SORT_LABELS } from "@repo/vehicle-constants";
import {
  EMPTY_FILTERS,
  filtersToParams,
  activeFilterCount,
  type Filters,
} from "@/components/search/advanced-filter";
import { useFilterModal } from "@/components/search/filter-modal";
import { useSelectModal } from "@/components/form/select-modal";
import { SearchField } from "@/components/ui/search-field";
import { Icon } from "@/components/ui/icon";
import { Chip } from "@/components/ui/chip";
import { VehicleCard } from "@/components/ui/vehicle-card";
import { EmptyState, ErrorState, VehicleCardSkeleton } from "@/components/ui/states";

const VEHICLE_TYPES: { value: string | null; label: string }[] = [
  { value: null, label: "Alle" },
  { value: "CAR", label: "Autos" },
  { value: "CAMPER", label: "Wohnmobile" },
  { value: "UTILITY", label: "Nutzfahrzeuge" },
  { value: "TRUCK", label: "Lastwagen" },
];

// Values + order + labels from @repo/vehicle-constants (same source as the web
// /cars ListingControls), so the sort dropdown matches autovendo.ch exactly.
const SORTS: { value: SortOption; label: string }[] = SORT_OPTIONS.map((value) => ({
  value,
  label: SORT_LABELS[value],
}));

export default function SearchScreen() {
  const C = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const tabBarHeight = useTabBarHeight();
  const { isFavorite, toggle } = useFavorites();
  const initial = useLocalSearchParams<{ vehicleType?: string; sort?: string; q?: string; make?: string; dealerId?: string; bodyType?: string; fuel?: string; priceFrom?: string; priceTo?: string }>();

  const [filters, setFilters] = useState<Filters>(() => ({
    ...EMPTY_FILTERS,
    vehicleType: initial.vehicleType ?? null,
    dealerId: initial.dealerId,
    make: initial.make ? [initial.make] : [],
    bodyType: initial.bodyType ? [initial.bodyType] : [],
    fuel: initial.fuel ? [initial.fuel] : [],
    priceFrom: initial.priceFrom ? Number(initial.priceFrom) : undefined,
    priceTo: initial.priceTo ? Number(initial.priceTo) : undefined,
    sort: (initial.sort as SortOption) ?? "relevance",
    q: initial.q ?? "",
  }));
  const [query, setQuery] = useState(filters.q);

  const [items, setItems] = useState<VehicleListItem[]>([]);
  const [facets, setFacets] = useState<VehicleFacets | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  const { openFilter } = useFilterModal();
  const { open: openSelect } = useSelectModal();

  const reqId = useRef(0);

  const runSearch = useCallback(async (f: Filters) => {
    const id = ++reqId.current;
    setLoading(true);
    setError(false);
    try {
      const res = await fetchVehicles(filtersToParams(f, 1));
      if (id !== reqId.current) return;
      setItems(res.data);
      setFacets(res.facets);
      setTotal(res.total);
      setPage(res.page);
      setTotalPages(res.totalPages);
    } catch {
      if (id !== reqId.current) return;
      setError(true);
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, []);

  // Re-run whenever the committed filters change.
  useEffect(() => {
    runSearch(filters);
  }, [filters, runSearch]);

  // Debounce the text query into committed filters.
  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => (f.q === query ? f : { ...f, q: query })), 350);
    return () => clearTimeout(t);
  }, [query]);

  const loadMore = useCallback(async () => {
    if (loadingMore || loading || page >= totalPages) return;
    setLoadingMore(true);
    try {
      const res = await fetchVehicles(filtersToParams(filters, page + 1));
      setItems((prev) => [...prev, ...res.data]);
      setPage(res.page);
    } catch {
      // keep current list
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, loading, page, totalPages, filters]);

  const count = activeFilterCount(filters);

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]}>
        <View style={styles.searchRow}>
          <SearchField
            style={{ flex: 1 }}
            placeholder="Marke, Modell, Stichwort"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onClear={() => setQuery("")}
          />
          <Pressable
            style={[styles.filterBtn, { backgroundColor: count > 0 ? C.primary : C.secondary, borderColor: C.border }]}
            onPress={() => openFilter({ filters, facets, onApply: (f) => setFilters(f) })}
          >
            <Icon name="slider.horizontal.3" size={18} color={count > 0 ? C.primaryForeground : C.foreground} />
            {count > 0 && (
              <View style={[styles.filterBadge, { backgroundColor: C.primaryForeground }]}>
                <Text style={[styles.filterBadgeText, { color: C.primary }]}>{count}</Text>
              </View>
            )}
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeRow}>
          {VEHICLE_TYPES.map((t) => (
            <Chip
              key={t.label}
              label={t.label}
              selected={filters.vehicleType === t.value}
              onPress={() =>
                setFilters((f) => ({
                  ...EMPTY_FILTERS,
                  q: f.q,
                  sort: f.sort,
                  dealerId: f.dealerId,
                  vehicleType: t.value,
                }))
              }
            />
          ))}
        </ScrollView>

        <View style={styles.resultBar}>
          <Text style={[styles.resultCount, { color: C.mutedForeground }]}>
            {loading ? "Suche läuft…" : `${total.toLocaleString("de-CH")} Fahrzeuge`}
          </Text>
          <Pressable
            style={styles.sortBtn}
            hitSlop={6}
            onPress={() =>
              openSelect({
                title: "Sortieren nach",
                options: SORTS.map((s) => ({ value: s.value, label: s.label })),
                value: filters.sort,
                onSelect: (v) => setFilters((f) => ({ ...f, sort: v as SortOption })),
              })
            }
          >
            <Icon name="arrow.up.arrow.down" size={14} color={C.foreground} />
            <Text style={[styles.sortLabel, { color: C.foreground }]}>
              {SORTS.find((s) => s.value === filters.sort)?.label ?? "Sortieren"}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>

      {error ? (
        <ErrorState onRetry={() => runSearch(filters)} />
      ) : loading ? (
        <View style={[styles.listPad, { gap: Spacing[3] }]}>
          {[0, 1, 2].map((k) => (
            <VehicleCardSkeleton key={k} />
          ))}
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(v) => v.id}
          contentContainerStyle={[styles.listPad, { paddingBottom: tabBarHeight + Spacing[4] }]}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: Spacing[3] }} />}
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
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
              icon="magnifyingglass"
              title="Keine Fahrzeuge gefunden"
              message="Passen Sie Ihre Suche oder Filter an."
            />
          }
          ListFooterComponent={
            loadingMore ? <ActivityIndicator style={{ paddingVertical: Spacing[5] }} color={C.mutedForeground} /> : null
          }
        />
      )}
    </View>
  );
}

function createStyles(C: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: C.background },
    searchRow: {
      flexDirection: "row",
      gap: Spacing[2],
      paddingHorizontal: Spacing[5],
      paddingBottom: Spacing[3],
    },
    filterBtn: {
      width: 46,
      height: 46,
      borderRadius: Radius.md,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: StyleSheet.hairlineWidth * 2,
    },
    filterBadge: {
      position: "absolute",
      top: 4,
      right: 4,
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 4,
    },
    filterBadgeText: {
      fontFamily: FontFamily.sansBold,
      fontSize: 10,
    },
    typeRow: {
      paddingHorizontal: Spacing[5],
      gap: Spacing[2],
      paddingBottom: Spacing[3],
    },
    resultBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: Spacing[5],
      paddingBottom: Spacing[3],
    },
    resultCount: {
      fontFamily: FontFamily.sansMedium,
      fontSize: FontSize.sm,
    },
    sortBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing[1],
    },
    sortLabel: {
      fontFamily: FontFamily.sansMedium,
      fontSize: FontSize.sm,
    },
    listPad: {
      paddingHorizontal: Spacing[5],
      paddingTop: Spacing[1],
    },
  });
}
