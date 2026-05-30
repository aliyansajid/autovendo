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

// ─── Constants ────────────────────────────────────────────────────────────────

const FUEL_OPTIONS = [
  { id: 'petrol', label: 'Petrol' },
  { id: 'diesel', label: 'Diesel' },
  { id: 'electric', label: 'Electric' },
  { id: 'mhev-petrol', label: 'Mild Hybrid (P)' },
  { id: 'mhev-diesel', label: 'Mild Hybrid (D)' },
  { id: 'phev-petrol', label: 'Plug-in Hybrid (P)' },
  { id: 'phev-diesel', label: 'Plug-in Hybrid (D)' },
  { id: 'hev-petrol', label: 'Hybrid (P)' },
  { id: 'hev-diesel', label: 'Hybrid (D)' },
  { id: 'ethanol-petrol', label: 'Ethanol' },
  { id: 'cng-petrol', label: 'CNG' },
  { id: 'lpg-petrol', label: 'LPG' },
  { id: 'hydrogen', label: 'Hydrogen' },
];

const BODY_TYPES = [
  { id: 'suv', label: 'SUV' },
  { id: 'saloon', label: 'Sedan' },
  { id: 'estate', label: 'Estate' },
  { id: 'coupe', label: 'Coupé' },
  { id: 'cabriolet', label: 'Convertible' },
  { id: 'small-car', label: 'Small Car' },
  { id: 'minivan', label: 'Van' },
  { id: 'pickup', label: 'Pickup' },
  { id: 'bus', label: 'Bus' },
];

const TRANSMISSION = [
  { id: 'automatic', label: 'Automatic' },
  { id: 'manual', label: 'Manual' },
  { id: 'automatic-stepless', label: 'CVT' },
  { id: 'semi-automatic', label: 'Semi-Auto' },
];

const DRIVE_TYPE = [
  { id: 'all', label: 'AWD / 4WD' },
  { id: 'front', label: 'Front-wheel' },
  { id: 'rear', label: 'Rear-wheel' },
];

const CONDITION = [
  { id: 'new', label: 'New' },
  { id: 'used', label: 'Used' },
  { id: 'demonstration', label: 'Demo' },
  { id: 'pre-registered', label: 'Pre-registered' },
  { id: 'oldtimer', label: 'Oldtimer' },
];

const ENERGY_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

const ENERGY_COLORS: Record<string, string> = {
  A: '#00a651', B: '#4db848', C: '#8dc63f',
  D: '#f7ed00', E: '#fbb612', F: '#f37021', G: '#ed1c24',
};

const EURO_NORMS = [
  { id: 'euro-6e', label: 'Euro 6e' },
  { id: 'euro-6d-isc-fcm', label: 'Euro 6d-ISC-FCM' },
  { id: 'euro-6d-isc', label: 'Euro 6d-ISC' },
  { id: 'euro-6d-temp-evap-isc', label: 'Euro 6d-Temp-EVAP-ISC' },
  { id: 'euro-6d-temp-evap', label: 'Euro 6d-Temp-EVAP' },
  { id: 'euro-6d-temp-isc', label: 'Euro 6d-Temp-ISC' },
  { id: 'euro-6d-temp', label: 'Euro 6d-Temp' },
  { id: 'euro-6d', label: 'Euro 6d' },
  { id: 'euro-6c', label: 'Euro 6c' },
  { id: 'euro-6b', label: 'Euro 6b' },
  { id: 'euro-6a', label: 'Euro 6a' },
  { id: 'euro-6', label: 'Euro 6' },
  { id: 'euro-5-plus', label: 'Euro 5+' },
  { id: 'euro-5', label: 'Euro 5' },
  { id: 'euro-4', label: 'Euro 4' },
  { id: 'euro-3', label: 'Euro 3' },
  { id: 'euro-2', label: 'Euro 2' },
  { id: 'euro-1', label: 'Euro 1' },
];

