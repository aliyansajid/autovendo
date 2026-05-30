import { useMemo } from 'react';
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
import { FontFamily, FontSize, Spacing, Radius, type ThemeColors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useTabBarHeight } from '@/hooks/use-tab-bar-height';
import { router } from 'expo-router';
import type { SearchParams } from '@/lib/api';
import {
  type VehicleType,
  VEHICLE_TYPES,
  CAR_BODY_TYPES, CAMPER_BODY_TYPES, UTILITY_BODY_TYPES, TRUCK_BODY_TYPES,
  CAR_FUEL_TYPES, CAMPER_FUEL_TYPES, UTILITY_FUEL_TYPES, TRUCK_FUEL_TYPES,
  CAR_EXTRAS, CAMPER_EXTRAS, UTILITY_EXTRAS, TRUCK_EXTRAS,
  CAR_TOP_MAKES, CAR_ALL_MAKES,
  CAMPER_TOP_MAKES, CAMPER_ALL_MAKES,
  UTILITY_TOP_MAKES, UTILITY_ALL_MAKES,
  TRUCK_TOP_MAKES, TRUCK_ALL_MAKES,
} from '@/constants/vehicle';

// ─── Static Constants ─────────────────────────────────────────────────────────

const TRANSMISSION = [
  { value: 'automatic', label: 'Automatik' },
  { value: 'manual', label: 'Schaltgetriebe' },
  { value: 'automatic-stepless', label: 'Stufenloses Getriebe' },
  { value: 'semi-automatic', label: 'Halbautomatik' },
];

const DRIVE_TYPE = [
  { value: 'all', label: 'Allrad / 4x4' },
  { value: 'front', label: 'Frontantrieb' },
  { value: 'rear', label: 'Hinterradantrieb' },
];

const CONDITION = [
  { value: 'new', label: 'Neu' },
  { value: 'used', label: 'Occasion' },
  { value: 'demonstration', label: 'Vorführwagen' },
  { value: 'pre-registered', label: 'Tageszulassung' },
  { value: 'oldtimer', label: 'Oldtimer' },
];

const ENERGY_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

const ENERGY_COLORS: Record<string, string> = {
  A: '#00a651', B: '#4db848', C: '#8dc63f',
  D: '#f7ed00', E: '#fbb612', F: '#f37021', G: '#ed1c24',
};

const EURO_NORMS = [
  { value: 'euro-6e', label: 'Euro 6e' },
  { value: 'euro-6d-isc-fcm', label: 'Euro 6d-ISC-FCM' },
  { value: 'euro-6d-isc', label: 'Euro 6d-ISC' },
  { value: 'euro-6d-temp-evap-isc', label: 'Euro 6d-Temp-EVAP-ISC' },
  { value: 'euro-6d-temp-evap', label: 'Euro 6d-Temp-EVAP' },
  { value: 'euro-6d-temp-isc', label: 'Euro 6d-Temp-ISC' },
  { value: 'euro-6d-temp', label: 'Euro 6d-Temp' },
  { value: 'euro-6d', label: 'Euro 6d' },
  { value: 'euro-6c', label: 'Euro 6c' },
  { value: 'euro-6b', label: 'Euro 6b' },
  { value: 'euro-6a', label: 'Euro 6a' },
  { value: 'euro-6', label: 'Euro 6' },
  { value: 'euro-5-plus', label: 'Euro 5+' },
  { value: 'euro-5', label: 'Euro 5' },
  { value: 'euro-4', label: 'Euro 4' },
  { value: 'euro-3', label: 'Euro 3' },
  { value: 'euro-2', label: 'Euro 2' },
  { value: 'euro-1', label: 'Euro 1' },
];

const COLORS_EXT = [
  { value: 'black', label: 'Schwarz', hex: '#1a1a1a' },
  { value: 'white', label: 'Weiss', hex: '#f5f5f5' },
  { value: 'gray', label: 'Grau', hex: '#808080' },
  { value: 'silver', label: 'Silber', hex: '#c0c0c0' },
  { value: 'blue', label: 'Blau', hex: '#1e4da6' },
  { value: 'red', label: 'Rot', hex: '#c0392b' },
  { value: 'green', label: 'Grün', hex: '#27ae60' },
  { value: 'brown', label: 'Braun', hex: '#7b4a2d' },
  { value: 'beige', label: 'Beige', hex: '#d9c8a0' },
  { value: 'orange', label: 'Orange', hex: '#e67e22' },
  { value: 'yellow', label: 'Gelb', hex: '#f1c40f' },
  { value: 'gold', label: 'Gold', hex: '#c9a227' },
  { value: 'bordeaux', label: 'Bordeaux', hex: '#6b1a2a' },
  { value: 'violet', label: 'Violett', hex: '#8e44ad' },
  { value: 'turquoise', label: 'Türkis', hex: '#1abc9c' },
  { value: 'pink', label: 'Pink', hex: '#ff69b4' },
  { value: 'anthracite', label: 'Anthrazit', hex: '#3c3c3c' },
  { value: 'multicoloured', label: 'Mehrfarbig', hex: '' },
  { value: 'other', label: 'Andere', hex: '#999' },
];

