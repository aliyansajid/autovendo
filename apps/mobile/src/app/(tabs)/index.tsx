import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { Colors, FontFamily, FontSize, Spacing, Radius } from '@/constants/theme';

const C = Colors.dark;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.68;

// ─── Mock Data ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'all', label: 'All', symbol: 'square.grid.2x2.fill' },
  { id: 'suv', label: 'SUV', symbol: 'car.fill' },
  { id: 'sedan', label: 'Sedan', symbol: 'car.side.fill' },
  { id: 'electric', label: 'Electric', symbol: 'bolt.car.fill' },
  { id: 'sports', label: 'Sports', symbol: 'flag.checkered' },
  { id: 'luxury', label: 'Luxury', symbol: 'star.fill' },
  { id: 'van', label: 'Van', symbol: 'bus.fill' },
] as const;

const FEATURED = [
  {
    id: '1',
    make: 'BMW',
    model: 'X5 xDrive40i',
    year: 2023,
    price: 74900,
    mileage: 12400,
    fuel: 'Petrol',
    location: 'Zürich',
    accent: '#1a3a6b',
    badge: '#2c5bc8',
  },
  {
    id: '2',
    make: 'Mercedes',
    model: 'C 300 AMG Line',
    year: 2024,
    price: 68500,
    mileage: 4200,
    fuel: 'Petrol',
    location: 'Basel',
    accent: '#1a1a2e',
    badge: '#4a4a6a',
  },
  {
    id: '3',
    make: 'Tesla',
    model: 'Model 3 Long Range',
    year: 2024,
    price: 52900,
    mileage: 8100,
    fuel: 'Electric',
    location: 'Bern',
    accent: '#0d2b1a',
    badge: '#1a6b3a',
  },
  {
    id: '4',
    make: 'Porsche',
    model: '911 Carrera S',
    year: 2022,
    price: 142000,
    mileage: 18600,
    fuel: 'Petrol',
    location: 'Geneva',
    accent: '#2d1a00',
    badge: '#8b4513',
  },
];

