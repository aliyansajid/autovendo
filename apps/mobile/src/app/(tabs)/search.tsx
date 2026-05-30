import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { Colors, FontFamily, FontSize, Spacing, Radius } from '@/constants/theme';

const C = Colors.dark;

// ─── Data ────────────────────────────────────────────────────────────────────

const FUEL_OPTIONS = [
  { id: 'petrol', label: 'Petrol' },
  { id: 'diesel', label: 'Diesel' },
  { id: 'electric', label: 'Electric' },
  { id: 'mhev-petrol', label: 'Mild Hybrid' },
  { id: 'phev-petrol', label: 'Plug-in Hybrid' },
  { id: 'hev-petrol', label: 'Hybrid' },
  { id: 'hydrogen', label: 'Hydrogen' },
];

const BODY_TYPES = [
  { id: 'suv', label: 'SUV', symbol: 'car.fill' },
  { id: 'saloon', label: 'Sedan', symbol: 'car.side.fill' },
  { id: 'estate', label: 'Estate', symbol: 'car.side.rear.and.front.and.person.fill' },
  { id: 'coupe', label: 'Coupé', symbol: 'car.side.fill' },
  { id: 'cabriolet', label: 'Convertible', symbol: 'car.side.fill' },
  { id: 'small-car', label: 'Small Car', symbol: 'car.side.fill' },
  { id: 'minivan', label: 'Van', symbol: 'bus.fill' },
  { id: 'pickup', label: 'Pickup', symbol: 'truck.box.fill' },
];

const TRANSMISSION = [
  { id: 'automatic', label: 'Automatic' },
  { id: 'manual', label: 'Manual' },
  { id: 'automatic-stepless', label: 'CVT' },
  { id: 'semi-automatic', label: 'Semi-Auto' },
];

const DRIVE_TYPE = [
  { id: 'all', label: 'AWD' },
  { id: 'front', label: 'FWD' },
  { id: 'rear', label: 'RWD' },
];

const CONDITION = [
  { id: 'new', label: 'New' },
  { id: 'used', label: 'Used' },
  { id: 'demonstration', label: 'Demo' },
  { id: 'pre-registered', label: 'Pre-reg' },
  { id: 'oldtimer', label: 'Oldtimer' },
];

// ─── Components ──────────────────────────────────────────────────────────────

function SectionTitle({ title, count }: { title: string; count?: number }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {count !== undefined && (
        <View style={styles.sectionBadge}>
          <Text style={styles.sectionBadgeText}>{count}</Text>
        </View>
      )}
    </View>
  );
}

function RangeInputs({
  from,
  to,
  onFromChange,
  onToChange,
  placeholder,
  suffix,
}: {
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  placeholder?: string;
  suffix?: string;
}) {
  return (
    <View style={styles.rangeRow}>
      <View style={styles.rangeInputWrap}>
        <TextInput
          style={styles.rangeInput}
          value={from}
          onChangeText={onFromChange}
          placeholder="Min"
          placeholderTextColor={C.mutedForeground}
          keyboardType="numeric"
        />
        {suffix && <Text style={styles.rangeSuffix}>{suffix}</Text>}
      </View>
      <View style={styles.rangeDivider} />
      <View style={styles.rangeInputWrap}>
        <TextInput
          style={styles.rangeInput}
          value={to}
          onChangeText={onToChange}
          placeholder="Max"
          placeholderTextColor={C.mutedForeground}
          keyboardType="numeric"
        />
        {suffix && <Text style={styles.rangeSuffix}>{suffix}</Text>}
      </View>
    </View>
  );
}

