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
  type SearchParams,
  type SortOption,
  type VehicleListItem,
  type VehicleFacets,
} from "@/lib/api";
import {
  labelMake,
  labelFuel,
  labelTransmission,
  labelCondition,
  labelType,
} from "@/lib/labels";
import { Icon } from "@/components/ui/icon";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { VehicleCard } from "@/components/ui/vehicle-card";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";

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

type Filters = {
  q: string;
  vehicleType: string | null;
  make: string[];
  fuel: string[];
  transmission: string[];
  condition: string[];
  priceFrom?: number;
  priceTo?: number;
  kilometerTo?: number;
  registrationFrom?: number;
  sort: SortOption;
};

const EMPTY: Filters = {
  q: "",
  vehicleType: null,
  make: [],
  fuel: [],
  transmission: [],
  condition: [],
  sort: "relevance",
};

function toParams(f: Filters, page: number): SearchParams {
  return {
    q: f.q || undefined,
    vehicleType: f.vehicleType ? [f.vehicleType] : undefined,
    make: f.make.length ? f.make : undefined,
    fuel: f.fuel.length ? f.fuel : undefined,
    transmission: f.transmission.length ? f.transmission : undefined,
    condition: f.condition.length ? f.condition : undefined,
    priceFrom: f.priceFrom,
    priceTo: f.priceTo,
    kilometerTo: f.kilometerTo,
    registrationFrom: f.registrationFrom,
    sort: f.sort,
    page,
    pageSize: 20,
  };
}

function activeFilterCount(f: Filters): number {
  return (
    f.make.length +
    f.fuel.length +
    f.transmission.length +
    f.condition.length +
    (f.priceFrom != null ? 1 : 0) +
    (f.priceTo != null ? 1 : 0) +
    (f.kilometerTo != null ? 1 : 0) +
    (f.registrationFrom != null ? 1 : 0)
  );
}