const COLORS_EXT = [
  { id: 'black', label: 'Black', hex: '#1a1a1a' },
  { id: 'white', label: 'White', hex: '#f5f5f5' },
  { id: 'gray', label: 'Gray', hex: '#808080' },
  { id: 'silver', label: 'Silver', hex: '#c0c0c0' },
  { id: 'blue', label: 'Blue', hex: '#1e4da6' },
  { id: 'red', label: 'Red', hex: '#c0392b' },
  { id: 'green', label: 'Green', hex: '#27ae60' },
  { id: 'brown', label: 'Brown', hex: '#7b4a2d' },
  { id: 'beige', label: 'Beige', hex: '#d9c8a0' },
  { id: 'orange', label: 'Orange', hex: '#e67e22' },
  { id: 'yellow', label: 'Yellow', hex: '#f1c40f' },
  { id: 'gold', label: 'Gold', hex: '#c9a227' },
  { id: 'bordeaux', label: 'Bordeaux', hex: '#6b1a2a' },
  { id: 'violet', label: 'Violet', hex: '#8e44ad' },
  { id: 'turquoise', label: 'Turquoise', hex: '#1abc9c' },
  { id: 'pink', label: 'Pink', hex: '#ff69b4' },
  { id: 'anthracite', label: 'Anthracite', hex: '#3c3c3c' },
  { id: 'multicoloured', label: 'Multi', hex: '' },
  { id: 'other', label: 'Other', hex: '#999' },
];

const EQUIPMENT = [
  '360° Camera', 'ABS', 'Adaptive Headlights', 'Adaptive Cruise Control',
  'Alarm System', 'Alloy Wheels', 'Android Auto', 'Apple CarPlay',
  'Bluetooth', 'Brake Assist', 'DAB Radio', 'Differential Lock',
  'Electric Windows', 'Electric Tailgate', 'Electric Seat Adjustment',
  'Hands-Free Kit', 'Head-Up Display', 'Heated Seats', 'Ventilated Seats',
  'ISOFIX', 'Air Conditioning', 'Auto Climate Control', 'Navigation System',
  'Panoramic Roof', 'Parking Assist', 'Rear Parking Sensors', 'Front Parking Sensors',
  'Backup Camera', 'LED Headlights', 'Xenon Headlights', 'Laser Headlights',
  'Sunroof', 'Sliding Door', 'Keyless Entry & Start', 'Fast Charging',
  'Leather Seats', 'Alcantara', 'Sport Seats', 'Seat Covers',
  'Lane Keep Assist', 'Blind Spot Assist', 'ESP', 'Start-Stop System',
  'Cruise Control', 'Auxiliary Heating', 'Tow Hitch', 'Air Suspension',
  'Roof Rack', 'Special Paint', 'Custom Exhaust', 'Reinforced Suspension',
];

const EXTRAS = [
  { id: '8-tyres', label: '8 Tyres' },
  { id: 'accessible', label: 'Disabled Access' },
  { id: 'direct-import', label: 'Direct Import' },
  { id: 'race-car', label: 'Race Car' },
  { id: 'tuning', label: 'Tuning' },
  { id: 'accident-vehicle', label: 'Accident Vehicle' },
];

