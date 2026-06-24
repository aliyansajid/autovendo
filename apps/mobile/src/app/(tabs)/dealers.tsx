import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { FontFamily, FontSize, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useTabBarHeight } from "@/hooks/use-tab-bar-height";
import { fetchDealers, type DealerListItem } from "@/lib/api";
import { SearchField } from "@/components/ui/search-field";
import { DealerCard } from "@/components/ui/dealer-card";
import { EmptyState, ErrorState, DealerCardSkeleton } from "@/components/ui/states";

export default function DealersScreen() {
  const C = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const tabBarHeight = useTabBarHeight();

  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<DealerListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const reqId = useRef(0);

  const load = useCallback(async (term: string) => {
    const id = ++reqId.current;
    setLoading(true);
    setError(false);
    try {
      const res = await fetchDealers({ search: term || undefined, page: 1, pageSize: 20 });
      if (id !== reqId.current) return;
      setItems(res.data);
      setPage(res.page);
      setTotalPages(res.totalPages);
      setTotal(res.total);
    } catch {
      if (id === reqId.current) setError(true);
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(search);
  }, [search, load]);

  useEffect(() => {
    const t = setTimeout(() => setSearch(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  const loadMore = useCallback(async () => {
    if (loadingMore || loading || page >= totalPages) return;
    setLoadingMore(true);
    try {
      const res = await fetchDealers({ search: search || undefined, page: page + 1, pageSize: 20 });
      setItems((prev) => [...prev, ...res.data]);
      setPage(res.page);
    } catch {
      // keep list
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, loading, page, totalPages, search]);

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: C.foreground }]}>Händler</Text>
          {!loading && <Text style={[styles.count, { color: C.mutedForeground }]}>{total.toLocaleString("de-CH")}</Text>}
        </View>
        <View style={styles.searchPad}>
          <SearchField
            placeholder="Händler suchen"
            value={query}
            onChangeText={setQuery}
            onClear={() => setQuery("")}
          />
        </View>
      </SafeAreaView>

      {error ? (
        <ErrorState onRetry={() => load(search)} />
      ) : loading ? (
        <View style={[styles.listPad, { gap: Spacing[3] }]}>
          {[0, 1, 2, 3].map((k) => (
            <DealerCardSkeleton key={k} />
          ))}
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(d) => d.id}
          contentContainerStyle={[styles.listPad, { paddingBottom: tabBarHeight + Spacing[4] }]}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: Spacing[3] }} />}
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          renderItem={({ item }) => <DealerCard dealer={item} onPress={() => router.push(`/dealer/${item.id}`)} />}
          ListEmptyComponent={<EmptyState icon="building.2" title="Keine Händler gefunden" />}
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
    header: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: Spacing[2],
      paddingHorizontal: Spacing[5],
      paddingBottom: Spacing[3],
    },
    title: {
      fontFamily: FontFamily.sansBold,
      fontSize: FontSize.xl,
      letterSpacing: -0.5,
    },
    count: {
      fontFamily: FontFamily.sansMedium,
      fontSize: FontSize.sm,
    },
    searchPad: {
      paddingHorizontal: Spacing[5],
      paddingBottom: Spacing[3],
    },
    listPad: {
      paddingHorizontal: Spacing[5],
      paddingTop: Spacing[1],
    },
  });
}