const EQUIPMENT = [
  '360°-kamera', 'abs', 'adaptiver-fernlicht-assistent', 'adaptiver-tempomat',
  'alarmanlage', 'alufelgen', 'android-auto', 'apple-carplay',
  'bluetooth', 'bremsassistent', 'dab-radio', 'differentialsperre',
  'elektrische-fensterheber', 'elektrische-heckklappe', 'elektrische-sitzeinstellung',
  'freisprechanlage', 'head-up-display', 'sitzheizung', 'sitzbeluftung',
  'isofix', 'klimaanlage', 'klimaautomatik', 'navigationssystem',
  'panoramadach', 'einparkassistent', 'einparkpiepser-hinten', 'einparkpiepser-vorne',
  'rueckfahrkamera', 'led-scheinwerfer', 'xenon-scheinwerfer', 'laser-scheinwerfer',
  'schiebedach', 'schiebetuer', 'keyless-entry-start', 'schnellladen',
  'ledersitze', 'alcantara', 'sportsitze', 'sitzverkleidung',
  'spurhalteassistent', 'totwinkel-assistent', 'esp', 'start-stopp-system',
  'tempomat', 'standheizung', 'anhaengerkupplung', 'luftfederung',
  'dachreling', 'sonderlackierung', 'sportauspuff', 'sportfahrwerk',
];

const DAYS_LISTED = [
  { value: 'any', label: 'Beliebig' },
  { value: '1', label: '1 Tag' },
  { value: '2', label: '2 Tage' },
  { value: '3', label: '3 Tage' },
  { value: '5', label: '5 Tage' },
  { value: '7', label: '7 Tage' },
  { value: '14', label: '14 Tage' },
  { value: '28', label: '28 Tage' },
];

// ─── Per-type data helpers ────────────────────────────────────────────────────

function getBodyTypes(t: VehicleType) {
  if (t === 'camper') return CAMPER_BODY_TYPES;
  if (t === 'utility') return UTILITY_BODY_TYPES;
  if (t === 'truck') return TRUCK_BODY_TYPES;
  return CAR_BODY_TYPES;
}

function getFuelTypes(t: VehicleType) {
  if (t === 'camper') return CAMPER_FUEL_TYPES;
  if (t === 'utility') return UTILITY_FUEL_TYPES;
  if (t === 'truck') return TRUCK_FUEL_TYPES;
  return CAR_FUEL_TYPES;
}

function getExtras(t: VehicleType) {
  if (t === 'camper') return CAMPER_EXTRAS;
  if (t === 'utility') return UTILITY_EXTRAS;
  if (t === 'truck') return TRUCK_EXTRAS;
  return CAR_EXTRAS;
}

function getTopMakes(t: VehicleType) {
  if (t === 'camper') return CAMPER_TOP_MAKES;
  if (t === 'utility') return UTILITY_TOP_MAKES;
  if (t === 'truck') return TRUCK_TOP_MAKES;
  return CAR_TOP_MAKES;
}