const DAYS_LISTED = [
  { id: 'any', label: 'Any' },
  { id: '1', label: '1 day' },
  { id: '2', label: '2 days' },
  { id: '3', label: '3 days' },
  { id: '5', label: '5 days' },
  { id: '7', label: '1 week' },
  { id: '14', label: '2 weeks' },
  { id: '28', label: '4 weeks' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function AccordionSection({
  title,
  count,
  children,
  defaultOpen = false,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
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
  from, to, onFromChange, onToChange, suffix,
}: {
  from: string; to: string;
  onFromChange: (v: string) => void; onToChange: (v: string) => void;
  suffix?: string;
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
  options, selected, onToggle,
}: {
  options: { id: string; label: string }[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <View style={styles.chipGrid}>
      {options.map(o => {
        const active = selected.includes(o.id);
        return (
          <Pressable key={o.id} style={[styles.chip, active && styles.chipActive]}
            onPress={() => onToggle(o.id)}>
            <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ColorPicker({
  selected, onToggle,
}: {
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <View style={styles.colorGrid}>
      {COLORS_EXT.map(c => {
        const active = selected.includes(c.id);
        return (
          <Pressable key={c.id} style={styles.colorItem} onPress={() => onToggle(c.id)}>
            <View style={[
              styles.colorSwatch,
              { backgroundColor: c.hex || '#888' },
              active && styles.colorSwatchActive,
              c.id === 'white' && styles.colorSwatchBorder,
            ]}>
              {active && (
                <SymbolView name="checkmark" size={12}
                  tintColor={['white', 'beige', 'silver', 'yellow', 'gold'].includes(c.id) ? '#000' : '#fff'} />
              )}
              {c.id === 'multicoloured' && (
                <View style={styles.multiColor}>
                  {['#c0392b','#1e4da6','#27ae60','#f1c40f'].map((col, i) => (
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

function RadioGroup({
  options, selected, onSelect,
}: {
  options: { id: string; label: string }[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <View style={styles.chipGrid}>
      {options.map(o => {
        const active = selected === o.id;
        return (
          <Pressable key={o.id} style={[styles.chip, active && styles.chipActive]}
            onPress={() => onSelect(o.id)}>
            <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function EquipmentPicker({
  selected, onToggle,
}: {
  selected: string[];
  onToggle: (id: string) => void;
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
        <Text style={styles.showMoreText}>{showAll ? 'Show less' : `Show all ${EQUIPMENT.length} options`}</Text>
        <SymbolView name={showAll ? 'chevron.up' : 'chevron.down'} size={12} tintColor="#4a7ae8" />
      </Pressable>
    </View>
  );
}

function SelectField({ label, value, placeholder }: { label: string; value?: string; placeholder: string }) {
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

function Divider() {
  return <View style={styles.divider} />;
}

function Toggle({ label, value, onToggle }: { label: string; value: boolean; onToggle: () => void }) {
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
  const [query, setQuery] = useState('');
  // Make/Model
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

  const activeCount = [
    fuels.length, bodyTypes.length, transmissions.length, drives.length,
    conditions.length, extColors.length, intColors.length, equipment.length,
    extras.length, energyLabels.length, euroNorms.length,
    priceFrom || priceTo, yearFrom || yearTo, kmFrom || kmTo,
    powerFrom || powerTo, capFrom || capTo, cylFrom || cylTo,
    consumFrom || consumTo, co2From || co2To,
    mfk, warranty, metallic,
    daysListed !== 'any',
  ].filter(Boolean).length;

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

  return (
    <View style={styles.root}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
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
        <View style={styles.searchBar}>
          <SymbolView name="magnifyingglass" size={16} tintColor={C.mutedForeground} />
          <TextInput style={styles.searchInput} value={query} onChangeText={setQuery}
            placeholder="Make, model, keyword…" placeholderTextColor={C.mutedForeground}
            returnKeyType="search" />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <SymbolView name="xmark.circle.fill" size={16} tintColor={C.mutedForeground} />
            </Pressable>
          )}
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Make & Model */}
        <AccordionSection title="Make & Model" defaultOpen>
          <SelectField label="Make" placeholder="Any make" />
          <Divider />
          <SelectField label="Model" placeholder="Any model" />
        </AccordionSection>

        {/* Basic Data */}
        <AccordionSection title="Basic Data" defaultOpen
          count={[priceFrom||priceTo, yearFrom||yearTo, kmFrom||kmTo, conditions.length, bodyTypes.length].filter(Boolean).length || undefined}>
          <Text style={styles.groupLabel}>Price</Text>
          <RangeInputs from={priceFrom} to={priceTo} onFromChange={setPriceFrom} onToChange={setPriceTo} suffix="CHF" />
          <Divider />
          <Text style={styles.groupLabel}>Year</Text>
          <RangeInputs from={yearFrom} to={yearTo} onFromChange={setYearFrom} onToChange={setYearTo} />
          <Divider />
          <Text style={styles.groupLabel}>Mileage</Text>
          <RangeInputs from={kmFrom} to={kmTo} onFromChange={setKmFrom} onToChange={setKmTo} suffix="km" />
          <Divider />
          <Text style={styles.groupLabel}>Condition</Text>
          <ChipGroup options={CONDITION} selected={conditions} onToggle={id => toggle(conditions, setConditions, id)} />
          <Toggle label="Inspection passed (MFK)" value={mfk} onToggle={() => setMfk(v => !v)} />
          <Toggle label="Has warranty" value={warranty} onToggle={() => setWarranty(v => !v)} />
          <Divider />
          <Text style={styles.groupLabel}>Body Type</Text>
          <ChipGroup options={BODY_TYPES} selected={bodyTypes} onToggle={id => toggle(bodyTypes, setBodyTypes, id)} />
        </AccordionSection>

        {/* Technical Data */}
        <AccordionSection title="Technical Data"
          count={[fuels.length, transmissions.length, drives.length, powerFrom||powerTo, capFrom||capTo, cylFrom||cylTo].filter(Boolean).length || undefined}>
          <Text style={styles.groupLabel}>Fuel Type</Text>
          <ChipGroup options={FUEL_OPTIONS} selected={fuels} onToggle={id => toggle(fuels, setFuels, id)} />
          <Divider />
          <Text style={styles.groupLabel}>Transmission</Text>
          <ChipGroup options={TRANSMISSION} selected={transmissions} onToggle={id => toggle(transmissions, setTransmissions, id)} />
          <Divider />
          <Text style={styles.groupLabel}>Drive Type</Text>
          <ChipGroup options={DRIVE_TYPE} selected={drives} onToggle={id => toggle(drives, setDrives, id)} />
          <Divider />
          <View style={styles.powerHeader}>
            <Text style={styles.groupLabel}>Power</Text>
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
          <RangeInputs from={powerFrom} to={powerTo} onFromChange={setPowerFrom} onToChange={setPowerTo} suffix={powerUnit === 'ps' ? 'PS' : 'kW'} />
          <Divider />
          <Text style={styles.groupLabel}>Cubic Capacity</Text>
          <RangeInputs from={capFrom} to={capTo} onFromChange={setCapFrom} onToChange={setCapTo} suffix="cm³" />
          <Divider />
          <Text style={styles.groupLabel}>Cylinders</Text>
          <RangeInputs from={cylFrom} to={cylTo} onFromChange={setCylFrom} onToChange={setCylTo} />
        </AccordionSection>

        {/* Appearance */}
        <AccordionSection title="Appearance"
          count={[extColors.length, intColors.length, metallic].filter(Boolean).length || undefined}>
          <Text style={styles.groupLabel}>Exterior Color</Text>
          <ColorPicker selected={extColors} onToggle={id => toggle(extColors, setExtColors, id)} />
          <Divider />
          <Text style={styles.groupLabel}>Interior Color</Text>
          <ColorPicker selected={intColors} onToggle={id => toggle(intColors, setIntColors, id)} />
          <Divider />
          <Toggle label="Metallic" value={metallic} onToggle={() => setMetallic(v => !v)} />
        </AccordionSection>

        {/* Equipment */}
        <AccordionSection title="Equipment" count={equipment.length || undefined}>
          <EquipmentPicker selected={equipment} onToggle={eq => toggle(equipment, setEquipment, eq)} />
        </AccordionSection>

        {/* Extras */}
        <AccordionSection title="Extras" count={extras.length || undefined}>
          <ChipGroup options={EXTRAS} selected={extras} onToggle={id => toggle(extras, setExtras, id)} />
        </AccordionSection>

        {/* Energy & Emissions */}
        <AccordionSection title="Energy & Emissions"
          count={[energyLabels.length, euroNorms.length, consumFrom||consumTo, co2From||co2To].filter(Boolean).length || undefined}>
          <Text style={styles.groupLabel}>Fuel Consumption</Text>
          <RangeInputs from={consumFrom} to={consumTo} onFromChange={setConsumFrom} onToChange={setConsumTo} suffix="l/100km" />
          <Divider />
          <Text style={styles.groupLabel}>CO₂ Emissions</Text>
          <RangeInputs from={co2From} to={co2To} onFromChange={setCo2From} onToChange={setCo2To} suffix="g/km" />
          <Divider />
          <Text style={styles.groupLabel}>Energy Label</Text>
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
          <Divider />
          <Text style={styles.groupLabel}>Euro Norm</Text>
          <ChipGroup options={EURO_NORMS} selected={euroNorms} onToggle={id => toggle(euroNorms, setEuroNorms, id)} />
        </AccordionSection>

        {/* Listing */}
        <AccordionSection title="Listing" count={daysListed !== 'any' ? 1 : undefined}>
          <Text style={styles.groupLabel}>Listed within</Text>
          <RadioGroup options={DAYS_LISTED} selected={daysListed} onSelect={setDaysListed} />
        </AccordionSection>

        <View style={{ height: 130 }} />
      </ScrollView>

      {/* Sticky button */}
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
  resetBadgeText: { fontFamily: FontFamily.sansBold, fontSize: 10, color: '#fff' },

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

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[16],
    gap: Spacing[3],
  },

  // Accordion
  card: {
    backgroundColor: '#161624',
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
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
    backgroundColor: '#1e4da6',
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
    backgroundColor: 'rgba(255,255,255,0.06)',
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
  },
  rangeDash: {
    width: 10,
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
  chipLabelActive: { color: '#fff' },

  // Power unit toggle
  powerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: Radius.lg,
    padding: 2,
  },
  unitBtn: {
    paddingHorizontal: Spacing[3],
    paddingVertical: 5,
    borderRadius: Radius.md,
  },
  unitBtnActive: { backgroundColor: '#1e4da6' },
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
    borderColor: 'rgba(255,255,255,0.3)',
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
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: 2,
    justifyContent: 'center',
  },
  toggleTrackOn: { backgroundColor: '#1e4da6' },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  toggleThumbOn: { alignSelf: 'flex-end' },

  // Select
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
  selectPlaceholder: { color: C.mutedForeground },

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
    color: '#4a7ae8',
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
    backgroundColor: '#0c0c15',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
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
