import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
  TextInput,
  Switch,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  carMakes,
  carBodyTypeEnum,
  utilityBodyTypeEnum,
  truckBodyTypeEnum,
  camperBodyTypeEnum,
  carFuelTypeEnum,
  utilityFuelTypeEnum,
  truckFuelTypeEnum,
  camperFuelTypeEnum,
  carExtrasEnum,
  utilityExtrasEnum,
  truckExtrasEnum,
  camperExtrasEnum,
  VehicleConditionEnum,
  TransmissionTypeEnum,
  DriveTypeEnum,
  ColorEnum,
  EnergyLabelEnum,
  EmissionStandardEnum,
  EquipmentEnum,
  BatteryOwnershipEnum,
  ChargingPlugTypeStandardEnum,
  ChargingPlugTypeFastEnum,
} from "@repo/vehicle-constants";
import { FontFamily, FontSize, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { fetchVehicles, type SearchParams, type SortOption, type VehicleFacets } from "@/lib/api";
import {
  labelMake,
  labelFuel,
  labelTransmission,
  labelCondition,
  labelType,
  labelDrive,
  labelColor,
  labelEmission,
  labelEnergy,
  labelEquipment,
  labelExtra,
  labelBatteryOwnership,
  labelChargingAC,
  labelChargingDC,
} from "@/lib/labels";
import { Icon } from "@/components/ui/icon";
import { Chip } from "@/components/ui/chip";

// ─── Filters model ─────────────────────────────────────────────────────────────

export type Filters = {
  q: string;
  dealerId?: string;
  sort: SortOption;
  vehicleType: string | null;

  // Multi-selects (UPPERCASE Prisma enum values)
  make: string[];
  excludeMake: string[];
  bodyType: string[];
  fuel: string[];
  transmission: string[];
  condition: string[];
  driveType: string[];
  sellerType: string[];
  color: string[];
  interiorColor: string[];
  energyLabels: string[];
  emissionStandards: string[];
  batteryOwnership: string[];
  chargingPlugTypeStandard: string[];
  chargingPlugTypeFast: string[];
  equipment: string[];
  extras: string[];

  // Ranges
  priceFrom?: number;
  priceTo?: number;
  registrationFrom?: number;
  registrationTo?: number;
  kilometerFrom?: number;
  kilometerTo?: number;
  powerUnit: "ps" | "kw";
  powerFrom?: number;
  powerTo?: number;
  cubicCapacityFrom?: number;
  cubicCapacityTo?: number;
  cylindersFrom?: number;
  cylindersTo?: number;
  consumptionFrom?: number;
  consumptionTo?: number;
  co2From?: number;
  co2To?: number;
  rangeFrom?: number;
  rangeTo?: number;
  doorsFrom?: number;
  doorsTo?: number;
  seatsFrom?: number;
  seatsTo?: number;

  // Booleans / misc
  metallic: boolean;
  inspectionPassed: boolean;
  hasWarranty: boolean;
  daysListed?: number;
};

export const EMPTY_FILTERS: Filters = {
  q: "",
  sort: "relevance",
  vehicleType: null,
  make: [],
  excludeMake: [],
  bodyType: [],
  fuel: [],
  transmission: [],
  condition: [],
  driveType: [],
  sellerType: [],
  color: [],
  interiorColor: [],
  energyLabels: [],
  emissionStandards: [],
  batteryOwnership: [],
  chargingPlugTypeStandard: [],
  chargingPlugTypeFast: [],
  equipment: [],
  extras: [],
  powerUnit: "ps",
  metallic: false,
  inspectionPassed: false,
  hasWarranty: false,
};

const ARR_KEYS: (keyof Filters)[] = [
  "make", "excludeMake", "bodyType", "fuel", "transmission", "condition", "driveType", "sellerType",
  "color", "interiorColor", "energyLabels", "emissionStandards", "batteryOwnership",
  "chargingPlugTypeStandard", "chargingPlugTypeFast", "equipment", "extras",
];

// Power is emitted manually (kw vs ps), so it is excluded from this list.
const RANGE_KEYS: (keyof Filters)[] = [
  "priceFrom", "priceTo", "registrationFrom", "registrationTo", "kilometerFrom", "kilometerTo",
  "cubicCapacityFrom", "cubicCapacityTo", "cylindersFrom", "cylindersTo",
  "consumptionFrom", "consumptionTo", "co2From", "co2To", "rangeFrom", "rangeTo",
  "doorsFrom", "doorsTo", "seatsFrom", "seatsTo",
];

export function filtersToParams(f: Filters, page = 1, pageSize = 20): SearchParams {
  const p: SearchParams = { page, pageSize };
  if (f.q) p.q = f.q;
  if (f.dealerId) p.dealerId = f.dealerId;
  if (f.sort) p.sort = f.sort;
  if (f.vehicleType) p.vehicleType = [f.vehicleType];

  for (const key of ARR_KEYS) {
    const arr = f[key] as string[];
    if (arr.length) (p as Record<string, unknown>)[key] = arr;
  }
  for (const key of RANGE_KEYS) {
    const v = f[key] as number | undefined;
    if (v != null) (p as Record<string, unknown>)[key] = v;
  }
  // Power: emit kwFrom/kwTo when the kW unit is selected, else powerFrom/powerTo.
  if (f.powerUnit === "kw") {
    if (f.powerFrom != null) p.kwFrom = f.powerFrom;
    if (f.powerTo != null) p.kwTo = f.powerTo;
  } else {
    if (f.powerFrom != null) p.powerFrom = f.powerFrom;
    if (f.powerTo != null) p.powerTo = f.powerTo;
  }
  if (f.metallic) p.metallic = true;
  if (f.inspectionPassed) p.inspectionPassed = true;
  if (f.hasWarranty) p.hasWarranty = true;
  if (f.daysListed != null) p.daysListed = f.daysListed;
  return p;
}

// Counts active filter groups (for the badge) — not individual chips.
export function activeFilterCount(f: Filters): number {
  let n = 0;
  for (const key of ARR_KEYS) if ((f[key] as string[]).length) n++;
  // Each range counts once if either bound is set.
  const rangePairs: [keyof Filters, keyof Filters][] = [
    ["priceFrom", "priceTo"], ["registrationFrom", "registrationTo"], ["kilometerFrom", "kilometerTo"],
    ["powerFrom", "powerTo"], ["cubicCapacityFrom", "cubicCapacityTo"], ["cylindersFrom", "cylindersTo"],
    ["consumptionFrom", "consumptionTo"], ["co2From", "co2To"], ["rangeFrom", "rangeTo"],
    ["doorsFrom", "doorsTo"], ["seatsFrom", "seatsTo"],
  ];
  for (const [a, b] of rangePairs) if (f[a] != null || f[b] != null) n++;
  if (f.metallic) n++;
  if (f.inspectionPassed) n++;
  if (f.hasWarranty) n++;
  if (f.daysListed != null) n++;
  return n;
}

// ─── Option helpers ────────────────────────────────────────────────────────────

type Opt = { value: string; label: string; swatch?: string; swatchBorder?: boolean };
type OptRow = Opt & { count?: number };

function dedupe(opts: Opt[]): Opt[] {
  const seen = new Set<string>();
  const out: Opt[] = [];
  for (const o of opts) {
    if (seen.has(o.value)) continue;
    seen.add(o.value);
    out.push(o);
  }
  return out;
}

// Type-specific enum lists (union of all types when vehicleType is "Alle"/null),
// matching the web advanced search which scopes body/fuel/extras by type.
function bodyOpts(vt: string | null): Opt[] {
  const arr =
    vt === "UTILITY" ? utilityBodyTypeEnum
    : vt === "TRUCK" ? truckBodyTypeEnum
    : vt === "CAMPER" ? camperBodyTypeEnum
    : vt === "CAR" ? carBodyTypeEnum
    : [...carBodyTypeEnum, ...utilityBodyTypeEnum, ...truckBodyTypeEnum, ...camperBodyTypeEnum];
  return dedupe(arr.map((b) => ({ value: b.value, label: labelType(b.value) })));
}
function fuelOpts(vt: string | null): Opt[] {
  const arr =
    vt === "UTILITY" ? utilityFuelTypeEnum
    : vt === "TRUCK" ? truckFuelTypeEnum
    : vt === "CAMPER" ? camperFuelTypeEnum
    : vt === "CAR" ? carFuelTypeEnum
    : [...carFuelTypeEnum, ...utilityFuelTypeEnum, ...truckFuelTypeEnum, ...camperFuelTypeEnum];
  return dedupe(arr.map((b) => ({ value: b.value, label: labelFuel(b.value) })));
}
function extrasOpts(vt: string | null): Opt[] {
  const arr =
    vt === "UTILITY" ? utilityExtrasEnum
    : vt === "TRUCK" ? truckExtrasEnum
    : vt === "CAMPER" ? camperExtrasEnum
    : vt === "CAR" ? carExtrasEnum
    : [...carExtrasEnum, ...utilityExtrasEnum, ...truckExtrasEnum, ...camperExtrasEnum];
  return dedupe(arr.map((e) => ({ value: e.value, label: labelExtra(e.value) })));
}

// Attach a result count (0 when absent) to each option, mirroring web's per-option counts.
function withCounts(opts: Opt[], record?: Record<string, number>): OptRow[] {
  return opts.map((o) => ({ ...o, count: record?.[o.value] ?? 0 }));
}

const CONDITION_OPTS: Opt[] = VehicleConditionEnum.map((c) => ({ value: c.value, label: labelCondition(c.value) }));
const TRANSMISSION_OPTS: Opt[] = TransmissionTypeEnum.map((t) => ({ value: t.value, label: labelTransmission(t.value) }));
const DRIVE_OPTS: Opt[] = DriveTypeEnum.map((d) => ({ value: d.value, label: labelDrive(d.value) }));
const COLOR_OPTS: Opt[] = ColorEnum.map((c) => ({
  value: c.value,
  label: labelColor(c.value),
  swatch: ("gradient" in c ? c.gradient : c.hex) as string,
  swatchBorder: "border" in c ? Boolean(c.border) : false,
}));
const ENERGY_OPTS: Opt[] = EnergyLabelEnum.map((e) => ({ value: e.value, label: labelEnergy(e.value) }));
const EMISSION_OPTS: Opt[] = EmissionStandardEnum.map((e) => ({ value: e.value, label: labelEmission(e.value) }));
const EQUIPMENT_OPTS: Opt[] = EquipmentEnum.map((e) => ({ value: e.value, label: labelEquipment(e.value) }));
const BATTERY_OPTS: Opt[] = BatteryOwnershipEnum.map((e) => ({ value: e.value, label: labelBatteryOwnership(e.value) }));
const CHARGE_AC_OPTS: Opt[] = ChargingPlugTypeStandardEnum.map((e) => ({ value: e.value, label: labelChargingAC(e.value) }));
const CHARGE_DC_OPTS: Opt[] = ChargingPlugTypeFastEnum.map((e) => ({ value: e.value, label: labelChargingDC(e.value) }));
const SELLER_OPTS: Opt[] = [
  { value: "DEALER", label: "Händler" },
  { value: "SELLER", label: "Privat" },
];

// Full make catalog (grouped Top-Marken / Alle Marken, deduped) — same source the
// web make dialog uses (carMakes) regardless of vehicle type.
type MakeRow = { value: string; label: string; group: string };
const MAKE_CATALOG: MakeRow[] = (() => {
  const seen = new Set<string>();
  const out: MakeRow[] = [];
  for (const g of carMakes as unknown as { label: string; items: readonly { value: string; label: string }[] }[]) {
    for (const i of g.items) {
      if (seen.has(i.value)) continue;
      seen.add(i.value);
      out.push({ value: i.value, label: i.label, group: g.label });
    }
  }
  return out;
})();

const VEHICLE_TYPES: Opt[] = [
  { value: "CAR", label: "Autos" },
  { value: "CAMPER", label: "Wohnmobile" },
  { value: "UTILITY", label: "Nutzfahrzeuge" },
  { value: "TRUCK", label: "Lastwagen" },
];

const POWER_UNITS: { value: "ps" | "kw"; label: string }[] = [
  { value: "ps", label: "PS" },
  { value: "kw", label: "kW" },
];

const DAYS_OPTS: { value: number; label: string }[] = [
  { value: 1, label: "1 Tag" },
  { value: 3, label: "3 Tage" },
  { value: 7, label: "7 Tage" },
  { value: 14, label: "14 Tage" },
  { value: 30, label: "30 Tage" },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export function AdvancedFilter({
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
  const [count, setCount] = useState<number | null>(null);
  const [makeSheet, setMakeSheet] = useState(false);
  const reqId = useRef(0);

  useEffect(() => {
    if (visible) setDraft(filters);
  }, [visible, filters]);

  // Live result count (debounced).
  useEffect(() => {
    if (!visible) return;
    const id = ++reqId.current;
    const t = setTimeout(() => {
      fetchVehicles(filtersToParams(draft, 1, 1))
        .then((res) => {
          if (id === reqId.current) setCount(res.total);
        })
        .catch(() => {
          if (id === reqId.current) setCount(null);
        });
    }, 300);
    return () => clearTimeout(t);
  }, [draft, visible]);

  const toggleArr = useCallback((key: keyof Filters, value: string) => {
    setDraft((d) => {
      const arr = d[key] as string[];
      return { ...d, [key]: arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value] };
    });
  }, []);

  const setNum = useCallback((key: keyof Filters, raw: string) => {
    setDraft((d) => {
      const n = parseInt(raw.replace(/\D/g, ""), 10);
      return { ...d, [key]: Number.isNaN(n) ? undefined : n };
    });
  }, []);

  const setBool = useCallback((key: keyof Filters, value: boolean) => {
    setDraft((d) => ({ ...d, [key]: value }));
  }, []);

  // Switching the vehicle type resets all filters to avoid contradictory
  // cross-type selections (mirrors the web advanced search form.reset).
  const setVehicleType = useCallback((vt: string | null) => {
    setDraft((d) => ({ ...EMPTY_FILTERS, q: d.q, sort: d.sort, dealerId: d.dealerId, vehicleType: vt }));
  }, []);

  // Switching PS/kW resets the power inputs (the numeric scale differs).
  const setPowerUnit = useCallback((unit: "ps" | "kw") => {
    setDraft((d) => ({ ...d, powerUnit: unit, powerFrom: undefined, powerTo: undefined }));
  }, []);

  const setMakes = useCallback((includes: string[], excludes: string[]) => {
    setDraft((d) => ({ ...d, make: includes, excludeMake: excludes }));
  }, []);

  const reset = () =>
    setDraft((d) => ({ ...EMPTY_FILTERS, q: d.q, sort: d.sort, dealerId: d.dealerId }));

  const vt = draft.vehicleType;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet">
      <View style={[styles.root, { backgroundColor: C.background }]}>
        <SafeAreaView edges={["top"]} style={[styles.header, { borderBottomColor: C.border }]}>
          <View style={styles.headerRow}>
            <Pressable onPress={onClose} hitSlop={10}>
              <Icon name="xmark" size={20} color={C.foreground} />
            </Pressable>
            <Text style={[styles.headerTitle, { color: C.foreground }]} pointerEvents="none">
              Erweiterte Suche
            </Text>
            <Pressable onPress={reset} hitSlop={10}>
              <Text style={[styles.reset, { color: C.primary }]}>Zurücksetzen</Text>
            </Pressable>
          </View>
        </SafeAreaView>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <Section title="Fahrzeugtyp" defaultOpen>
            <ChipRow>
              <Chip label="Alle" selected={vt === null} onPress={() => setVehicleType(null)} />
              {VEHICLE_TYPES.map((t) => (
                <Chip key={t.value} label={t.label} selected={vt === t.value} onPress={() => setVehicleType(t.value)} />
              ))}
            </ChipRow>
          </Section>

          <Section title="Marke" defaultOpen count={draft.make.length + draft.excludeMake.length}>
            <Pressable
              style={[styles.makeBtn, { borderColor: C.border, backgroundColor: C.secondary }]}
              onPress={() => setMakeSheet(true)}
            >
              <Icon name="plus.circle" size={18} color={C.foreground} />
              <Text style={[styles.makeBtnText, { color: C.foreground }]}>Marken wählen</Text>
            </Pressable>
            {draft.make.length > 0 && (
              <>
                <Text style={[styles.subLabel, { color: C.mutedForeground, marginTop: Spacing[3] }]}>Einschliessen</Text>
                <View style={styles.chipWrap}>
                  {draft.make.map((m) => (
                    <Chip key={m} label={labelMake(m)} selected onPress={() => toggleArr("make", m)} />
                  ))}
                </View>
              </>
            )}
            {draft.excludeMake.length > 0 && (
              <>
                <Text style={[styles.subLabel, { color: C.destructive, marginTop: Spacing[3] }]}>Ausschliessen</Text>
                <View style={styles.chipWrap}>
                  {draft.excludeMake.map((m) => (
                    <Pressable
                      key={m}
                      style={[styles.excludeChip, { backgroundColor: C.destructive }]}
                      onPress={() => toggleArr("excludeMake", m)}
                    >
                      <Text style={[styles.excludeChipText, { color: C.primaryForeground }]}>{labelMake(m)}</Text>
                      <Icon name="xmark" size={11} color={C.primaryForeground} />
                    </Pressable>
                  ))}
                </View>
              </>
            )}
          </Section>

          {/* Basic / Eckdaten — year, km, price, condition, inspection & warranty, seller, body type */}
          <Section title="Eckdaten" defaultOpen count={
            (draft.registrationFrom != null || draft.registrationTo != null ? 1 : 0) +
            (draft.kilometerFrom != null || draft.kilometerTo != null ? 1 : 0) +
            (draft.priceFrom != null || draft.priceTo != null ? 1 : 0) +
            draft.condition.length + (draft.inspectionPassed ? 1 : 0) + (draft.hasWarranty ? 1 : 0) +
            draft.sellerType.length + draft.bodyType.length
          }>
            <SubLabel>Erstzulassung (Jahr)</SubLabel>
            <RangeRow from={draft.registrationFrom} to={draft.registrationTo} onFrom={(t) => setNum("registrationFrom", t)} onTo={(t) => setNum("registrationTo", t)} fromPlaceholder="ab Jahr" toPlaceholder="bis Jahr" />
            <SubLabel top>Kilometer</SubLabel>
            <RangeRow from={draft.kilometerFrom} to={draft.kilometerTo} onFrom={(t) => setNum("kilometerFrom", t)} onTo={(t) => setNum("kilometerTo", t)} />
            <SubLabel top>Preis (CHF)</SubLabel>
            <RangeRow from={draft.priceFrom} to={draft.priceTo} onFrom={(t) => setNum("priceFrom", t)} onTo={(t) => setNum("priceTo", t)} />
            <SubLabel top>Zustand</SubLabel>
            <OptionRows options={withCounts(CONDITION_OPTS, facets?.vehicleCondition)} selected={draft.condition} onToggle={(v) => toggleArr("condition", v)} />
            <SubLabel top>Prüfung &amp; Garantie</SubLabel>
            <ToggleRow label="MFK geprüft" value={draft.inspectionPassed} onChange={(v) => setBool("inspectionPassed", v)} />
            <ToggleRow label="Mit Garantie" value={draft.hasWarranty} onChange={(v) => setBool("hasWarranty", v)} />
            <SubLabel top>Anbieter</SubLabel>
            <OptionRows options={withCounts(SELLER_OPTS, facets?.sellerType)} selected={draft.sellerType} onToggle={(v) => toggleArr("sellerType", v)} />
            <SubLabel top>Aufbau</SubLabel>
            <OptionRows options={withCounts(bodyOpts(vt), facets?.bodyType)} selected={draft.bodyType} onToggle={(v) => toggleArr("bodyType", v)} />
          </Section>

          {/* Technical — fuel, transmission, drive, doors, seats, power (PS/kW), displacement, cylinders */}
          <Section title="Technische Daten" count={
            draft.fuel.length + draft.transmission.length + draft.driveType.length +
            (draft.doorsFrom != null || draft.doorsTo != null ? 1 : 0) +
            (draft.seatsFrom != null || draft.seatsTo != null ? 1 : 0) +
            (draft.powerFrom != null || draft.powerTo != null ? 1 : 0) +
            (draft.cubicCapacityFrom != null || draft.cubicCapacityTo != null ? 1 : 0) +
            (draft.cylindersFrom != null || draft.cylindersTo != null ? 1 : 0)
          }>
            <SubLabel>Treibstoff</SubLabel>
            <OptionRows options={withCounts(fuelOpts(vt), facets?.fuelType)} selected={draft.fuel} onToggle={(v) => toggleArr("fuel", v)} />
            <SubLabel top>Getriebe</SubLabel>
            <OptionRows options={withCounts(TRANSMISSION_OPTS, facets?.transmissionType)} selected={draft.transmission} onToggle={(v) => toggleArr("transmission", v)} />
            <SubLabel top>Antrieb</SubLabel>
            <OptionRows options={withCounts(DRIVE_OPTS, facets?.driveType)} selected={draft.driveType} onToggle={(v) => toggleArr("driveType", v)} />
            <SubLabel top>Türen</SubLabel>
            <RangeRow from={draft.doorsFrom} to={draft.doorsTo} onFrom={(t) => setNum("doorsFrom", t)} onTo={(t) => setNum("doorsTo", t)} />
            <SubLabel top>Sitze</SubLabel>
            <RangeRow from={draft.seatsFrom} to={draft.seatsTo} onFrom={(t) => setNum("seatsFrom", t)} onTo={(t) => setNum("seatsTo", t)} />
            <SubLabel top>Leistung</SubLabel>
            <Segmented value={draft.powerUnit} options={POWER_UNITS} onChange={(u) => setPowerUnit(u as "ps" | "kw")} />
            <View style={{ marginTop: Spacing[3] }}>
              <RangeRow from={draft.powerFrom} to={draft.powerTo} onFrom={(t) => setNum("powerFrom", t)} onTo={(t) => setNum("powerTo", t)} />
            </View>
            <SubLabel top>Hubraum (cm³)</SubLabel>
            <RangeRow from={draft.cubicCapacityFrom} to={draft.cubicCapacityTo} onFrom={(t) => setNum("cubicCapacityFrom", t)} onTo={(t) => setNum("cubicCapacityTo", t)} />
            <SubLabel top>Zylinder</SubLabel>
            <RangeRow from={draft.cylindersFrom} to={draft.cylindersTo} onFrom={(t) => setNum("cylindersFrom", t)} onTo={(t) => setNum("cylindersTo", t)} />
          </Section>

          {/* Equipment */}
          <Section title="Ausstattung" count={draft.equipment.length}>
            <OptionRows options={EQUIPMENT_OPTS} selected={draft.equipment} onToggle={(v) => toggleArr("equipment", v)} />
          </Section>

          {/* Extras */}
          <Section title="Besonderheiten" count={draft.extras.length}>
            <OptionRows options={extrasOpts(vt)} selected={draft.extras} onToggle={(v) => toggleArr("extras", v)} />
          </Section>

          {/* Appearance — exterior color, metallic, interior color */}
          <Section title="Aussehen" count={draft.color.length + (draft.metallic ? 1 : 0) + draft.interiorColor.length}>
            <SubLabel>Aussenfarbe</SubLabel>
            <OptionRows options={withCounts(COLOR_OPTS, facets?.color)} selected={draft.color} onToggle={(v) => toggleArr("color", v)} />
            <ToggleRow label="Metallic-Lackierung" value={draft.metallic} onChange={(v) => setBool("metallic", v)} />
            <SubLabel top>Innenfarbe</SubLabel>
            <OptionRows options={withCounts(COLOR_OPTS, facets?.interiorColor)} selected={draft.interiorColor} onToggle={(v) => toggleArr("interiorColor", v)} />
          </Section>

          {/* Energy — consumption, CO2, EV range, energy label, battery, charging AC/DC, euro norm */}
          <Section title="Energie & Umwelt" count={
            (draft.consumptionFrom != null || draft.consumptionTo != null ? 1 : 0) +
            (draft.co2From != null || draft.co2To != null ? 1 : 0) +
            (draft.rangeFrom != null || draft.rangeTo != null ? 1 : 0) +
            draft.energyLabels.length + draft.batteryOwnership.length +
            draft.chargingPlugTypeStandard.length + draft.chargingPlugTypeFast.length +
            draft.emissionStandards.length
          }>
            <SubLabel>Verbrauch (l/100 km)</SubLabel>
            <RangeRow from={draft.consumptionFrom} to={draft.consumptionTo} onFrom={(t) => setNum("consumptionFrom", t)} onTo={(t) => setNum("consumptionTo", t)} />
            <SubLabel top>CO₂ (g/km)</SubLabel>
            <RangeRow from={draft.co2From} to={draft.co2To} onFrom={(t) => setNum("co2From", t)} onTo={(t) => setNum("co2To", t)} />
            <SubLabel top>Reichweite (km)</SubLabel>
            <RangeRow from={draft.rangeFrom} to={draft.rangeTo} onFrom={(t) => setNum("rangeFrom", t)} onTo={(t) => setNum("rangeTo", t)} />
            <SubLabel top>Energieeffizienz</SubLabel>
            <OptionRows options={withCounts(ENERGY_OPTS, facets?.energyLabel)} selected={draft.energyLabels} onToggle={(v) => toggleArr("energyLabels", v)} />
            <SubLabel top>Batterie</SubLabel>
            <OptionRows options={BATTERY_OPTS} selected={draft.batteryOwnership} onToggle={(v) => toggleArr("batteryOwnership", v)} />
            <SubLabel top>Ladeanschluss AC</SubLabel>
            <OptionRows options={CHARGE_AC_OPTS} selected={draft.chargingPlugTypeStandard} onToggle={(v) => toggleArr("chargingPlugTypeStandard", v)} />
            <SubLabel top>Ladeanschluss DC</SubLabel>
            <OptionRows options={CHARGE_DC_OPTS} selected={draft.chargingPlugTypeFast} onToggle={(v) => toggleArr("chargingPlugTypeFast", v)} />
            <SubLabel top>Abgasnorm</SubLabel>
            <OptionRows options={withCounts(EMISSION_OPTS, facets?.emissionStandard)} selected={draft.emissionStandards} onToggle={(v) => toggleArr("emissionStandards", v)} />
          </Section>

          {/* More */}
          <Section title="Weitere Filter" count={draft.daysListed != null ? 1 : 0}>
            <SubLabel>Inseratsalter</SubLabel>
            <ChipRow>
              <Chip label="Beliebig" selected={draft.daysListed == null} onPress={() => setDraft((d) => ({ ...d, daysListed: undefined }))} />
              {DAYS_OPTS.map((o) => (
                <Chip key={o.value} label={o.label} selected={draft.daysListed === o.value} onPress={() => setDraft((d) => ({ ...d, daysListed: o.value }))} />
              ))}
            </ChipRow>
          </Section>
        </ScrollView>

        <SafeAreaView edges={["bottom"]} style={[styles.footer, { borderTopColor: C.border }]}>
          <Pressable style={[styles.applyBtn, { backgroundColor: C.primary }]} onPress={() => onApply(draft)}>
            <Text style={[styles.applyText, { color: C.primaryForeground }]}>
              {count != null ? `${count.toLocaleString("de-CH")} Fahrzeuge anzeigen` : "Ergebnisse anzeigen"}
            </Text>
          </Pressable>
        </SafeAreaView>
      </View>

      <MakeSheet
        key={makeSheet ? "make-open" : "make-closed"}
        visible={makeSheet}
        includes={draft.make}
        excludes={draft.excludeMake}
        onClose={() => setMakeSheet(false)}
        onChange={setMakes}
      />
    </Modal>
  );
}

// ─── Make sheet (searchable, grouped, include + exclude) ─────────────────────────

function MakeSheet({
  visible,
  includes,
  excludes,
  onClose,
  onChange,
}: {
  visible: boolean;
  includes: string[];
  excludes: string[];
  onClose: () => void;
  onChange: (includes: string[], excludes: string[]) => void;
}) {
  const C = useTheme();
  // Remounted via `key` whenever opened (see parent), so these defaults reset.
  const [mode, setMode] = useState<"include" | "exclude">("include");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q ? MAKE_CATALOG.filter((m) => m.label.toLowerCase().includes(q)) : MAKE_CATALOG;
    const out: ({ kind: "header"; key: string; label: string } | { kind: "item"; key: string; row: MakeRow })[] = [];
    let last: string | undefined;
    for (const m of filtered) {
      if (m.group !== last) {
        out.push({ kind: "header", key: `__h:${m.group}`, label: m.group });
        last = m.group;
      }
      out.push({ kind: "item", key: m.value, row: m });
    }
    return out;
  }, [query]);

  const toggle = (value: string) => {
    if (mode === "include") {
      const next = includes.includes(value) ? includes.filter((x) => x !== value) : [...includes, value];
      // A make cannot be both included and excluded.
      onChange(next, excludes.filter((x) => x !== value));
    } else {
      const next = excludes.includes(value) ? excludes.filter((x) => x !== value) : [...excludes, value];
      onChange(includes.filter((x) => x !== value), next);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet">
      <View style={[styles.root, { backgroundColor: C.background }]}>
        <SafeAreaView edges={["top"]} style={[styles.header, { borderBottomColor: C.border }]}>
          <View style={styles.headerRow}>
            <Pressable onPress={onClose} hitSlop={10}>
              <Icon name="xmark" size={20} color={C.foreground} />
            </Pressable>
            <Text style={[styles.headerTitle, { color: C.foreground }]} pointerEvents="none">
              Marke
            </Text>
            <Pressable onPress={() => onChange([], [])} hitSlop={10}>
              <Text style={[styles.reset, { color: C.primary }]}>Zurücksetzen</Text>
            </Pressable>
          </View>
        </SafeAreaView>

        <View style={styles.makeSheetTop}>
          <Segmented
            value={mode}
            options={[
              { value: "include", label: "Einschliessen" },
              { value: "exclude", label: "Ausschliessen" },
            ]}
            onChange={(m) => setMode(m as "include" | "exclude")}
          />
          <View style={[styles.searchBar, { backgroundColor: C.secondary }]}>
            <Icon name="magnifyingglass" size={16} color={C.mutedForeground} />
            <TextInput
              style={[styles.searchInput, { color: C.foreground }]}
              placeholder="Marke suchen"
              placeholderTextColor={C.mutedForeground}
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
            />
          </View>
        </View>

        <FlatList
          data={rows}
          keyExtractor={(r) => r.key}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            if (item.kind === "header") {
              return (
                <View style={[styles.makeGroupHeader, { backgroundColor: C.secondary }]}>
                  <Text style={[styles.makeGroupText, { color: C.mutedForeground }]}>{item.label}</Text>
                </View>
              );
            }
            const inc = includes.includes(item.row.value);
            const exc = excludes.includes(item.row.value);
            const on = mode === "include" ? inc : exc;
            const tint = exc ? C.destructive : C.primary;
            return (
              <Pressable style={[styles.makeRow, { borderBottomColor: C.border }]} onPress={() => toggle(item.row.value)}>
                <View
                  style={[
                    styles.checkbox,
                    { borderColor: on ? tint : C.border, backgroundColor: on ? tint : "transparent" },
                  ]}
                >
                  {on && <Icon name={exc ? "xmark" : "checkmark"} size={12} color={C.primaryForeground} />}
                </View>
                <Text style={[styles.makeRowText, { color: C.foreground }]}>{item.row.label}</Text>
                {inc && mode === "exclude" && <Text style={[styles.makeHint, { color: C.mutedForeground }]}>eingeschlossen</Text>}
                {exc && mode === "include" && <Text style={[styles.makeHint, { color: C.destructive }]}>ausgeschlossen</Text>}
              </Pressable>
            );
          }}
        />

        <SafeAreaView edges={["bottom"]} style={[styles.footer, { borderTopColor: C.border }]}>
          <Pressable style={[styles.applyBtn, { backgroundColor: C.primary }]} onPress={onClose}>
            <Text style={[styles.applyText, { color: C.primaryForeground }]}>Fertig</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