export default function SearchScreen() {
  const C = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const tabBarHeight = useTabBarHeight();
  const { isFavorite, toggle } = useFavorites();
  const initial = useLocalSearchParams<{ vehicleType?: string; sort?: string; q?: string }>();

  const [filters, setFilters] = useState<Filters>(() => ({
    ...EMPTY,
    vehicleType: initial.vehicleType ?? null,
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
      const res = await fetchVehicles(toParams(f, 1));
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

  // Re-run whenever any committed filter changes.
  useEffect(() => {
    runSearch(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.vehicleType,
    filters.make,
    filters.fuel,
    filters.transmission,
    filters.condition,
    filters.priceFrom,
    filters.priceTo,
    filters.kilometerTo,
    filters.registrationFrom,
    filters.sort,
    filters.q,
  ]);

  // Debounce the text query into committed filters.
  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => (f.q === query ? f : { ...f, q: query })), 350);
    return () => clearTimeout(t);
  }, [query]);

  const loadMore = useCallback(async () => {
    if (loadingMore || loading || page >= totalPages) return;
    setLoadingMore(true);
    try {
      const res = await fetchVehicles(toParams(filters, page + 1));
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
              onPress={() => setFilters((f) => ({ ...f, vehicleType: t.value }))}
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
        <View style={styles.listPad}>
          {[0, 1, 2].map((k) => (
            <Skeleton key={k} width="100%" height={260} radius={Radius.lg} style={{ marginBottom: Spacing[3] }} />
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

      <FilterSheet
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

// ─── Filter sheet ─────────────────────────────────────────────────────────────

function facetKeys(record: Record<string, number> | undefined, max = 24): string[] {
  if (!record) return [];
  return Object.entries(record)
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([k]) => k);
}

function FilterSheet({
  visible,
  filters,
  facets,
  onClose,
  onApply,
}: {
  visible: boolean;
  filters: Filters;
  facets: VehicleFacets | null;
  onClose: () => void;
  onApply: (f: Filters) => void;
}) {
  const C = useTheme();
  const [draft, setDraft] = useState<Filters>(filters);

  useEffect(() => {
    if (visible) setDraft(filters);
  }, [visible, filters]);

  const toggleIn = (key: "make" | "fuel" | "transmission" | "condition", value: string) =>
    setDraft((d) => {
      const arr = d[key];
      return { ...d, [key]: arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value] };
    });

  const numField = (key: "priceFrom" | "priceTo" | "kilometerTo" | "registrationFrom", raw: string) =>
    setDraft((d) => {
      const n = parseInt(raw.replace(/\D/g, ""), 10);
      return { ...d, [key]: Number.isNaN(n) ? undefined : n };
    });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={sheetStyles.backdrop} onPress={onClose} />
      <View style={[sheetStyles.sheet, sheetStyles.fullSheet, { backgroundColor: C.background }]}>
        <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
          <View style={[sheetStyles.handle, { backgroundColor: C.border }]} />
          <View style={sheetStyles.filterHeader}>
            <Text style={[sheetStyles.sheetTitle, { color: C.foreground, marginBottom: 0 }]}>Filter</Text>
            <Pressable
              onPress={() => setDraft({ ...EMPTY, vehicleType: draft.vehicleType, q: draft.q, sort: draft.sort })}
              hitSlop={8}
            >
              <Text style={[sheetStyles.reset, { color: C.primary }]}>Zurücksetzen</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={sheetStyles.filterBody} showsVerticalScrollIndicator={false}>
            <FilterGroup title="Marke">
              <ChipWrap>
                {facetKeys(facets?.make).map((m) => (
                  <Chip key={m} label={labelMake(m)} selected={draft.make.includes(m)} onPress={() => toggleIn("make", m)} />
                ))}
              </ChipWrap>
            </FilterGroup>

            <FilterGroup title="Treibstoff">
              <ChipWrap>
                {facetKeys(facets?.fuelType).map((m) => (
                  <Chip key={m} label={labelFuel(m)} selected={draft.fuel.includes(m)} onPress={() => toggleIn("fuel", m)} />
                ))}
              </ChipWrap>
            </FilterGroup>

            <FilterGroup title="Getriebe">
              <ChipWrap>
                {facetKeys(facets?.transmissionType).map((m) => (
                  <Chip
                    key={m}
                    label={labelTransmission(m)}
                    selected={draft.transmission.includes(m)}
                    onPress={() => toggleIn("transmission", m)}
                  />
                ))}
              </ChipWrap>
            </FilterGroup>

            <FilterGroup title="Zustand">
              <ChipWrap>
                {facetKeys(facets?.vehicleCondition).map((m) => (
                  <Chip
                    key={m}
                    label={labelCondition(m)}
                    selected={draft.condition.includes(m)}
                    onPress={() => toggleIn("condition", m)}
                  />
                ))}
              </ChipWrap>
            </FilterGroup>

            <FilterGroup title="Preis (CHF)">
              <View style={sheetStyles.rangeRow}>
                <NumInput placeholder="von" value={draft.priceFrom} onChange={(t) => numField("priceFrom", t)} />
                <NumInput placeholder="bis" value={draft.priceTo} onChange={(t) => numField("priceTo", t)} />
              </View>
            </FilterGroup>

            <FilterGroup title="Kilometer bis">
              <NumInput placeholder="z. B. 100000" value={draft.kilometerTo} onChange={(t) => numField("kilometerTo", t)} />
            </FilterGroup>

            <FilterGroup title="Jahr ab">
              <NumInput placeholder="z. B. 2018" value={draft.registrationFrom} onChange={(t) => numField("registrationFrom", t)} />
            </FilterGroup>

            {draft.vehicleType && (
              <Text style={[sheetStyles.typeHint, { color: C.mutedForeground }]}>
                Fahrzeugtyp: {labelType(draft.vehicleType)}
              </Text>
            )}
          </ScrollView>

          <View style={[sheetStyles.applyBar, { borderTopColor: C.border }]}>
            <Button label="Ergebnisse anzeigen" onPress={() => onApply(draft)} size="lg" fullWidth />
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  const C = useTheme();
  return (
    <View style={sheetStyles.group}>
      <Text style={[sheetStyles.groupTitle, { color: C.foreground }]}>{title}</Text>
      {children}
    </View>
  );
}

function ChipWrap({ children }: { children: React.ReactNode }) {
  return <View style={sheetStyles.chipWrap}>{children}</View>;
}

function NumInput({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value?: number;
  onChange: (t: string) => void;
}) {
  const C = useTheme();
  return (
    <TextInput
      style={[sheetStyles.numInput, { backgroundColor: C.secondary, borderColor: C.border, color: C.foreground }]}
      placeholder={placeholder}
      placeholderTextColor={C.mutedForeground}
      keyboardType="number-pad"
      value={value != null ? String(value) : ""}
      onChangeText={onChange}
    />
  );
}

function createStyles(C: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: C.background },
    searchRow: {
      flexDirection: "row",
      gap: Spacing[2],
      paddingHorizontal: Spacing[5],
      paddingTop: Spacing[2],
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
  fullSheet: {
    top: Spacing[12],
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
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing[5],
    marginBottom: Spacing[2],
  },
  reset: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.sm,
  },
  filterBody: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[6],
  },
  group: {
    marginTop: Spacing[5],
  },
  groupTitle: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: FontSize.base,
    marginBottom: Spacing[3],
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing[2],
  },
  rangeRow: {
    flexDirection: "row",
    gap: Spacing[3],
  },
  numInput: {
    flex: 1,
    height: 46,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth * 2,
    paddingHorizontal: Spacing[4],
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
  },
  typeHint: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    marginTop: Spacing[5],
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
  applyBar: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[3],
    borderTopWidth: StyleSheet.hairlineWidth * 2,
  },
});
