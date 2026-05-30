import { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  FlatList,
  Dimensions,
  Image,
  ImageBackground,
  RefreshControl,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { FontFamily, FontSize, Spacing, Radius, type ThemeColors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { fetchHome, type Vehicle, type HomeData } from '@/lib/api';
import { useSession } from '@/lib/auth-client';
import { useTabBarHeight } from '@/hooks/use-tab-bar-height';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.68;

// ─── Categories ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'all', label: 'All', symbol: 'square.grid.2x2.fill' },
  { id: 'suv', label: 'SUV', symbol: 'car.fill' },
  { id: 'sedan', label: 'Sedan', symbol: 'car.side.fill' },
  { id: 'electric', label: 'Electric', symbol: 'bolt.car.fill' },
  { id: 'sports', label: 'Sports', symbol: 'flag.checkered' },
  { id: 'luxury', label: 'Luxury', symbol: 'star.fill' },
  { id: 'van', label: 'Van', symbol: 'bus.fill' },
] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function daysAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86_400_000);
  if (d === 0) return 'Today';
  if (d === 1) return '1d ago';
  return `${d}d ago`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ name, styles }: { name: string; styles: ReturnType<typeof createStyles> }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
}

function FeaturedCard({ item, styles, C }: { item: Vehicle; styles: ReturnType<typeof createStyles>; C: ThemeColors }) {
  return (
    <Pressable style={styles.featCard}>
      {/* Image with gradient overlay */}
      {item.image ? (
        <ImageBackground
          source={{ uri: item.image }}
          style={styles.featImage}
          imageStyle={styles.featImageStyle}
          resizeMode="cover">
          <View style={styles.featImageOverlay} />
          {item.fuel && (
            <View style={styles.fuelBadge}>
              <Text style={styles.fuelText}>{item.fuel}</Text>
            </View>
          )}
        </ImageBackground>
      ) : (
        <View style={styles.featImagePlaceholder}>
          <SymbolView name="car.side.fill" size={72} tintColor="rgba(255,255,255,0.12)" />
          {item.fuel && (
            <View style={styles.fuelBadge}>
              <Text style={styles.fuelText}>{item.fuel}</Text>
            </View>
          )}
        </View>
      )}

      {/* Info */}
      <View style={styles.featInfo}>
        <View style={styles.featInfoRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.featMake}>{item.make}</Text>
            <Text style={styles.featModel} numberOfLines={1}>{item.year} {item.model}</Text>
          </View>
          <Text style={styles.featPrice}>{formatPrice(item.price)}</Text>
        </View>
        <View style={styles.featMeta}>
          <SymbolView name="gauge.medium" size={11} tintColor={C.mutedForeground} />
          <Text style={styles.featMetaText}>{formatMileage(item.mileage)}</Text>
          {item.city && (
            <>
              <View style={styles.dot} />
              <SymbolView name="location.fill" size={11} tintColor={C.mutedForeground} />
              <Text style={styles.featMetaText}>{item.city}</Text>
            </>
          )}
        </View>
      </View>
    </Pressable>
  );
}

function ArrivalCard({ item, styles, C }: { item: Vehicle; styles: ReturnType<typeof createStyles>; C: ThemeColors }) {
  return (
    <Pressable style={styles.arrivalCard}>
      {/* Thumbnail */}
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.arrivalImg} resizeMode="cover" />
      ) : (
        <View style={[styles.arrivalImg, styles.arrivalImgPlaceholder]}>
          <SymbolView name="car.side.fill" size={28} tintColor="rgba(255,255,255,0.2)" />
        </View>
      )}

      {/* Info */}
      <View style={styles.arrivalInfo}>
        <Text style={styles.arrivalMake} numberOfLines={1}>{item.make} {item.model}</Text>
        <Text style={styles.arrivalYear}>{item.year}</Text>
        <View style={styles.arrivalMeta}>
          <SymbolView name="gauge.medium" size={11} tintColor={C.mutedForeground} />
          <Text style={styles.arrivalMetaText}>{formatMileage(item.mileage)}</Text>
          {item.fuel && (
            <>
              <View style={styles.dot} />
              <Text style={styles.arrivalMetaText}>{item.fuel}</Text>
            </>
          )}
          <View style={styles.dot} />
          <Text style={styles.arrivalMetaText}>{daysAgo(item.createdAt)}</Text>
        </View>
        <Text style={styles.arrivalPrice}>{formatPrice(item.price)}</Text>
      </View>

      <SymbolView name="chevron.right" size={14} tintColor={C.muted} />
    </Pressable>
  );
}