function Section({
  title,
  count = 0,
  defaultOpen = false,
  children,
}: {
  title: string;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const C = useTheme();
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={[styles.section, { borderBottomColor: C.border }]}>
      <Pressable style={styles.sectionHeader} onPress={() => setOpen((o) => !o)}>
        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionTitle, { color: C.foreground }]}>{title}</Text>
          {count > 0 && (
            <View style={[styles.countDot, { backgroundColor: C.primary }]}>
              <Text style={[styles.countDotText, { color: C.primaryForeground }]}>{count}</Text>
            </View>
          )}
        </View>
        <Icon name={open ? "chevron.up" : "chevron.down"} size={15} color={C.mutedForeground} />
      </Pressable>
      {open && <View style={styles.sectionBody}>{children}</View>}
    </View>
  );
}

// Vertical option list with selection checkbox and optional result count — the
// mobile equivalent of the web advanced search's checkbox + count rows.
function OptionRows({
  options,
  selected,
  onToggle,
}: {
  options: OptRow[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  const C = useTheme();
  if (options.length === 0) {
    return <Text style={[styles.emptyOpt, { color: C.mutedForeground }]}>Keine Optionen verfügbar</Text>;
  }
  return (
    <View>
      {options.map((o) => {
        const on = selected.includes(o.value);
        return (
          <Pressable key={o.value} style={styles.optRow} onPress={() => onToggle(o.value)}>
            <View style={styles.optLeft}>
              <View
                style={[
                  styles.checkbox,
                  { borderColor: on ? C.primary : C.border, backgroundColor: on ? C.primary : "transparent" },
                ]}
              >
                {on && <Icon name="checkmark" size={12} color={C.primaryForeground} />}
              </View>
              {o.swatch != null && (
                <View
                  style={[
                    styles.swatch,
                    { backgroundColor: o.swatch, borderColor: o.swatchBorder ? C.border : "transparent" },
                  ]}
                />
              )}
              <Text style={[styles.optLabel, { color: C.foreground }]} numberOfLines={1}>
                {o.label}
              </Text>
            </View>
            {o.count != null && (
              <Text style={[styles.optCount, { color: C.mutedForeground }]}>{o.count.toLocaleString("de-CH")}</Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

function Segmented({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const C = useTheme();
  return (
    <View style={[styles.segment, { backgroundColor: C.secondary, borderColor: C.border }]}>
      {options.map((o) => {
        const on = value === o.value;
        return (
          <Pressable
            key={o.value}
            style={[styles.segmentBtn, on && { backgroundColor: C.primary }]}
            onPress={() => onChange(o.value)}
          >
            <Text style={[styles.segmentText, { color: on ? C.primaryForeground : C.foreground }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ChipRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.chipWrap}>{children}</View>;
}

// Sub-field label within a section. `top` adds spacing above when it follows
// another sub-field (the first label in a section omits it).
function SubLabel({ children, top = false }: { children: React.ReactNode; top?: boolean }) {
  const C = useTheme();
  return (
    <Text style={[styles.subLabel, { color: C.mutedForeground }, top && { marginTop: Spacing[4] }]}>
      {children}
    </Text>
  );
}

function RangeRow({
  from,
  to,
  onFrom,
  onTo,
  fromPlaceholder = "von",
  toPlaceholder = "bis",
}: {
  from?: number;
  to?: number;
  onFrom: (t: string) => void;
  onTo: (t: string) => void;
  fromPlaceholder?: string;
  toPlaceholder?: string;
}) {
  const C = useTheme();
  return (
    <View style={styles.rangeRow}>
      <TextInput
        style={[styles.numInput, { backgroundColor: C.secondary, color: C.foreground }]}
        placeholder={fromPlaceholder}
        placeholderTextColor={C.mutedForeground}
        keyboardType="number-pad"
        value={from != null ? String(from) : ""}
        onChangeText={onFrom}
      />
      <TextInput
        style={[styles.numInput, { backgroundColor: C.secondary, color: C.foreground }]}
        placeholder={toPlaceholder}
        placeholderTextColor={C.mutedForeground}
        keyboardType="number-pad"
        value={to != null ? String(to) : ""}
        onChangeText={onTo}
      />
    </View>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  const C = useTheme();
  return (
    <View style={styles.toggleRow}>
      <Text style={[styles.toggleLabel, { color: C.foreground }]}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: C.primary, false: C.border }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingBottom: Spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing[5],
    height: 44,
  },
  // Absolutely centered so the German "Zurücksetzen" never collides with it.
  headerTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.md,
    letterSpacing: -0.3,
  },
  reset: { fontFamily: FontFamily.sansMedium, fontSize: FontSize.sm },
  scroll: { flex: 1 },
  body: { paddingHorizontal: Spacing[5], paddingBottom: Spacing[10] },
  section: { borderBottomWidth: StyleSheet.hairlineWidth },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: Spacing[4] },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: Spacing[2] },
  sectionTitle: { fontFamily: FontFamily.sansSemiBold, fontSize: FontSize.base, letterSpacing: -0.2 },
  countDot: { minWidth: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", paddingHorizontal: 5 },
  countDotText: { fontFamily: FontFamily.sansBold, fontSize: 11 },
  sectionBody: { paddingBottom: Spacing[4] },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: Spacing[2] },
  subLabel: { fontFamily: FontFamily.sansMedium, fontSize: FontSize.sm, marginBottom: Spacing[2] },
  emptyOpt: { fontFamily: FontFamily.sans, fontSize: FontSize.sm },

  // Option rows (checkbox + label + count)
  optRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: Spacing[2] },
  optLeft: { flexDirection: "row", alignItems: "center", gap: Spacing[3], flex: 1 },
  optLabel: { fontFamily: FontFamily.sansMedium, fontSize: FontSize.base, flexShrink: 1 },
  optCount: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, marginLeft: Spacing[2] },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  swatch: { width: 16, height: 16, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth },

  // Segmented control
  segment: { flexDirection: "row", borderRadius: Radius.md, borderWidth: StyleSheet.hairlineWidth, padding: 3, gap: 3 },
  segmentBtn: { flex: 1, height: 38, borderRadius: Radius.sm, alignItems: "center", justifyContent: "center" },
  segmentText: { fontFamily: FontFamily.sansSemiBold, fontSize: FontSize.sm },

  // Make trigger + sheet
  makeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[2],
    height: 48,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth * 2,
    paddingHorizontal: Spacing[4],
  },
  makeBtnText: { fontFamily: FontFamily.sansMedium, fontSize: FontSize.base },
  excludeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[1],
    paddingHorizontal: Spacing[3],
    height: 34,
    borderRadius: Radius.full,
  },
  excludeChipText: { fontFamily: FontFamily.sansMedium, fontSize: FontSize.sm },
  makeSheetTop: { paddingHorizontal: Spacing[5], paddingTop: Spacing[3], gap: Spacing[3] },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[2],
    height: 46,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing[3],
  },
  searchInput: { flex: 1, fontFamily: FontFamily.sans, fontSize: FontSize.base, height: 46 },
  makeGroupHeader: { paddingHorizontal: Spacing[5], paddingVertical: Spacing[2], marginTop: Spacing[2] },
  makeGroupText: { fontFamily: FontFamily.sansBold, fontSize: FontSize.xs, textTransform: "uppercase", letterSpacing: 0.5 },
  makeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[3],
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  makeRowText: { fontFamily: FontFamily.sansMedium, fontSize: FontSize.base, flex: 1 },
  makeHint: { fontFamily: FontFamily.sans, fontSize: FontSize.xs },

  rangeRow: { flexDirection: "row", gap: Spacing[3] },
  numInput: {
    flex: 1,
    height: 48,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing[4],
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
  },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: Spacing[3] },
  toggleLabel: { fontFamily: FontFamily.sansMedium, fontSize: FontSize.base },
  footer: { paddingHorizontal: Spacing[5], paddingTop: Spacing[3], borderTopWidth: StyleSheet.hairlineWidth },
  applyBtn: { height: 54, borderRadius: Radius.lg, alignItems: "center", justifyContent: "center" },
  applyText: { fontFamily: FontFamily.sansSemiBold, fontSize: FontSize.md },
});
