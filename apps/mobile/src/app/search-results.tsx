import { useMemo, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { router, useLocalSearchParams } from 'expo-router';
import { FontFamily, FontSize, Spacing, Radius, type ThemeColors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { fetchSearch, type SearchVehicle, type SearchParams } from '@/lib/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(n: number) {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
    maximumFractionDigits: 0,
  }).format(n);
}

function formatMileage(n: number) {
  return new Intl.NumberFormat('de-CH').format(n) + ' km';
}

// ─── Vehicle Card ──────────────────────────────────────────────────────────────

function VehicleCard({ item, styles, C }: { item: SearchVehicle; styles: ReturnType<typeof createStyles>; C: ThemeColors }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => router.push(`/vehicle/${item.id}` as any)}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
      ) : (
        <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
          <SymbolView name="car.side.fill" size={32} tintColor={C.mutedForeground} />
        </View>
      )}
      <View style={styles.cardInfo}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardMake} numberOfLines={1}>{item.make} {item.model}</Text>
            {item.version && (
              <Text style={styles.cardVersion} numberOfLines={1}>{item.version}</Text>
            )}
          </View>
          <Text style={styles.cardPrice}>{formatPrice(item.price)}</Text>
        </View>
        <View style={styles.cardMeta}>
          <Text style={styles.cardYear}>{item.year}</Text>
          <View style={styles.dot} />
          <SymbolView name="gauge.medium" size={11} tintColor={C.mutedForeground} />
          <Text style={styles.cardMetaText}>{formatMileage(item.mileage)}</Text>
          {item.fuel && (
            <>
              <View style={styles.dot} />
              <Text style={styles.cardMetaText}>{item.fuel}</Text>
            </>
          )}
        </View>
        {item.city && (
          <View style={styles.cardLocation}>
            <SymbolView name="location.fill" size={11} tintColor={C.mutedForeground} />
            <Text style={styles.cardMetaText}>{item.city}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SearchResultsScreen() {
  const C = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const { filters: filtersParam } = useLocalSearchParams<{ filters: string }>();

  const filters: SearchParams = useMemo(() => {
    try {
      return filtersParam ? JSON.parse(filtersParam) : {};
    } catch {
      return {};
    }
  }, [filtersParam]);

  const [vehicles, setVehicles] = useState<SearchVehicle[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (pageNum: number, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError(null);
    try {
      const result = await fetchSearch({ ...filters, page: pageNum, pageSize: 20 });
      setVehicles(prev => append ? [...prev, ...result.data] : result.data);
      setTotal(result.pagination.total);
      setHasNext(result.pagination.hasNext);
      setPage(pageNum);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters]);

  useEffect(() => {
    load(1);
  }, [load]);

  const loadMore = () => {
    if (!loadingMore && hasNext) load(page + 1, true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <SymbolView name="chevron.left" size={20} tintColor={C.foreground} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Results</Text>
          {!loading && (
            <Text style={styles.subtitle}>{total.toLocaleString('de-CH')} vehicles</Text>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={C.primary} size="large" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={() => load(1)}>
            <Text style={styles.retryText}>Try Again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          renderItem={({ item }) => <VehicleCard item={item} styles={styles} C={C} />}
          ListEmptyComponent={
            <View style={styles.centered}>
              <SymbolView name="car.fill" size={48} tintColor={C.mutedForeground} />
              <Text style={styles.emptyTitle}>No vehicles found</Text>
              <Text style={styles.emptyBody}>Try adjusting your filters.</Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footer}>
                <ActivityIndicator color={C.primary} />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function createStyles(C: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing[4],
      paddingVertical: Spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: C.border,
      gap: Spacing[2],
    },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    title: {
      fontFamily: FontFamily.sansSemiBold,
      fontSize: FontSize.md,
      color: C.foreground,
    },
    subtitle: {
      fontFamily: FontFamily.sans,
      fontSize: FontSize.sm,
      color: C.mutedForeground,
    },

    list: {
      padding: Spacing[4],
      gap: Spacing[3],
    },

    card: {
      backgroundColor: C.card,
      borderRadius: Radius.xl,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: C.border,
    },
    cardPressed: {
      opacity: 0.85,
    },
    cardImage: {
      width: '100%',
      height: 180,
    },
    cardImagePlaceholder: {
      backgroundColor: C.secondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardInfo: {
      padding: Spacing[3],
      gap: Spacing[2],
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: Spacing[2],
    },
    cardMake: {
      fontFamily: FontFamily.sansBold,
      fontSize: FontSize.base,
      color: C.foreground,
    },
    cardVersion: {
      fontFamily: FontFamily.sans,
      fontSize: FontSize.sm,
      color: C.mutedForeground,
      marginTop: 1,
    },
    cardPrice: {
      fontFamily: FontFamily.sansBold,
      fontSize: FontSize.base,
      color: C.primary,
      flexShrink: 0,
    },
    cardMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    cardYear: {
      fontFamily: FontFamily.sansMedium,
      fontSize: FontSize.sm,
      color: C.mutedForeground,
    },
    cardMetaText: {
      fontFamily: FontFamily.sans,
      fontSize: FontSize.sm,
      color: C.mutedForeground,
    },
    cardLocation: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    dot: {
      width: 3,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: C.mutedForeground,
      opacity: 0.5,
    },

    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing[3],
      padding: Spacing[8],
    },
    errorText: {
      fontFamily: FontFamily.sans,
      fontSize: FontSize.base,
      color: C.mutedForeground,
      textAlign: 'center',
    },
    retryBtn: {
      paddingHorizontal: Spacing[5],
      paddingVertical: Spacing[3],
      borderRadius: Radius.full,
      backgroundColor: C.primary,
    },
    retryText: {
      fontFamily: FontFamily.sansSemiBold,
      fontSize: FontSize.base,
      color: '#fff',
    },
    emptyTitle: {
      fontFamily: FontFamily.sansSemiBold,
      fontSize: FontSize.lg,
      color: C.foreground,
    },
    emptyBody: {
      fontFamily: FontFamily.sans,
      fontSize: FontSize.base,
      color: C.mutedForeground,
      textAlign: 'center',
    },
    footer: {
      padding: Spacing[5],
      alignItems: 'center',
    },
  });
}