function MultiChip({
  options,
  selected,
  onToggle,
}: {
  options: { id: string; label: string; symbol?: string }[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <View style={styles.chipGrid}>
      {options.map(o => {
        const active = selected.includes(o.id);
        return (
          <Pressable
            key={o.id}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onToggle(o.id)}>
            {o.symbol && (
              <SymbolView
                name={o.symbol as any}
                size={13}
                tintColor={active ? '#fff' : C.mutedForeground}
              />
            )}
            <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function SelectField({
  label,
  value,
  placeholder,
}: {
  label: string;
  value?: string;
  placeholder: string;
}) {
  return (
    <Pressable style={styles.selectField}>
      <Text style={styles.selectLabel}>{label}</Text>
      <View style={styles.selectRight}>
        <Text style={[styles.selectValue, !value && styles.selectPlaceholder]}>
          {value ?? placeholder}
        </Text>
        <SymbolView name="chevron.down" size={12} tintColor={C.mutedForeground} />
      </View>
    </Pressable>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [kmFrom, setKmFrom] = useState('');
  const [kmTo, setKmTo] = useState('');
  const [fuels, setFuels] = useState<string[]>([]);
  const [bodyTypes, setBodyTypes] = useState<string[]>([]);
  const [transmissions, setTransmissions] = useState<string[]>([]);
  const [drives, setDrives] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);

  const toggle = (arr: string[], setArr: (v: string[]) => void, id: string) => {
    setArr(arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id]);
  };

  const activeCount = [
    fuels.length, bodyTypes.length, transmissions.length,
    drives.length, conditions.length,
    priceFrom || priceTo, yearFrom || yearTo, kmFrom || kmTo,
  ].filter(Boolean).length;

  const handleReset = () => {
    setQuery('');
    setPriceFrom(''); setPriceTo('');
    setYearFrom(''); setYearTo('');
    setKmFrom(''); setKmTo('');
    setFuels([]); setBodyTypes([]);
    setTransmissions([]); setDrives([]);
    setConditions([]);
  };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.heading}>Search</Text>
            <Text style={styles.subheading}>Find your perfect car</Text>
          </View>
          {activeCount > 0 && (
            <Pressable style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetText}>Reset</Text>
              <View style={styles.resetBadge}>
                <Text style={styles.resetBadgeText}>{activeCount}</Text>
              </View>
            </Pressable>
          )}
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <SymbolView name="magnifyingglass" size={16} tintColor={C.mutedForeground} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Make, model, keyword…"
            placeholderTextColor={C.mutedForeground}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <SymbolView name="xmark.circle.fill" size={16} tintColor={C.mutedForeground} />
            </Pressable>
          )}
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* Make / Model */}
        <View style={styles.card}>
          <SectionTitle title="Make & Model" />
          <SelectField label="Make" placeholder="Any make" />
          <View style={styles.divider} />
          <SelectField label="Model" placeholder="Any model" />
        </View>

        {/* Price */}
        <View style={styles.card}>
          <SectionTitle title="Price" />
          <RangeInputs
            from={priceFrom} to={priceTo}
            onFromChange={setPriceFrom} onToChange={setPriceTo}
            suffix="CHF"
          />
        </View>

        {/* Year & Mileage */}
        <View style={styles.card}>
          <SectionTitle title="Year" />
          <RangeInputs
            from={yearFrom} to={yearTo}
            onFromChange={setYearFrom} onToChange={setYearTo}
          />
          <View style={styles.cardDivider} />
          <SectionTitle title="Mileage" />
          <RangeInputs
            from={kmFrom} to={kmTo}
            onFromChange={setKmFrom} onToChange={setKmTo}
            suffix="km"
          />
        </View>

        {/* Condition */}
        <View style={styles.card}>
          <SectionTitle title="Condition" count={conditions.length || undefined} />
          <MultiChip
            options={CONDITION}
            selected={conditions}
            onToggle={id => toggle(conditions, setConditions, id)}
          />
        </View>

        {/* Fuel Type */}
        <View style={styles.card}>
          <SectionTitle title="Fuel Type" count={fuels.length || undefined} />
          <MultiChip
            options={FUEL_OPTIONS}
            selected={fuels}
            onToggle={id => toggle(fuels, setFuels, id)}
          />
        </View>

        {/* Body Type */}
        <View style={styles.card}>
          <SectionTitle title="Body Type" count={bodyTypes.length || undefined} />
          <MultiChip
            options={BODY_TYPES}
            selected={bodyTypes}
            onToggle={id => toggle(bodyTypes, setBodyTypes, id)}
          />
        </View>

        {/* Transmission & Drive */}
        <View style={styles.card}>
          <SectionTitle title="Transmission" count={transmissions.length || undefined} />
          <MultiChip
            options={TRANSMISSION}
            selected={transmissions}
            onToggle={id => toggle(transmissions, setTransmissions, id)}
          />
          <View style={styles.cardDivider} />
          <SectionTitle title="Drive Type" count={drives.length || undefined} />
          <MultiChip
            options={DRIVE_TYPE}
            selected={drives}
            onToggle={id => toggle(drives, setDrives, id)}
          />
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky search button */}
      <View style={styles.footer}>
        <Pressable style={styles.searchBtn}>
          <SymbolView name="magnifyingglass" size={16} tintColor="#fff" />
          <Text style={styles.searchBtnText}>Show Results</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0c0c15' },

  headerSafe: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing[4],
    paddingBottom: Spacing[3],
  },
  heading: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize['2xl'],
    color: C.foreground,
  },
  subheading: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    color: C.mutedForeground,
    marginTop: 2,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  resetText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.sm,
    color: C.mutedForeground,
  },
  resetBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#1e4da6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBadgeText: {
    fontFamily: FontFamily.sansBold,
    fontSize: 10,
    color: '#fff',
  },

  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing[4],
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

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    gap: Spacing[3],
  },

  // Card
  card: {
    backgroundColor: '#161624',
    borderRadius: Radius.xl,
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    gap: Spacing[3],
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: Spacing[1],
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  sectionTitle: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: FontSize.base,
    color: C.foreground,
  },
  sectionBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.full,
    backgroundColor: '#1e4da6',
  },
  sectionBadgeText: {
    fontFamily: FontFamily.sansBold,
    fontSize: 10,
    color: '#fff',
  },

  // Range inputs
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  rangeInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing[3],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    height: 44,
  },
  rangeInput: {
    flex: 1,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    color: C.foreground,
    height: 44,
  },
  rangeSuffix: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    color: C.mutedForeground,
    marginLeft: 4,
  },
  rangeDivider: {
    width: 12,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  // Chips
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  chipActive: {
    backgroundColor: '#1e4da6',
    borderColor: '#2c5bc8',
  },
  chipLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.sm,
    color: C.mutedForeground,
  },
  chipLabelActive: {
    color: '#fff',
  },

  // Select field
  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing[2],
  },
  selectLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.base,
    color: C.foreground,
  },
  selectRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  selectValue: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    color: C.foreground,
  },
  selectPlaceholder: {
    color: C.mutedForeground,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing[5],
    paddingBottom: 100,
    paddingTop: Spacing[3],
  },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    height: 52,
    borderRadius: Radius.xl,
    backgroundColor: '#1e4da6',
  },
  searchBtnText: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.base,
    color: '#fff',
  },
});
