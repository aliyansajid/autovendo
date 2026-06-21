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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  EquipmentEnum,
  BatteryOwnershipEnum,
  ChargingPlugTypeStandardEnum,
  ChargingPlugTypeFastEnum,
  carExtrasEnum,
  utilityExtrasEnum,
  truckExtrasEnum,
  camperExtrasEnum,
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
  metallic: false,
  inspectionPassed: false,
  hasWarranty: false,
};

const ARR_KEYS: (keyof Filters)[] = [
  "make", "bodyType", "fuel", "transmission", "condition", "driveType", "sellerType",
  "color", "interiorColor", "energyLabels", "emissionStandards", "batteryOwnership",
  "chargingPlugTypeStandard", "chargingPlugTypeFast", "equipment", "extras",
];

const RANGE_KEYS: (keyof Filters)[] = [
  "priceFrom", "priceTo", "registrationFrom", "registrationTo", "kilometerFrom", "kilometerTo",
  "powerFrom", "powerTo", "cubicCapacityFrom", "cubicCapacityTo", "cylindersFrom", "cylindersTo",
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

type Opt = { value: string; label: string };

function facetOpts(
  record: Record<string, number> | undefined,
  labelFn: (v: string) => string,
  max = 40,
): Opt[] {
  if (!record) return [];
  return Object.entries(record)
    .filter(([, c]) => c > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([value]) => ({ value, label: labelFn(value) }));
}

function enumOpts(arr: readonly { value: string }[], labelFn: (v: string) => string): Opt[] {
  return arr.map((e) => ({ value: e.value, label: labelFn(e.value) }));
}

const EXTRAS_OPTS: Opt[] = (() => {
  const seen = new Set<string>();
  const out: Opt[] = [];
  for (const e of [...carExtrasEnum, ...utilityExtrasEnum, ...truckExtrasEnum, ...camperExtrasEnum]) {
    if (!seen.has(e.value)) {
      seen.add(e.value);
      out.push({ value: e.value, label: labelExtra(e.value) });
    }
  }
  return out;
})();

const EQUIPMENT_OPTS: Opt[] = enumOpts(EquipmentEnum, labelEquipment);
const BATTERY_OPTS: Opt[] = enumOpts(BatteryOwnershipEnum, labelBatteryOwnership);
const CHARGE_AC_OPTS: Opt[] = enumOpts(ChargingPlugTypeStandardEnum, labelChargingAC);
const CHARGE_DC_OPTS: Opt[] = enumOpts(ChargingPlugTypeFastEnum, labelChargingDC);

const VEHICLE_TYPES: Opt[] = [
  { value: "CAR", label: "Autos" },
  { value: "CAMPER", label: "Wohnmobile" },
  { value: "UTILITY", label: "Nutzfahrzeuge" },
  { value: "TRUCK", label: "Lastwagen" },
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

  const reset = () =>
    setDraft((d) => ({ ...EMPTY_FILTERS, q: d.q, sort: d.sort, dealerId: d.dealerId }));

  const isEv = draft.vehicleType === null || draft.fuel.length === 0 || draft.fuel.includes("ELECTRIC");

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
              <Chip label="Alle" selected={draft.vehicleType === null} onPress={() => setDraft((d) => ({ ...d, vehicleType: null }))} />
              {VEHICLE_TYPES.map((t) => (
                <Chip key={t.value} label={t.label} selected={draft.vehicleType === t.value} onPress={() => setDraft((d) => ({ ...d, vehicleType: t.value }))} />
              ))}
            </ChipRow>
          </Section>

          <Section title="Marke" defaultOpen count={draft.make.length}>
            <ChipGroup options={facetOpts(facets?.make, labelMake)} selected={draft.make} onToggle={(v) => toggleArr("make", v)} />
          </Section>

          <Section title="Preis (CHF)" defaultOpen count={draft.priceFrom != null || draft.priceTo != null ? 1 : 0}>
            <RangeRow from={draft.priceFrom} to={draft.priceTo} onFrom={(t) => setNum("priceFrom", t)} onTo={(t) => setNum("priceTo", t)} />
          </Section>

          <Section title="Erstzulassung (Jahr)" defaultOpen count={draft.registrationFrom != null || draft.registrationTo != null ? 1 : 0}>
            <RangeRow from={draft.registrationFrom} to={draft.registrationTo} onFrom={(t) => setNum("registrationFrom", t)} onTo={(t) => setNum("registrationTo", t)} fromPlaceholder="ab Jahr" toPlaceholder="bis Jahr" />
          </Section>

          <Section title="Kilometer" defaultOpen count={draft.kilometerFrom != null || draft.kilometerTo != null ? 1 : 0}>
            <RangeRow from={draft.kilometerFrom} to={draft.kilometerTo} onFrom={(t) => setNum("kilometerFrom", t)} onTo={(t) => setNum("kilometerTo", t)} />
          </Section>

          <Section title="Aufbau" count={draft.bodyType.length}>
            <ChipGroup options={facetOpts(facets?.bodyType, labelType)} selected={draft.bodyType} onToggle={(v) => toggleArr("bodyType", v)} />
          </Section>

          <Section title="Treibstoff" count={draft.fuel.length}>
            <ChipGroup options={facetOpts(facets?.fuelType, labelFuel)} selected={draft.fuel} onToggle={(v) => toggleArr("fuel", v)} />
          </Section>

          <Section title="Getriebe" count={draft.transmission.length}>
            <ChipGroup options={facetOpts(facets?.transmissionType, labelTransmission)} selected={draft.transmission} onToggle={(v) => toggleArr("transmission", v)} />
          </Section>

          <Section title="Antrieb" count={draft.driveType.length}>
            <ChipGroup options={facetOpts(facets?.driveType, labelDrive)} selected={draft.driveType} onToggle={(v) => toggleArr("driveType", v)} />
          </Section>

          <Section title="Zustand" count={draft.condition.length}>
            <ChipGroup options={facetOpts(facets?.vehicleCondition, labelCondition)} selected={draft.condition} onToggle={(v) => toggleArr("condition", v)} />
          </Section>

          <Section title="Anbieter" count={draft.sellerType.length}>
            <ChipRow>
              <Chip label="Händler" selected={draft.sellerType.includes("DEALER")} onPress={() => toggleArr("sellerType", "DEALER")} />
              <Chip label="Privat" selected={draft.sellerType.includes("SELLER")} onPress={() => toggleArr("sellerType", "SELLER")} />
            </ChipRow>
          </Section>

          <Section title="Leistung (PS)" count={draft.powerFrom != null || draft.powerTo != null ? 1 : 0}>
            <RangeRow from={draft.powerFrom} to={draft.powerTo} onFrom={(t) => setNum("powerFrom", t)} onTo={(t) => setNum("powerTo", t)} />
          </Section>

          <Section title="Türen & Sitze" count={(draft.doorsFrom != null || draft.doorsTo != null ? 1 : 0) + (draft.seatsFrom != null || draft.seatsTo != null ? 1 : 0)}>
            <Text style={[styles.subLabel, { color: C.mutedForeground }]}>Türen</Text>
            <RangeRow from={draft.doorsFrom} to={draft.doorsTo} onFrom={(t) => setNum("doorsFrom", t)} onTo={(t) => setNum("doorsTo", t)} />
            <Text style={[styles.subLabel, { color: C.mutedForeground, marginTop: Spacing[3] }]}>Sitze</Text>
            <RangeRow from={draft.seatsFrom} to={draft.seatsTo} onFrom={(t) => setNum("seatsFrom", t)} onTo={(t) => setNum("seatsTo", t)} />
          </Section>

          <Section title="Motor" count={(draft.cubicCapacityFrom != null || draft.cubicCapacityTo != null ? 1 : 0) + (draft.cylindersFrom != null || draft.cylindersTo != null ? 1 : 0)}>
            <Text style={[styles.subLabel, { color: C.mutedForeground }]}>Hubraum (cm³)</Text>
            <RangeRow from={draft.cubicCapacityFrom} to={draft.cubicCapacityTo} onFrom={(t) => setNum("cubicCapacityFrom", t)} onTo={(t) => setNum("cubicCapacityTo", t)} />
            <Text style={[styles.subLabel, { color: C.mutedForeground, marginTop: Spacing[3] }]}>Zylinder</Text>
            <RangeRow from={draft.cylindersFrom} to={draft.cylindersTo} onFrom={(t) => setNum("cylindersFrom", t)} onTo={(t) => setNum("cylindersTo", t)} />
          </Section>

          <Section title="Farbe" count={draft.color.length + draft.interiorColor.length}>
            <Text style={[styles.subLabel, { color: C.mutedForeground }]}>Aussenfarbe</Text>
            <ChipGroup options={facetOpts(facets?.color, labelColor)} selected={draft.color} onToggle={(v) => toggleArr("color", v)} />
            <Text style={[styles.subLabel, { color: C.mutedForeground, marginTop: Spacing[3] }]}>Innenfarbe</Text>
            <ChipGroup options={facetOpts(facets?.interiorColor, labelColor)} selected={draft.interiorColor} onToggle={(v) => toggleArr("interiorColor", v)} />
            <ToggleRow label="Metallic-Lackierung" value={draft.metallic} onChange={(v) => setBool("metallic", v)} />
          </Section>

          <Section title="Verbrauch & Umwelt" count={
            (draft.consumptionFrom != null || draft.consumptionTo != null ? 1 : 0) +
            (draft.co2From != null || draft.co2To != null ? 1 : 0) +
            draft.energyLabels.length + draft.emissionStandards.length
          }>
            <Text style={[styles.subLabel, { color: C.mutedForeground }]}>Verbrauch (l/100 km)</Text>
            <RangeRow from={draft.consumptionFrom} to={draft.consumptionTo} onFrom={(t) => setNum("consumptionFrom", t)} onTo={(t) => setNum("consumptionTo", t)} />
            <Text style={[styles.subLabel, { color: C.mutedForeground, marginTop: Spacing[3] }]}>CO₂ (g/km)</Text>
            <RangeRow from={draft.co2From} to={draft.co2To} onFrom={(t) => setNum("co2From", t)} onTo={(t) => setNum("co2To", t)} />
            <Text style={[styles.subLabel, { color: C.mutedForeground, marginTop: Spacing[3] }]}>Energieeffizienz</Text>
            <ChipGroup options={facetOpts(facets?.energyLabel, labelEnergy)} selected={draft.energyLabels} onToggle={(v) => toggleArr("energyLabels", v)} />
            <Text style={[styles.subLabel, { color: C.mutedForeground, marginTop: Spacing[3] }]}>Abgasnorm</Text>
            <ChipGroup options={facetOpts(facets?.emissionStandard, labelEmission)} selected={draft.emissionStandards} onToggle={(v) => toggleArr("emissionStandards", v)} />
          </Section>

          {isEv && (
            <Section title="Elektro & Laden" count={
              (draft.rangeFrom != null || draft.rangeTo != null ? 1 : 0) +
              draft.batteryOwnership.length + draft.chargingPlugTypeStandard.length + draft.chargingPlugTypeFast.length
            }>
              <Text style={[styles.subLabel, { color: C.mutedForeground }]}>Reichweite (km)</Text>
              <RangeRow from={draft.rangeFrom} to={draft.rangeTo} onFrom={(t) => setNum("rangeFrom", t)} onTo={(t) => setNum("rangeTo", t)} />
              <Text style={[styles.subLabel, { color: C.mutedForeground, marginTop: Spacing[3] }]}>Batterie</Text>
              <ChipGroup options={BATTERY_OPTS} selected={draft.batteryOwnership} onToggle={(v) => toggleArr("batteryOwnership", v)} />
              <Text style={[styles.subLabel, { color: C.mutedForeground, marginTop: Spacing[3] }]}>Ladeanschluss AC</Text>
              <ChipGroup options={CHARGE_AC_OPTS} selected={draft.chargingPlugTypeStandard} onToggle={(v) => toggleArr("chargingPlugTypeStandard", v)} />
              <Text style={[styles.subLabel, { color: C.mutedForeground, marginTop: Spacing[3] }]}>Ladeanschluss DC</Text>
              <ChipGroup options={CHARGE_DC_OPTS} selected={draft.chargingPlugTypeFast} onToggle={(v) => toggleArr("chargingPlugTypeFast", v)} />
            </Section>
          )}

          <Section title="Ausstattung" count={draft.equipment.length}>
            <ChipGroup options={EQUIPMENT_OPTS} selected={draft.equipment} onToggle={(v) => toggleArr("equipment", v)} />
          </Section>

          <Section title="Besonderheiten" count={draft.extras.length}>
            <ChipGroup options={EXTRAS_OPTS} selected={draft.extras} onToggle={(v) => toggleArr("extras", v)} />
          </Section>

          <Section title="Weitere Filter" count={(draft.inspectionPassed ? 1 : 0) + (draft.hasWarranty ? 1 : 0) + (draft.daysListed != null ? 1 : 0)}>
            <ToggleRow label="MFK geprüft" value={draft.inspectionPassed} onChange={(v) => setBool("inspectionPassed", v)} />
            <ToggleRow label="Mit Garantie" value={draft.hasWarranty} onChange={(v) => setBool("hasWarranty", v)} />
            <Text style={[styles.subLabel, { color: C.mutedForeground, marginTop: Spacing[2] }]}>Inseratsalter</Text>
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

function ChipGroup({
  options,
  selected,
  onToggle,
}: {
  options: Opt[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  const C = useTheme();
  if (options.length === 0) {
    return <Text style={[styles.emptyOpt, { color: C.mutedForeground }]}>Keine Optionen verfügbar</Text>;
  }
  return (
    <View style={styles.chipWrap}>
      {options.map((o) => (
        <Chip key={o.value} label={o.label} selected={selected.includes(o.value)} onPress={() => onToggle(o.value)} />
      ))}
    </View>
  );
}

function ChipRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.chipWrap}>{children}</View>;
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