function getAllMakes(t: VehicleType) {
  if (t === 'camper') return CAMPER_ALL_MAKES;
  if (t === 'utility') return UTILITY_ALL_MAKES;
  if (t === 'truck') return TRUCK_ALL_MAKES;
  return CAR_ALL_MAKES;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AccordionSection({
  title,
  count,
  children,
  defaultOpen = false,
  styles,
  C,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
  styles: ReturnType<typeof createStyles>;
  C: ThemeColors;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={styles.card}>
      <Pressable style={styles.accordionHeader} onPress={() => setOpen(v => !v)}>
        <View style={styles.accordionLeft}>
          <Text style={styles.accordionTitle}>{title}</Text>
          {!!count && (
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>{count}</Text>
            </View>
          )}
        </View>
        <SymbolView
          name={open ? 'chevron.up' : 'chevron.down'}
          size={13}
          tintColor={C.mutedForeground}
        />
      </Pressable>
      {open && <View style={styles.accordionBody}>{children}</View>}
    </View>
  );
}

function RangeInputs({
  from, to, onFromChange, onToChange, suffix, styles, C,
}: {
  from: string; to: string;
  onFromChange: (v: string) => void; onToChange: (v: string) => void;
  suffix?: string;
  styles: ReturnType<typeof createStyles>;
  C: ThemeColors;
}) {
  return (
    <View style={styles.rangeRow}>
      <View style={styles.rangeInputWrap}>
        <TextInput style={styles.rangeInput} value={from} onChangeText={onFromChange}
          placeholder="Min" placeholderTextColor={C.mutedForeground} keyboardType="numeric" />
        {suffix && <Text style={styles.rangeSuffix}>{suffix}</Text>}
      </View>
      <View style={styles.rangeDash} />
      <View style={styles.rangeInputWrap}>
        <TextInput style={styles.rangeInput} value={to} onChangeText={onToChange}
          placeholder="Max" placeholderTextColor={C.mutedForeground} keyboardType="numeric" />
        {suffix && <Text style={styles.rangeSuffix}>{suffix}</Text>}
      </View>
    </View>
  );
}

function ChipGroup({
  options, selected, onToggle, styles,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (id: string) => void;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.chipGrid}>
      {options.map(o => {
        const active = selected.includes(o.value);
        return (
          <Pressable key={o.value} style={[styles.chip, active && styles.chipActive]}
            onPress={() => onToggle(o.value)}>
            <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function RadioGroup({
  options, selected, onSelect, styles,
}: {
  options: { value: string; label: string }[];
  selected: string;
  onSelect: (id: string) => void;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.chipGrid}>
      {options.map(o => {
        const active = selected === o.value;
        return (
          <Pressable key={o.value} style={[styles.chip, active && styles.chipActive]}
            onPress={() => onSelect(o.value)}>
            <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function MakesPicker({
  vehicleType, selected, onToggle, styles, C,
}: {
  vehicleType: VehicleType;
  selected: string[];
  onToggle: (id: string) => void;
  styles: ReturnType<typeof createStyles>;
  C: ThemeColors;
}) {
  const [showAll, setShowAll] = useState(false);
  const topMakes = getTopMakes(vehicleType);
  const allMakes = getAllMakes(vehicleType);
  return (
    <View style={{ gap: Spacing[3] }}>
      <Text style={styles.groupLabel}>Top-Marken</Text>
      <ChipGroup options={topMakes} selected={selected} onToggle={onToggle} styles={styles} />
      {showAll && (
        <>
          <Text style={styles.groupLabel}>Alle Marken</Text>
          <ChipGroup options={allMakes} selected={selected} onToggle={onToggle} styles={styles} />
        </>
      )}
      <Pressable style={styles.showMoreBtn} onPress={() => setShowAll(v => !v)}>
        <Text style={styles.showMoreText}>{showAll ? 'Weniger anzeigen' : 'Alle Marken anzeigen'}</Text>
        <SymbolView name={showAll ? 'chevron.up' : 'chevron.down'} size={12} tintColor={C.sidebarPrimary} />
      </Pressable>
    </View>
  );
}

function ColorPicker({
  selected, onToggle, styles, C,
}: {
  selected: string[];
  onToggle: (id: string) => void;
  styles: ReturnType<typeof createStyles>;
  C: ThemeColors;
}) {
  return (
    <View style={styles.colorGrid}>
      {COLORS_EXT.map(c => {
        const active = selected.includes(c.value);
        return (
          <Pressable key={c.value} style={styles.colorItem} onPress={() => onToggle(c.value)}>
            <View style={[
              styles.colorSwatch,
              { backgroundColor: c.hex || '#888' },
              active && styles.colorSwatchActive,
              c.value === 'white' && styles.colorSwatchBorder,
            ]}>
              {active && (
                <SymbolView name="checkmark" size={12}
                  tintColor={['white', 'beige', 'silver', 'yellow', 'gold'].includes(c.value) ? '#000' : '#fff'} />
              )}
              {c.value === 'multicoloured' && (
                <View style={styles.multiColor}>
                  {['#c0392b', '#1e4da6', '#27ae60', '#f1c40f'].map((col, i) => (
                    <View key={i} style={[styles.multiSlice, { backgroundColor: col }]} />
                  ))}
                </View>
              )}
            </View>
            <Text style={[styles.colorLabel, active && styles.colorLabelActive]} numberOfLines={1}>
              {c.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function EquipmentPicker({
  selected, onToggle, styles, C,
}: {
  selected: string[];
  onToggle: (id: string) => void;
  styles: ReturnType<typeof createStyles>;
  C: ThemeColors;
}) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? EQUIPMENT : EQUIPMENT.slice(0, 16);
  return (
    <View style={{ gap: Spacing[3] }}>
      <View style={styles.chipGrid}>
        {visible.map(eq => {
          const active = selected.includes(eq);
          return (
            <Pressable key={eq} style={[styles.chip, active && styles.chipActive]}
              onPress={() => onToggle(eq)}>
              <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{eq}</Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable style={styles.showMoreBtn} onPress={() => setShowAll(v => !v)}>
        <Text style={styles.showMoreText}>{showAll ? 'Weniger anzeigen' : `Alle ${EQUIPMENT.length} Optionen anzeigen`}</Text>
        <SymbolView name={showAll ? 'chevron.up' : 'chevron.down'} size={12} tintColor={C.sidebarPrimary} />
      </Pressable>
    </View>
  );
}

function Divider({ styles }: { styles: ReturnType<typeof createStyles> }) {
  return <View style={styles.divider} />;
}

function Toggle({ label, value, onToggle, styles }: { label: string; value: boolean; onToggle: () => void; styles: ReturnType<typeof createStyles> }) {
  return (
    <Pressable style={styles.toggleRow} onPress={onToggle}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <View style={[styles.toggleTrack, value && styles.toggleTrackOn]}>
        <View style={[styles.toggleThumb, value && styles.toggleThumbOn]} />
      </View>
    </Pressable>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SearchScreen() {
  const C = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const tabBarHeight = useTabBarHeight();

  // Vehicle type
  const [vehicleType, setVehicleType] = useState<VehicleType>('car');

  const [query, setQuery] = useState('');
  // Make
  const [makes, setMakes] = useState<string[]>([]);
  // Price / Year / Mileage
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [kmFrom, setKmFrom] = useState('');
  const [kmTo, setKmTo] = useState('');
  // Condition
  const [conditions, setConditions] = useState<string[]>([]);
  const [mfk, setMfk] = useState(false);
  const [warranty, setWarranty] = useState(false);
  // Body / Fuel / Transmission / Drive
  const [bodyTypes, setBodyTypes] = useState<string[]>([]);
  const [fuels, setFuels] = useState<string[]>([]);
  const [transmissions, setTransmissions] = useState<string[]>([]);
  const [drives, setDrives] = useState<string[]>([]);
  // Power / Capacity / Cylinders
  const [powerUnit, setPowerUnit] = useState<'ps' | 'kw'>('ps');
  const [powerFrom, setPowerFrom] = useState('');
  const [powerTo, setPowerTo] = useState('');
  const [capFrom, setCapFrom] = useState('');
  const [capTo, setCapTo] = useState('');
  const [cylFrom, setCylFrom] = useState('');
  const [cylTo, setCylTo] = useState('');
  // Appearance
  const [extColors, setExtColors] = useState<string[]>([]);
  const [intColors, setIntColors] = useState<string[]>([]);
  const [metallic, setMetallic] = useState(false);
  // Equipment / Extras
  const [equipment, setEquipment] = useState<string[]>([]);
  const [extras, setExtras] = useState<string[]>([]);
  // Energy & Emissions
  const [consumFrom, setConsumFrom] = useState('');
  const [consumTo, setConsumTo] = useState('');
  const [co2From, setCo2From] = useState('');
  const [co2To, setCo2To] = useState('');
  const [energyLabels, setEnergyLabels] = useState<string[]>([]);
  const [euroNorms, setEuroNorms] = useState<string[]>([]);
  // Listing
  const [daysListed, setDaysListed] = useState('any');

  const toggle = (arr: string[], setArr: (v: string[]) => void, id: string) =>
    setArr(arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id]);

  const handleTypeChange = (t: VehicleType) => {
    setVehicleType(t);
    // Reset type-specific filters when switching
    setMakes([]);
    setBodyTypes([]);
    setFuels([]);
    setExtras([]);
  };

  const activeCount = [
    makes.length, fuels.length, bodyTypes.length, transmissions.length, drives.length,
    conditions.length, extColors.length, intColors.length, equipment.length,
    extras.length, energyLabels.length, euroNorms.length,
    priceFrom || priceTo, yearFrom || yearTo, kmFrom || kmTo,
    powerFrom || powerTo, capFrom || capTo, cylFrom || cylTo,
    consumFrom || consumTo, co2From || co2To,
    mfk, warranty, metallic,
    daysListed !== 'any',
  ].filter(Boolean).length;

  const handleSearch = () => {
    const toNum = (v: string) => (v ? Number(v) : undefined);
    const params: SearchParams = {
      vehicleType,
      ...(query ? { q: query } : {}),
      ...(makes.length ? { make: makes } : {}),
      ...(fuels.length ? { fuel: fuels } : {}),
      ...(transmissions.length ? { transmission: transmissions } : {}),
      ...(drives.length ? { drive: drives } : {}),
      ...(bodyTypes.length ? { bodyType: bodyTypes } : {}),
      ...(conditions.length ? { condition: conditions } : {}),
      ...(extColors.length ? { color: extColors } : {}),
      ...(intColors.length ? { intColor: intColors } : {}),
      ...(energyLabels.length ? { energyLabel: energyLabels } : {}),
      ...(euroNorms.length ? { euroNorm: euroNorms } : {}),
      ...(equipment.length ? { equipment } : {}),
      ...(toNum(priceFrom) !== undefined ? { priceFrom: toNum(priceFrom) } : {}),
      ...(toNum(priceTo) !== undefined ? { priceTo: toNum(priceTo) } : {}),
      ...(toNum(yearFrom) !== undefined ? { yearFrom: toNum(yearFrom) } : {}),
      ...(toNum(yearTo) !== undefined ? { yearTo: toNum(yearTo) } : {}),
      ...(toNum(kmFrom) !== undefined ? { kmFrom: toNum(kmFrom) } : {}),
      ...(toNum(kmTo) !== undefined ? { kmTo: toNum(kmTo) } : {}),
      ...(toNum(powerFrom) !== undefined ? { powerFrom: toNum(powerFrom) } : {}),
      ...(toNum(powerTo) !== undefined ? { powerTo: toNum(powerTo) } : {}),
      ...(toNum(capFrom) !== undefined ? { cubicFrom: toNum(capFrom) } : {}),
      ...(toNum(capTo) !== undefined ? { cubicTo: toNum(capTo) } : {}),
      ...(toNum(cylFrom) !== undefined ? { cylinderFrom: toNum(cylFrom) } : {}),
      ...(toNum(cylTo) !== undefined ? { cylinderTo: toNum(cylTo) } : {}),
      ...(toNum(consumFrom) !== undefined ? { consumFrom: toNum(consumFrom) } : {}),
      ...(toNum(consumTo) !== undefined ? { consumTo: toNum(consumTo) } : {}),
      ...(toNum(co2From) !== undefined ? { co2From: toNum(co2From) } : {}),
      ...(toNum(co2To) !== undefined ? { co2To: toNum(co2To) } : {}),
      powerUnit,
      ...(metallic ? { metallic } : {}),
      ...(mfk ? { mfk } : {}),
      ...(warranty ? { warranty } : {}),
      ...(daysListed !== 'any' ? { daysListed: Number(daysListed) } : {}),
    };
    router.push({ pathname: '/search-results', params: { filters: JSON.stringify(params) } } as any);
  };

  const handleReset = () => {
    setQuery(''); setMakes([]);
    setPriceFrom(''); setPriceTo('');
    setYearFrom(''); setYearTo('');
    setKmFrom(''); setKmTo('');
    setConditions([]); setMfk(false); setWarranty(false);
    setBodyTypes([]); setFuels([]); setTransmissions([]); setDrives([]);
    setPowerUnit('ps'); setPowerFrom(''); setPowerTo('');
    setCapFrom(''); setCapTo(''); setCylFrom(''); setCylTo('');
    setExtColors([]); setIntColors([]); setMetallic(false);
    setEquipment([]); setExtras([]);
    setConsumFrom(''); setConsumTo(''); setCo2From(''); setCo2To('');
    setEnergyLabels([]); setEuroNorms([]);
    setDaysListed('any');
  };

  const bodyTypeOptions = getBodyTypes(vehicleType);
  const fuelTypeOptions = getFuelTypes(vehicleType);
  const extrasOptions = getExtras(vehicleType);

  return (
    <View style={styles.root}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <View>
            <Text style={styles.heading}>Suche</Text>
            <Text style={styles.subheading}>Finde dein Fahrzeug</Text>
          </View>
          {activeCount > 0 && (
            <Pressable style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetText}>Zurücksetzen</Text>
              <View style={styles.resetBadge}>
                <Text style={styles.resetBadgeText}>{activeCount}</Text>
              </View>
            </Pressable>
          )}
        </View>
        <View style={styles.searchBar}>
          <SymbolView name="magnifyingglass" size={16} tintColor={C.mutedForeground} />
          <TextInput style={styles.searchInput} value={query} onChangeText={setQuery}
            placeholder="Marke, Modell, Stichwort…" placeholderTextColor={C.mutedForeground}
            returnKeyType="search" />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <SymbolView name="xmark.circle.fill" size={16} tintColor={C.mutedForeground} />
            </Pressable>
          )}
        </View>

        {/* Vehicle Type Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeTabs}
          contentContainerStyle={styles.typeTabsContent}>
          {VEHICLE_TYPES.map(t => {
            const active = vehicleType === t.value;
            return (
              <Pressable key={t.value} style={[styles.typeTab, active && styles.typeTabActive]}
                onPress={() => handleTypeChange(t.value as VehicleType)}>
                <Text style={[styles.typeTabLabel, active && styles.typeTabLabelActive]}>
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </SafeAreaView>

      <ScrollView style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + 80 }]}
        showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Make */}
        <AccordionSection title="Marke" defaultOpen
          count={makes.length || undefined} styles={styles} C={C}>
          <MakesPicker vehicleType={vehicleType} selected={makes}
            onToggle={id => toggle(makes, setMakes, id)} styles={styles} C={C} />
        </AccordionSection>

        {/* Basic Data */}
        <AccordionSection title="Grunddaten" defaultOpen styles={styles} C={C}
          count={[priceFrom || priceTo, yearFrom || yearTo, kmFrom || kmTo, conditions.length, bodyTypes.length].filter(Boolean).length || undefined}>
          <Text style={styles.groupLabel}>Preis</Text>
          <RangeInputs from={priceFrom} to={priceTo} onFromChange={setPriceFrom} onToChange={setPriceTo} suffix="CHF" styles={styles} C={C} />
          <Divider styles={styles} />
          <Text style={styles.groupLabel}>Jahrgang</Text>
          <RangeInputs from={yearFrom} to={yearTo} onFromChange={setYearFrom} onToChange={setYearTo} styles={styles} C={C} />
          <Divider styles={styles} />
          <Text style={styles.groupLabel}>Kilometerstand</Text>
          <RangeInputs from={kmFrom} to={kmTo} onFromChange={setKmFrom} onToChange={setKmTo} suffix="km" styles={styles} C={C} />
          <Divider styles={styles} />
          <Text style={styles.groupLabel}>Zustand</Text>
          <ChipGroup options={CONDITION} selected={conditions} onToggle={id => toggle(conditions, setConditions, id)} styles={styles} />
          <Toggle label="MFK bestanden" value={mfk} onToggle={() => setMfk(v => !v)} styles={styles} />
          <Toggle label="Mit Garantie" value={warranty} onToggle={() => setWarranty(v => !v)} styles={styles} />
          <Divider styles={styles} />
          <Text style={styles.groupLabel}>Fahrzeugtyp</Text>
          <ChipGroup options={bodyTypeOptions} selected={bodyTypes} onToggle={id => toggle(bodyTypes, setBodyTypes, id)} styles={styles} />
        </AccordionSection>

        {/* Technical Data */}
        <AccordionSection title="Technische Daten" styles={styles} C={C}
          count={[fuels.length, transmissions.length, drives.length, powerFrom || powerTo, capFrom || capTo, cylFrom || cylTo].filter(Boolean).length || undefined}>
          <Text style={styles.groupLabel}>Treibstoff</Text>
          <ChipGroup options={fuelTypeOptions} selected={fuels} onToggle={id => toggle(fuels, setFuels, id)} styles={styles} />
          <Divider styles={styles} />
          <Text style={styles.groupLabel}>Getriebe</Text>
          <ChipGroup options={TRANSMISSION} selected={transmissions} onToggle={id => toggle(transmissions, setTransmissions, id)} styles={styles} />
          <Divider styles={styles} />
          <Text style={styles.groupLabel}>Antrieb</Text>
          <ChipGroup options={DRIVE_TYPE} selected={drives} onToggle={id => toggle(drives, setDrives, id)} styles={styles} />
          <Divider styles={styles} />
          <View style={styles.powerHeader}>
            <Text style={styles.groupLabel}>Leistung</Text>
            <View style={styles.unitToggle}>
              {(['ps', 'kw'] as const).map(u => (
                <Pressable key={u} style={[styles.unitBtn, powerUnit === u && styles.unitBtnActive]}
                  onPress={() => { setPowerUnit(u); setPowerFrom(''); setPowerTo(''); }}>
                  <Text style={[styles.unitBtnText, powerUnit === u && styles.unitBtnTextActive]}>
                    {u.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <RangeInputs from={powerFrom} to={powerTo} onFromChange={setPowerFrom} onToChange={setPowerTo} suffix={powerUnit === 'ps' ? 'PS' : 'kW'} styles={styles} C={C} />
          <Divider styles={styles} />
          <Text style={styles.groupLabel}>Hubraum</Text>
          <RangeInputs from={capFrom} to={capTo} onFromChange={setCapFrom} onToChange={setCapTo} suffix="cm³" styles={styles} C={C} />
          <Divider styles={styles} />
          <Text style={styles.groupLabel}>Zylinder</Text>
          <RangeInputs from={cylFrom} to={cylTo} onFromChange={setCylFrom} onToChange={setCylTo} styles={styles} C={C} />
        </AccordionSection>

        {/* Appearance */}
        <AccordionSection title="Erscheinungsbild" styles={styles} C={C}
          count={[extColors.length, intColors.length, metallic].filter(Boolean).length || undefined}>
          <Text style={styles.groupLabel}>Aussenfarbe</Text>
          <ColorPicker selected={extColors} onToggle={id => toggle(extColors, setExtColors, id)} styles={styles} C={C} />
          <Divider styles={styles} />
          <Text style={styles.groupLabel}>Innenfarbe</Text>
          <ColorPicker selected={intColors} onToggle={id => toggle(intColors, setIntColors, id)} styles={styles} C={C} />
          <Divider styles={styles} />
          <Toggle label="Metallic" value={metallic} onToggle={() => setMetallic(v => !v)} styles={styles} />
        </AccordionSection>

        {/* Equipment */}
        <AccordionSection title="Ausstattung" count={equipment.length || undefined} styles={styles} C={C}>
          <EquipmentPicker selected={equipment} onToggle={eq => toggle(equipment, setEquipment, eq)} styles={styles} C={C} />
        </AccordionSection>

        {/* Extras */}
        {extrasOptions.length > 0 && (
          <AccordionSection title="Extras" count={extras.length || undefined} styles={styles} C={C}>
            <ChipGroup options={extrasOptions} selected={extras} onToggle={id => toggle(extras, setExtras, id)} styles={styles} />
          </AccordionSection>
        )}

        {/* Energy & Emissions */}
        <AccordionSection title="Energie & Emissionen" styles={styles} C={C}
          count={[energyLabels.length, euroNorms.length, consumFrom || consumTo, co2From || co2To].filter(Boolean).length || undefined}>
          <Text style={styles.groupLabel}>Verbrauch</Text>
          <RangeInputs from={consumFrom} to={consumTo} onFromChange={setConsumFrom} onToChange={setConsumTo} suffix="l/100km" styles={styles} C={C} />
          <Divider styles={styles} />
          <Text style={styles.groupLabel}>CO₂-Emissionen</Text>
          <RangeInputs from={co2From} to={co2To} onFromChange={setCo2From} onToChange={setCo2To} suffix="g/km" styles={styles} C={C} />
          <Divider styles={styles} />
          <Text style={styles.groupLabel}>Energieetikette</Text>
          <View style={styles.energyGrid}>
            {ENERGY_LABELS.map(l => {
              const active = energyLabels.includes(l);
              return (
                <Pressable key={l} style={[styles.energyChip, { borderColor: ENERGY_COLORS[l] }, active && { backgroundColor: ENERGY_COLORS[l] }]}
                  onPress={() => toggle(energyLabels, setEnergyLabels, l)}>
                  <Text style={[styles.energyLabel, active && styles.energyLabelActive]}>{l}</Text>
                </Pressable>
              );
            })}
          </View>
          <Divider styles={styles} />
          <Text style={styles.groupLabel}>Euro-Norm</Text>
          <ChipGroup options={EURO_NORMS} selected={euroNorms} onToggle={id => toggle(euroNorms, setEuroNorms, id)} styles={styles} />
        </AccordionSection>

        {/* Listing */}
        <AccordionSection title="Inserat" count={daysListed !== 'any' ? 1 : undefined} styles={styles} C={C}>
          <Text style={styles.groupLabel}>Eingestellt innerhalb</Text>
          <RadioGroup options={DAYS_LISTED} selected={daysListed} onSelect={setDaysListed} styles={styles} />
        </AccordionSection>

      </ScrollView>

      {/* Sticky button */}
      <View style={[styles.footer, { paddingBottom: tabBarHeight }]}>
        <Pressable style={styles.searchBtn} onPress={handleSearch}>
          <SymbolView name="magnifyingglass" size={16} tintColor="#fff" />
          <Text style={styles.searchBtnText}>Ergebnisse anzeigen</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function createStyles(C: ThemeColors) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: C.background },

    headerSafe: {
      paddingBottom: Spacing[2],
      borderBottomWidth: 1,
      borderBottomColor: C.secondary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing[5],
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
      borderColor: C.border,
      backgroundColor: C.border,
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
      backgroundColor: C.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    resetBadgeText: { fontFamily: FontFamily.sansBold, fontSize: 10, color: '#fff' },

    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing[2],
      backgroundColor: C.secondary,
      borderRadius: Radius.xl,
      paddingHorizontal: Spacing[4],
      marginHorizontal: Spacing[5],
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

    // Vehicle type tabs
    typeTabs: {
      marginTop: Spacing[3],
    },
    typeTabsContent: {
      paddingHorizontal: Spacing[5],
      gap: Spacing[2],
      flexDirection: 'row',
    },
    typeTab: {
      paddingHorizontal: Spacing[4],
      paddingVertical: Spacing[2],
      borderRadius: Radius.full,
      borderWidth: 1,
      borderColor: C.border,
      backgroundColor: C.secondary,
    },
    typeTabActive: {
      backgroundColor: C.primary,
      borderColor: C.sidebarPrimary,
    },
    typeTabLabel: {
      fontFamily: FontFamily.sansMedium,
      fontSize: FontSize.sm,
      color: C.mutedForeground,
    },
    typeTabLabelActive: {
      color: '#fff',
    },

    scroll: { flex: 1 },
    scrollContent: {
      paddingHorizontal: Spacing[4],
      paddingTop: Spacing[4],
      gap: Spacing[3],
    },

    // Accordion
    card: {
      backgroundColor: C.card,
      borderRadius: Radius.xl,
      borderWidth: 1,
      borderColor: C.border,
      overflow: 'hidden',
    },
    accordionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: Spacing[4],
    },
    accordionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing[2],
    },
    accordionTitle: {
      fontFamily: FontFamily.sansSemiBold,
      fontSize: FontSize.base,
      color: C.foreground,
    },
    accordionBody: {
      paddingHorizontal: Spacing[4],
      paddingBottom: Spacing[4],
      gap: Spacing[3],
    },
    sectionBadge: {
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: Radius.full,
      backgroundColor: C.primary,
    },
    sectionBadgeText: { fontFamily: FontFamily.sansBold, fontSize: 10, color: '#fff' },

    groupLabel: {
      fontFamily: FontFamily.sansMedium,
      fontSize: FontSize.sm,
      color: C.mutedForeground,
      marginBottom: -Spacing[1],
    },

    divider: {
      height: 1,
      backgroundColor: C.secondary,
    },

    // Range
    rangeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing[2],
    },
    rangeInputWrap: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: C.secondary,
      borderRadius: Radius.lg,
      paddingHorizontal: Spacing[3],
      borderWidth: 1,
      borderColor: C.border,
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
    },
    rangeDash: {
      width: 10,
      height: 1,
      backgroundColor: C.mutedForeground,
    },

    // Chips
    chipGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing[2],
    },
    chip: {
      paddingHorizontal: Spacing[3],
      paddingVertical: Spacing[2],
      borderRadius: Radius.full,
      backgroundColor: C.secondary,
      borderWidth: 1,
      borderColor: C.border,
    },
    chipActive: {
      backgroundColor: C.primary,
      borderColor: C.sidebarPrimary,
    },
    chipLabel: {
      fontFamily: FontFamily.sansMedium,
      fontSize: FontSize.sm,
      color: C.mutedForeground,
    },
    chipLabelActive: { color: '#fff' },

    // Power unit toggle
    powerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    unitToggle: {
      flexDirection: 'row',
      backgroundColor: C.secondary,
      borderRadius: Radius.lg,
      padding: 2,
    },
    unitBtn: {
      paddingHorizontal: Spacing[3],
      paddingVertical: 5,
      borderRadius: Radius.md,
    },
    unitBtnActive: { backgroundColor: C.primary },
    unitBtnText: {
      fontFamily: FontFamily.sansMedium,
      fontSize: FontSize.sm,
      color: C.mutedForeground,
    },
    unitBtnTextActive: { color: '#fff' },

    // Colors
    colorGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing[3],
    },
    colorItem: {
      alignItems: 'center',
      gap: 4,
      width: 44,
    },
    colorSwatch: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    colorSwatchActive: {
      borderWidth: 2,
      borderColor: '#fff',
    },
    colorSwatchBorder: {
      borderWidth: 1,
      borderColor: C.mutedForeground,
    },
    colorLabel: {
      fontFamily: FontFamily.sans,
      fontSize: 9,
      color: C.mutedForeground,
      textAlign: 'center',
    },
    colorLabelActive: { color: C.foreground },
    multiColor: {
      ...StyleSheet.absoluteFillObject,
      flexDirection: 'row',
    },
    multiSlice: { flex: 1 },

    // Energy labels
    energyGrid: {
      flexDirection: 'row',
      gap: Spacing[2],
      flexWrap: 'wrap',
    },
    energyChip: {
      width: 38,
      height: 38,
      borderRadius: Radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      backgroundColor: 'transparent',
    },
    energyLabel: {
      fontFamily: FontFamily.sansBold,
      fontSize: FontSize.base,
      color: C.mutedForeground,
    },
    energyLabelActive: { color: '#fff' },

    // Toggle
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    toggleLabel: {
      fontFamily: FontFamily.sansMedium,
      fontSize: FontSize.base,
      color: C.foreground,
      flex: 1,
    },
    toggleTrack: {
      width: 44,
      height: 26,
      borderRadius: 13,
      backgroundColor: C.secondary,
      padding: 2,
      justifyContent: 'center',
    },
    toggleTrackOn: { backgroundColor: C.primary },
    toggleThumb: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: '#fff',
      alignSelf: 'flex-start',
    },
    toggleThumbOn: { alignSelf: 'flex-end' },

    // Show more
    showMoreBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing[1],
      paddingVertical: Spacing[2],
    },
    showMoreText: {
      fontFamily: FontFamily.sansMedium,
      fontSize: FontSize.sm,
      color: C.sidebarPrimary,
    },

    // Footer
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: Spacing[5],
      paddingTop: Spacing[3],
      backgroundColor: C.background,
      borderTopWidth: 1,
      borderTopColor: C.secondary,
    },
    searchBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing[2],
      height: 52,
      borderRadius: Radius.xl,
      backgroundColor: C.primary,
    },
    searchBtnText: {
      fontFamily: FontFamily.sansBold,
      fontSize: FontSize.base,
      color: '#fff',
    },
  });
}