const NEW_ARRIVALS = [
  {
    id: '1',
    make: 'Audi',
    model: 'Q5 Sportback 45 TFSI',
    year: 2024,
    price: 61900,
    mileage: 2100,
    fuel: 'Petrol',
    daysAgo: 1,
  },
  {
    id: '2',
    make: 'Volkswagen',
    model: 'Golf R 2.0 TSI',
    year: 2023,
    price: 44500,
    mileage: 9800,
    fuel: 'Petrol',
    daysAgo: 2,
  },
  {
    id: '3',
    make: 'Volvo',
    model: 'XC90 B5 AWD Inscription',
    year: 2023,
    price: 79200,
    mileage: 21000,
    fuel: 'Mild Hybrid',
    daysAgo: 3,
  },
];

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

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ name }: { name: string }) {
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

function FeaturedCard({ item }: { item: typeof FEATURED[number] }) {
  return (
    <View style={[styles.featCard, { backgroundColor: item.accent }]}>
      {/* Decorative circle */}
      <View style={styles.featCircle} />

      {/* Heart */}
      <Pressable style={styles.heartBtn} hitSlop={8}>
        <SymbolView name="heart" size={18} tintColor="rgba(255,255,255,0.7)" />
      </Pressable>

      {/* Fuel badge */}
      <View style={[styles.fuelBadge, { backgroundColor: item.badge }]}>
        <Text style={styles.fuelText}>{item.fuel}</Text>
      </View>

      {/* Car image placeholder */}
      <View style={styles.featImageArea}>
        <SymbolView name="car.side.fill" size={80} tintColor="rgba(255,255,255,0.12)" />
      </View>

      {/* Info */}
      <View style={styles.featInfo}>
        <Text style={styles.featYear}>{item.year}</Text>
        <Text style={styles.featMake}>{item.make}</Text>
        <Text style={styles.featModel} numberOfLines={1}>{item.model}</Text>
        <View style={styles.featMeta}>
          <SymbolView name="gauge.medium" size={12} tintColor="rgba(255,255,255,0.5)" />
          <Text style={styles.featMetaText}>{formatMileage(item.mileage)}</Text>
          <View style={styles.dot} />
          <SymbolView name="location.fill" size={12} tintColor="rgba(255,255,255,0.5)" />
          <Text style={styles.featMetaText}>{item.location}</Text>
        </View>
        <Text style={styles.featPrice}>{formatPrice(item.price)}</Text>
      </View>
    </View>
  );
}

function ArrivalCard({ item }: { item: typeof NEW_ARRIVALS[number] }) {
  return (
    <Pressable style={styles.arrivalCard}>
      {/* Placeholder image */}
      <View style={styles.arrivalImg}>
        <SymbolView name="car.side.fill" size={36} tintColor="rgba(255,255,255,0.15)" />
      </View>

      {/* Info */}
      <View style={styles.arrivalInfo}>
        <View style={styles.arrivalHeader}>
          <Text style={styles.arrivalMake}>{item.make}</Text>
          <View style={styles.fuelBadgeSm}>
            <Text style={styles.fuelTextSm}>{item.fuel}</Text>
          </View>
        </View>
        <Text style={styles.arrivalModel} numberOfLines={1}>{item.year} {item.model}</Text>
        <View style={styles.arrivalMeta}>
          <SymbolView name="gauge.medium" size={11} tintColor={C.mutedForeground} />
          <Text style={styles.arrivalMetaText}>{formatMileage(item.mileage)}</Text>
          <View style={styles.dot} />
          <Text style={styles.arrivalMetaText}>
            {item.daysAgo === 1 ? 'Today' : `${item.daysAgo}d ago`}
          </Text>
        </View>
      </View>

      {/* Price */}
      <View style={styles.arrivalPriceCol}>
        <Text style={styles.arrivalPrice}>{formatPrice(item.price)}</Text>
        <SymbolView name="chevron.right" size={14} tintColor={C.mutedForeground} />
      </View>
    </Pressable>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const user = { name: 'Aliyan Sajid' };
  const activeCategory = 'all';

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* ── Header ──────────────────────────────────────────────────── */}
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Avatar name={user.name} />
              <View>
                <Text style={styles.greeting}>{getGreeting()}</Text>
                <Text style={styles.username}>{user.name.split(' ')[0]}</Text>
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
            <SymbolView name="slider.horizontal.3" size={18} tintColor={C.foreground} />
          </Pressable>
        </View>

        {/* ── Stats ────────────────────────────────────────────────────── */}
        <View style={styles.statsRow}>
          {[
            { value: '2,840', label: 'Cars' },
            { value: '148', label: 'Dealers' },
            { value: '34', label: 'New Today' },
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
              <Pressable key={cat.id} style={[styles.catChip, active && styles.catChipActive]}>
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
        <FlatList
          data={FEATURED}
          keyExtractor={i => i.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + 12}
          decelerationRate="fast"
          contentContainerStyle={styles.featList}
          renderItem={({ item }) => <FeaturedCard item={item} />}
          scrollEnabled
        />

        {/* ── New Arrivals ─────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>New Arrivals</Text>
          <Pressable>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        </View>
        <View style={styles.arrivalsList}>
          {NEW_ARRIVALS.map(item => (
            <ArrivalCard key={item.id} item={item} />
          ))}
        </View>

        {/* Bottom padding for tab bar */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0c0c15',
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
    backgroundColor: '#1e4da6',
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: 'rgba(255,255,255,0.07)',
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
    borderColor: '#0c0c15',
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
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing[4],
    gap: Spacing[2],
    height: 46,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
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
    backgroundColor: '#1e4da6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: Radius.lg,
    marginBottom: Spacing[5],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    paddingVertical: Spacing[3],
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.08)',
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
    color: '#4a7ae8',
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
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  catChipActive: {
    backgroundColor: '#1e4da6',
    borderColor: '#2c5bc8',
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
    height: 240,
    borderRadius: Radius.xl,
    padding: Spacing[4],
    overflow: 'hidden',
  },
  featCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.04)',
    top: -60,
    right: -60,
  },
  heartBtn: {
    position: 'absolute',
    top: Spacing[4],
    right: Spacing[4],
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fuelBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing[2],
    paddingVertical: 3,
    borderRadius: Radius.sm,
    marginBottom: Spacing[1],
  },
  fuelText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.9)',
  },
  featImageArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featInfo: {
    gap: 2,
  },
  featYear: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.5)',
  },
  featMake: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.md,
    color: '#fff',
  },
  featModel: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: Spacing[1],
  },
  featMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  featMetaText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.5)',
  },
  featPrice: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.lg,
    color: '#fff',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },

  // New Arrivals
  arrivalsList: {
    gap: Spacing[2],
  },
  arrivalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: Radius.lg,
    padding: Spacing[3],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    gap: Spacing[3],
  },
  arrivalImg: {
    width: 64,
    height: 64,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrivalInfo: {
    flex: 1,
    gap: 3,
  },
  arrivalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  arrivalMake: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.base,
    color: C.foreground,
  },
  fuelBadgeSm: {
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(74,122,232,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(74,122,232,0.3)',
  },
  fuelTextSm: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 10,
    color: '#4a7ae8',
  },
  arrivalModel: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    color: C.mutedForeground,
  },
  arrivalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  arrivalMetaText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    color: C.mutedForeground,
  },
  arrivalPriceCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  arrivalPrice: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.base,
    color: C.foreground,
  },
});
