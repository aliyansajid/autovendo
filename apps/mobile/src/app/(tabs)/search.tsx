import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  Modal,
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
import {
  AdvancedFilter,
  EMPTY_FILTERS,
  filtersToParams,
  activeFilterCount,
  type Filters,
} from "@/components/search/advanced-filter";
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

const SORTS: { value: SortOption; label: string }[] = [
  { value: "relevance", label: "Standard" },
  { value: "created-desc", label: "Neueste zuerst" },
  { value: "price-asc", label: "Preis aufsteigend" },
  { value: "price-desc", label: "Preis absteigend" },
  { value: "kilometer-asc", label: "Kilometer aufsteigend" },
  { value: "registration-desc", label: "Jahr (neueste)" },
];

export default function SearchScreen() {
  const C = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const tabBarHeight = useTabBarHeight();
  const { isFavorite, toggle } = useFavorites();
  const initial = useLocalSearchParams<{ vehicleType?: string; sort?: string; q?: string; make?: string; dealerId?: string }>();

  const [filters, setFilters] = useState<Filters>(() => ({
    ...EMPTY_FILTERS,
    vehicleType: initial.vehicleType ?? null,
    dealerId: initial.dealerId,
    make: initial.make ? [initial.make] : [],
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

  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

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
          <View style={[styles.searchBar, { backgroundColor: C.secondary, borderColor: C.border }]}>
            <Icon name="magnifyingglass" size={17} color={C.mutedForeground} />
            <TextInput
              style={[styles.input, { color: C.foreground }]}
              placeholder="Marke, Modell, Stichwort"
              placeholderTextColor={C.mutedForeground}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              autoCorrect={false}
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery("")} hitSlop={8}>
                <Icon name="xmark.circle.fill" size={16} color={C.mutedForeground} />
              </Pressable>
            )}
          </View>
          <Pressable
            style={[styles.filterBtn, { backgroundColor: count > 0 ? C.primary : C.secondary, borderColor: C.border }]}
            onPress={() => setShowFilters(true)}
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
          <Pressable style={styles.sortBtn} onPress={() => setShowSort(true)} hitSlop={6}>
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

      <AdvancedFilter
        visible={showFilters}
        filters={filters}
        facets={facets}
        onClose={() => setShowFilters(false)}
        onApply={(f) => {
          setFilters(f);
          setShowFilters(false);
        }}
      />
      <SortSheet
        visible={showSort}
        value={filters.sort}
        onClose={() => setShowSort(false)}
        onSelect={(sort) => {
          setFilters((f) => ({ ...f, sort }));
          setShowSort(false);
        }}
      />
    </View>
  );
}

// ─── Sort sheet ───────────────────────────────────────────────────────────────

function SortSheet({
  visible,
  value,
  onClose,
  onSelect,
}: {
  visible: boolean;
  value: SortOption;
  onClose: () => void;
  onSelect: (s: SortOption) => void;
}) {
  const C = useTheme();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={sheetStyles.backdrop} onPress={onClose} />
      <View style={[sheetStyles.sheet, { backgroundColor: C.background }]}>
        <SafeAreaView edges={["bottom"]}>
          <View style={[sheetStyles.handle, { backgroundColor: C.border }]} />
          <Text style={[sheetStyles.sheetTitle, { color: C.foreground }]}>Sortieren nach</Text>
          {SORTS.map((s) => (
            <Pressable key={s.value} style={sheetStyles.optionRow} onPress={() => onSelect(s.value)}>
              <Text style={[sheetStyles.optionText, { color: C.foreground }]}>{s.label}</Text>
              {value === s.value && <Icon name="checkmark" size={18} color={C.primary} />}
            </Pressable>
          ))}
        </SafeAreaView>
      </View>
    </Modal>
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
    searchBar: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing[2],
      height: 46,
      borderRadius: Radius.md,
      paddingHorizontal: Spacing[3],
      borderWidth: StyleSheet.hairlineWidth * 2,
    },
    input: {
      flex: 1,
      fontFamily: FontFamily.sans,
      fontSize: FontSize.base,
      height: 46,
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

const sheetStyles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingTop: Spacing[2],
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: Spacing[3],
  },
  sheetTitle: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.lg,
    paddingHorizontal: Spacing[5],
    marginBottom: Spacing[2],
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
  },
  optionText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.base,
  },
});