function SkeletonCard({ width, height, styles }: { width: number | string; height: number; styles: ReturnType<typeof createStyles> }) {
  return <View style={[styles.skeleton, { width: width as any, height, borderRadius: Radius.xl }]} />;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const C = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const tabBarHeight = useTabBarHeight();
  const { data: sessionData } = useSession();
  const user = sessionData?.user;

  const [activeCategory, setActiveCategory] = useState('all');
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (category: string, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const result = await fetchHome(category);
      setData(result);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(activeCategory);
  }, [activeCategory]);

  const onRefresh = () => load(activeCategory, true);

  const onCategory = (id: string) => {
    setActiveCategory(id);
  };

  const stats = data?.stats;
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.mutedForeground}
          />
        }>

        {/* ── Header ──────────────────────────────────────────────────── */}
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {user ? (
                <Avatar name={user.name} styles={styles} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]} />
              )}
              <View>
                <Text style={styles.greeting}>{getGreeting()}</Text>
                <Text style={styles.username}>{firstName}</Text>
              </View>
            </View>
            <Pressable style={styles.notifBtn} hitSlop={8}>
              <SymbolView name="bell.fill" size={20} tintColor={C.foreground} />
              <View style={styles.notifDot} />
            </Pressable>
          </View>
        </SafeAreaView>

        {/* ── Search ──────────────────────────────────────────────────── */}
        <View style={styles.searchRow}>
          <View style={styles.searchWrap}>
            <SymbolView name="magnifyingglass" size={16} tintColor={C.mutedForeground} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search make, model, year..."
              placeholderTextColor={C.mutedForeground}
            />
          </View>
          <Pressable style={styles.filterBtn}>
            <SymbolView name="slider.horizontal.3" size={18} tintColor="#fff" />
          </Pressable>
        </View>

        {/* ── Stats ────────────────────────────────────────────────────── */}
        <View style={styles.statsRow}>
          {[
            { value: stats ? stats.totalCars.toLocaleString('de-CH') : '—', label: 'Cars' },
            { value: stats ? stats.totalDealers.toLocaleString('de-CH') : '—', label: 'Dealers' },
            { value: stats ? stats.newToday.toLocaleString('de-CH') : '—', label: 'New Today' },
          ].map((s, i) => (
            <View key={i} style={[styles.statItem, i < 2 && styles.statDivider]}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Categories ───────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Browse</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}>
          {CATEGORIES.map(cat => {
            const active = cat.id === activeCategory;
            return (
              <Pressable
                key={cat.id}
                style={[styles.catChip, active && styles.catChipActive]}
                onPress={() => onCategory(cat.id)}>
                <SymbolView
                  name={cat.symbol as any}
                  size={15}
                  tintColor={active ? '#fff' : C.mutedForeground}
                />
                <Text style={[styles.catLabel, active && styles.catLabelActive]}>
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── Featured ─────────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured</Text>
          <Pressable>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        </View>

        {loading ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featList}>
            {[1, 2].map(k => <SkeletonCard key={k} width={CARD_WIDTH} height={240} styles={styles} />)}
          </ScrollView>
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <FlatList
            data={data?.featured ?? []}
            keyExtractor={i => i.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + 12}
            decelerationRate="fast"
            contentContainerStyle={styles.featList}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No listings yet</Text>
              </View>
            }
            renderItem={({ item }) => <FeaturedCard item={item} styles={styles} C={C} />}
          />
        )}

        {/* ── New Arrivals ─────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>New Arrivals</Text>
          <Pressable>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.arrivalsList}>
            {[1, 2, 3].map(k => <SkeletonCard key={k} width="100%" height={80} styles={styles} />)}
          </View>
        ) : (
          <View style={styles.arrivalsList}>
            {(data?.newArrivals ?? []).length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No new arrivals</Text>
              </View>
            ) : (
              (data?.newArrivals ?? []).map(item => (
                <ArrivalCard key={item.id} item={item} styles={styles} C={C} />
              ))
            )}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function createStyles(C: ThemeColors) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: C.background,
    },
    scroll: {
      flex: 1,
    },
    content: {
      paddingHorizontal: Spacing[5],
    },

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: Spacing[4],
      paddingBottom: Spacing[4],
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing[3],
    },
    avatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: C.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarPlaceholder: {
      backgroundColor: C.secondary,
    },
    avatarText: {
      fontFamily: FontFamily.sansBold,
      fontSize: FontSize.sm,
      color: '#fff',
      letterSpacing: 0.5,
    },
    greeting: {
      fontFamily: FontFamily.sans,
      fontSize: FontSize.xs,
      color: C.mutedForeground,
      marginBottom: 1,
    },
    username: {
      fontFamily: FontFamily.sansBold,
      fontSize: FontSize.md,
      color: C.foreground,
    },
    notifBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: C.secondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    notifDot: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#e8526c',
      borderWidth: 1.5,
      borderColor: C.background,
    },

    // Search
    searchRow: {
      flexDirection: 'row',
      gap: Spacing[2],
      marginBottom: Spacing[4],
    },
    searchWrap: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: C.secondary,
      borderRadius: Radius.xl,
      paddingHorizontal: Spacing[4],
      gap: Spacing[2],
      height: 46,
      borderWidth: 1,
      borderColor: C.border,
    },
    searchInput: {
      flex: 1,
      fontFamily: FontFamily.sans,
      fontSize: FontSize.base,
      color: C.foreground,
      height: 46,
    },
    filterBtn: {
      width: 46,
      height: 46,
      borderRadius: Radius.xl,
      backgroundColor: C.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Stats
    statsRow: {
      flexDirection: 'row',
      backgroundColor: C.border,
      borderRadius: Radius.lg,
      marginBottom: Spacing[5],
      borderWidth: 1,
      borderColor: C.border,
      paddingVertical: Spacing[3],
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
    },
    statDivider: {
      borderRightWidth: 1,
      borderRightColor: C.border,
    },
    statValue: {
      fontFamily: FontFamily.sansBold,
      fontSize: FontSize.md,
      color: C.foreground,
    },
    statLabel: {
      fontFamily: FontFamily.sans,
      fontSize: FontSize.xs,
      color: C.mutedForeground,
      marginTop: 2,
    },

    // Section header
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing[3],
    },
    sectionTitle: {
      fontFamily: FontFamily.sansBold,
      fontSize: FontSize.lg,
      color: C.foreground,
    },
    seeAll: {
      fontFamily: FontFamily.sansMedium,
      fontSize: FontSize.sm,
      color: C.sidebarPrimary,
    },

    // Categories
    categoriesList: {
      paddingBottom: Spacing[4],
      gap: Spacing[2],
    },
    catChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing[1],
      paddingHorizontal: Spacing[3],
      paddingVertical: Spacing[2],
      borderRadius: Radius.full,
      backgroundColor: C.secondary,
      borderWidth: 1,
      borderColor: C.border,
    },
    catChipActive: {
      backgroundColor: C.primary,
      borderColor: C.sidebarPrimary,
    },
    catLabel: {
      fontFamily: FontFamily.sansMedium,
      fontSize: FontSize.sm,
      color: C.mutedForeground,
    },
    catLabelActive: {
      color: '#fff',
    },

    // Featured cards
    featList: {
      paddingBottom: Spacing[4],
      gap: 12,
    },
    featCard: {
      width: CARD_WIDTH,
      borderRadius: Radius.xl,
      backgroundColor: C.card,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: C.border,
    },
    featImage: {
      width: '100%',
      height: 180,
      justifyContent: 'space-between',
      flexDirection: 'column',
    },
    featImageStyle: {
      borderTopLeftRadius: Radius.xl,
      borderTopRightRadius: Radius.xl,
    },
    featImageOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.15)',
    },
    featImagePlaceholder: {
      width: '100%',
      height: 180,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: C.muted,
    },
    heartBtn: {
      position: 'absolute',
      top: Spacing[3],
      right: Spacing[3],
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(0,0,0,0.4)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    fuelBadge: {
      position: 'absolute',
      top: Spacing[3],
      left: Spacing[3],
      paddingHorizontal: Spacing[2],
      paddingVertical: 3,
      borderRadius: Radius.sm,
      backgroundColor: 'rgba(0,0,0,0.55)',
      borderWidth: 1,
      borderColor: C.secondary,
    },
    fuelText: {
      fontFamily: FontFamily.sansMedium,
      fontSize: FontSize.xs,
      color: '#fff',
    },
    featInfo: {
      padding: Spacing[3],
      gap: Spacing[2],
    },
    featInfoRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: Spacing[2],
    },
    featMake: {
      fontFamily: FontFamily.sansBold,
      fontSize: FontSize.base,
      color: C.foreground,
    },
    featModel: {
      fontFamily: FontFamily.sans,
      fontSize: FontSize.sm,
      color: C.mutedForeground,
      marginTop: 1,
    },
    featPrice: {
      fontFamily: FontFamily.sansBold,
      fontSize: FontSize.base,
      color: C.sidebarPrimary,
      flexShrink: 0,
    },
    featMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    featMetaText: {
      fontFamily: FontFamily.sans,
      fontSize: FontSize.xs,
      color: C.mutedForeground,
    },
    dot: {
      width: 3,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: C.mutedForeground,
    },

    // New Arrivals
    arrivalsList: {
      gap: Spacing[2],
    },
    arrivalCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: C.card,
      borderRadius: Radius.lg,
      padding: Spacing[3],
      borderWidth: 1,
      borderColor: C.border,
      gap: Spacing[3],
    },
    arrivalImg: {
      width: 72,
      height: 72,
      borderRadius: Radius.md,
    },
    arrivalImgPlaceholder: {
      backgroundColor: C.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    arrivalInfo: {
      flex: 1,
      gap: 2,
    },
    arrivalTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: Spacing[2],
    },
    arrivalMake: {
      flex: 1,
      fontFamily: FontFamily.sansBold,
      fontSize: FontSize.base,
      color: C.foreground,
    },
    arrivalPrice: {
      fontFamily: FontFamily.sansBold,
      fontSize: FontSize.base,
      color: C.sidebarPrimary,
      marginTop: 4,
    },
    arrivalYear: {
      fontFamily: FontFamily.sans,
      fontSize: FontSize.sm,
      color: C.mutedForeground,
    },
    arrivalMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 2,
    },
    arrivalMetaText: {
      fontFamily: FontFamily.sans,
      fontSize: FontSize.xs,
      color: C.mutedForeground,
    },

    // States
    skeleton: {
      backgroundColor: C.secondary,
      marginRight: 12,
    },
    errorBox: {
      padding: Spacing[4],
      alignItems: 'center',
    },
    errorText: {
      fontFamily: FontFamily.sans,
      fontSize: FontSize.sm,
      color: C.mutedForeground,
    },
    emptyBox: {
      padding: Spacing[5],
      alignItems: 'center',
    },
    emptyText: {
      fontFamily: FontFamily.sans,
      fontSize: FontSize.sm,
      color: C.mutedForeground,
    },
  });
}
