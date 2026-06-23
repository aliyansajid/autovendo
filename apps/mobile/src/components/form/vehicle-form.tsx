import { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  carMakes, utilityMakes, truckMakes, camperMakes,
  carModels, utilityModels, truckModels,
  carBodyTypeEnum, utilityBodyTypeEnum, truckBodyTypeEnum, camperBodyTypeEnum,
  carFuelTypeEnum, utilityFuelTypeEnum, truckFuelTypeEnum, camperFuelTypeEnum,
  carExtrasEnum, utilityExtrasEnum, truckExtrasEnum, camperExtrasEnum,
  ColorEnum, VehicleConditionEnum, TransmissionTypeEnum, DriveTypeEnum, EquipmentEnum,
  EmissionStandardEnum, getRegistrationYears,
  swissCities,
} from "@repo/vehicle-constants";
import { FontFamily, FontSize, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { TextField } from "@/components/ui/text-field";
import { SelectField, type SelectOption } from "./select-field";
import { ImageGrid, type FormImage } from "./image-grid";
import {
  labelColor, labelCondition, labelTransmission, labelDrive, labelEquipment,
} from "@/lib/labels";
import {
  createSellerVehicle, getSellerVehicle, updateSellerVehicle, updateSellerProfile,
  createDealerVehicle, getDealerVehicle, updateDealerVehicle,
  fetchSellerProfile, fetchDealerProfile,
  fetchMe, isDealer,
  type VehicleRecord,
} from "@/lib/account";

// ─── Option lists ──────────────────────────────────────────────────────────────

type Group = { label: string; items: readonly { value: string; label: string }[] };

function makeOptions(vt: string): SelectOption[] {
  const groups = (vt === "UTILITY" ? utilityMakes : vt === "TRUCK" ? truckMakes : vt === "CAMPER" ? camperMakes : carMakes) as unknown as Group[];
  // Keep the web grouping ("Top-Marken" / "Alle Marken") and de-dup makes that
  // appear in more than one group, keeping the first (top) occurrence.
  const seen = new Set<string>();
  const out: SelectOption[] = [];
  for (const g of groups) {
    for (const i of g.items) {
      if (seen.has(i.value)) continue;
      seen.add(i.value);
      out.push({ value: i.value, label: i.label, group: g.label });
    }
  }
  return out;
}
function modelOptions(vt: string, make: string): SelectOption[] {
  if (!make) return [];
  const map = (vt === "UTILITY" ? utilityModels : vt === "TRUCK" ? truckModels : vt === "CAMPER" ? {} : carModels) as Record<
    string,
    { value: string; label: string }[]
  >;
  return (map[make] ?? []).map((m) => ({ value: m.value, label: m.label }));
}
function bodyOptions(vt: string): SelectOption[] {
  const arr = vt === "UTILITY" ? utilityBodyTypeEnum : vt === "TRUCK" ? truckBodyTypeEnum : vt === "CAMPER" ? camperBodyTypeEnum : carBodyTypeEnum;
  return arr.map((b) => ({ value: b.value, label: b.label }));
}
function fuelOptions(vt: string): SelectOption[] {
  const arr = vt === "UTILITY" ? utilityFuelTypeEnum : vt === "TRUCK" ? truckFuelTypeEnum : vt === "CAMPER" ? camperFuelTypeEnum : carFuelTypeEnum;
  return arr.map((f) => ({ value: f.value, label: f.label }));
}
function extrasOptions(vt: string): SelectOption[] {
  const arr = vt === "UTILITY" ? utilityExtrasEnum : vt === "TRUCK" ? truckExtrasEnum : vt === "CAMPER" ? camperExtrasEnum : carExtrasEnum;
  return arr.map((e) => ({ value: e.value, label: e.label }));
}

const VEHICLE_TYPE_OPTS: SelectOption[] = [
  { value: "CAR", label: "Personenwagen" },
  { value: "CAMPER", label: "Wohnmobil" },
  { value: "UTILITY", label: "Nutzfahrzeug" },
  { value: "TRUCK", label: "Lastwagen" },
];
const COLOR_OPTS: SelectOption[] = ColorEnum.map((c) => ({ value: c.value, label: labelColor(c.value) }));
const CONDITION_OPTS: SelectOption[] = VehicleConditionEnum.map((c) => ({ value: c.value, label: labelCondition(c.value) }));
const TRANSMISSION_OPTS: SelectOption[] = TransmissionTypeEnum.map((t) => ({ value: t.value, label: labelTransmission(t.value) }));
const DRIVE_OPTS: SelectOption[] = DriveTypeEnum.map((d) => ({ value: d.value, label: labelDrive(d.value) }));
const EQUIPMENT_OPTS: SelectOption[] = EquipmentEnum.map((e) => ({ value: e.value, label: labelEquipment(e.value) }));
const CITY_OPTS: SelectOption[] = (swissCities as { value: string; label: string }[]).map((c) => ({ value: c.value, label: c.label }));
const MONTH_OPTS: SelectOption[] = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: new Date(2000, i, 1).toLocaleDateString("de-CH", { month: "long" }),
}));
const GEAR_OPTS: SelectOption[] = [
  { value: "AUTOMATIC", label: "Automat" },
  { value: "MANUAL", label: "Schaltgetriebe" },
];
const YEAR_OPTS: SelectOption[] = getRegistrationYears();
// transmissionType options depend on the coarse gearTransmission, mirroring web:
// AUTOMATIC → automatic variants, MANUAL → manual only.
function transmissionOptions(gear: string): SelectOption[] {
  return TRANSMISSION_OPTS.filter((t) => {
    if (!gear) return true;
    if (gear === "AUTOMATIC") return ["AUTOMATIC", "AUTOMATIC_STEPLESS", "SEMI_AUTOMATIC"].includes(t.value);
    if (gear === "MANUAL") return t.value === "MANUAL";
    return true;
  });
}
const ENERGY_OPTS: SelectOption[] = ["A", "B", "C", "D", "E", "F", "G"].map((v) => ({ value: v, label: v }));
const EMISSION_OPTS: SelectOption[] = EmissionStandardEnum.map((e) => ({
  value: e.value,
  label: "Euro " + e.value.replace(/^EURO_/, "").replaceAll("_", "-").toLowerCase(),
}));
const WARRANTY_OPTS: SelectOption[] = [
  { value: "FROM_DELIVERY", label: "Ab Übergabe" },
  { value: "FROM_FIRST_REGISTRATION", label: "Ab Erstzulassung" },
  { value: "FROM_DATE", label: "Ab Datum" },
];
const BATTERY_OWNERSHIP_OPTS: SelectOption[] = [
  { value: "BATTERY_INCLUDED", label: "Batterie inklusive" },
  { value: "BATTERY_RENT_REQUIRED", label: "Batteriemiete erforderlich" },
];
const PLUG_STD_OPTS: SelectOption[] = [
  { value: "TYPE_1", label: "Typ 1" },
  { value: "TYPE_2", label: "Typ 2" },
];
const PLUG_FAST_OPTS: SelectOption[] = [
  { value: "CCS", label: "CCS" },
  { value: "CSS_2", label: "CCS 2" },
  { value: "CHADEMO", label: "CHAdeMO" },
  { value: "SUPERCHARGER", label: "Supercharger" },
];

// ─── Form state ────────────────────────────────────────────────────────────────

type FormState = {
  vehicleType: string;
  make: string; model: string; version: string;
  bodyType: string; fuelType: string; transmissionType: string; driveType: string;
  vehicleCondition: string;
  registrationMonth: string; registrationYear: string; kilometer: string;
  price: string; newPrice: string;
  color: string; interiorColor: string; metallic: boolean;
  doors: string; seats: string; hp: string; kw: string; cubicCapacity: string;
  gearTransmission: string; numberOfGears: string; cylinders: string;
  energyLabel: string; emissionStandard: string; co2Emission: string;
  consumptionCity: string; consumptionCountry: string; consumptionTotal: string;
  wheelbase: string; emptyWeight: string; loadCapacity: string;
  height: string; width: string; length: string; towingCapacityBraked: string;
  typeApproval: string; serialNumber: string;
  warranty: string; warrantyStartDate: string; duration: string; maxKm: string;
  lastInspectionDate: string; inspectionPassed: boolean;
  batteryCapacity: string; batteryRentalMonth: string; chargingPower: string;
  powerConsumption: string; range: string;
  combustionEnginePowerHp: string; electricMotorPowerHp: string;
  batteryOwnership: string; chargingPlugTypeStandard: string; chargingPlugTypeFast: string;
  vin: string; vehicleDescription: string;
  companyName: string; businessEmail: string; phoneNumber: string; address: string; zipCode: string; city: string;
};

const EMPTY_STATE: FormState = {
  vehicleType: "CAR",
  make: "", model: "", version: "",
  bodyType: "", fuelType: "", transmissionType: "", driveType: "",
  vehicleCondition: "",
  registrationMonth: "", registrationYear: "", kilometer: "",
  price: "", newPrice: "",
  color: "", interiorColor: "", metallic: false,
  doors: "", seats: "", hp: "", kw: "", cubicCapacity: "",
  gearTransmission: "", numberOfGears: "", cylinders: "",
  energyLabel: "", emissionStandard: "", co2Emission: "",
  consumptionCity: "", consumptionCountry: "", consumptionTotal: "",
  wheelbase: "", emptyWeight: "", loadCapacity: "",
  height: "", width: "", length: "", towingCapacityBraked: "",
  typeApproval: "", serialNumber: "",
  warranty: "", warrantyStartDate: "", duration: "", maxKm: "",
  lastInspectionDate: "", inspectionPassed: false,
  batteryCapacity: "", batteryRentalMonth: "", chargingPower: "",
  powerConsumption: "", range: "",
  combustionEnginePowerHp: "", electricMotorPowerHp: "",
  batteryOwnership: "", chargingPlugTypeStandard: "", chargingPlugTypeFast: "",
  vin: "", vehicleDescription: "",
  companyName: "", businessEmail: "", phoneNumber: "", address: "", zipCode: "", city: "",
};

function str(v: unknown): string {
  return v == null ? "" : String(v);
}
function numOrUndef(s: string): number | undefined {
  if (!s.trim()) return undefined;
  const n = Number(s.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : undefined;
}
function recordToEquipment(v: unknown): string[] {
  if (Array.isArray(v)) return v as string[];
  if (v && typeof v === "object") return Object.entries(v as Record<string, boolean>).filter(([, on]) => on).map(([k]) => k);
  return [];
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function VehicleForm({ mode: modeProp, vehicleId }: { mode?: "seller" | "dealer"; vehicleId?: string }) {
  const C = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const isEdit = !!vehicleId;
  // When no mode is passed (e.g. the universal "+" entry), resolve it from the
  // signed-in user's role.
  const [mode, setMode] = useState<"seller" | "dealer">(modeProp ?? "seller");

  const [f, setF] = useState<FormState>(EMPTY_STATE);
  const [images, setImages] = useState<FormImage[]>([]);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [extras, setExtras] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setF((prev) => ({ ...prev, [key]: value }));
  }, []);

  // When the vehicle type changes, clear type-specific fields to avoid mismatches.
  const setVehicleType = useCallback((vt: string) => {
    setF((prev) => ({ ...prev, vehicleType: vt, make: "", model: "", bodyType: "", fuelType: "" }));
    setExtras([]);
  }, []);

  // Model options depend on the make, so clear the model when the make changes.
  const setMake = useCallback((make: string) => {
    setF((prev) => ({ ...prev, make, model: "" }));
  }, []);

  // transmissionType options depend on gearTransmission, so clear it when the
  // gear changes to avoid keeping a now-invalid value.
  const setGear = useCallback((gear: string) => {
    setF((prev) => ({ ...prev, gearTransmission: gear, transmissionType: "" }));
  }, []);

  // Changing the fuel type hides whole groups of fields; clear the ones that
  // become hidden so we never submit stale, mismatched values (mirrors web).
  const setFuel = useCallback((next: string) => {
    const combustionOrMild = ["PETROL", "DIESEL", "LPG_PETROL", "MHEV_DIESEL", "MHEV_PETROL", "CNG_PETROL", "ETHANOL_PETROL"].includes(next);
    const electric = next === "ELECTRIC";
    const fullHybrid = ["HEV_DIESEL", "HEV_PETROL"].includes(next);
    const hydrogen = next === "HYDROGEN";
    const pluginHybrid = ["PHEV_DIESEL", "PHEV_PETROL"].includes(next);

    setF((prev) => {
      const out = { ...prev, fuelType: next };
      if (!(combustionOrMild || hydrogen)) {
        out.cubicCapacity = "";
        out.cylinders = "";
      }
      if (!(combustionOrMild || fullHybrid || pluginHybrid)) {
        out.consumptionCity = "";
        out.consumptionCountry = "";
        out.consumptionTotal = "";
      }
      if (!(combustionOrMild || fullHybrid || pluginHybrid || hydrogen)) {
        out.emissionStandard = "";
      }
      if (!(combustionOrMild || fullHybrid || hydrogen || pluginHybrid)) {
        out.co2Emission = "";
      }
      if (!(electric || fullHybrid || pluginHybrid)) {
        out.range = "";
        out.batteryCapacity = "";
        out.powerConsumption = "";
      }
      if (!(electric || pluginHybrid)) {
        out.batteryOwnership = "";
        out.batteryRentalMonth = "";
        out.chargingPlugTypeStandard = "";
        out.chargingPlugTypeFast = "";
        out.chargingPower = "";
      }
      if (!(fullHybrid || pluginHybrid)) {
        out.combustionEnginePowerHp = "";
        out.electricMotorPowerHp = "";
      }
      return out;
    });
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Resolve the mode from the user's role when not provided explicitly.
        const resolved = modeProp ?? (isDealer(await fetchMe()) ? "dealer" : "seller");
        if (mounted) setMode(resolved);

        const profile = resolved === "dealer" ? await fetchDealerProfile() : await fetchSellerProfile();
        const prefill: Partial<FormState> =
          resolved === "dealer"
            ? {
                companyName: str((profile as { companyName?: string }).companyName),
                businessEmail: str((profile as { businessEmail?: string }).businessEmail),
                phoneNumber: str((profile as { phoneNumber?: string }).phoneNumber),
                address: str((profile as { streetAddress?: string }).streetAddress),
                zipCode: str((profile as { zipCode?: string }).zipCode),
                city: str((profile as { city?: string }).city),
              }
            : {
                phoneNumber: str((profile as { phoneNumber?: string | null }).phoneNumber),
                address: str((profile as { streetAddress?: string | null }).streetAddress),
                zipCode: str((profile as { zipCode?: string | null }).zipCode),
                city: str((profile as { city?: string | null }).city),
              };

        if (vehicleId) {
          const v: VehicleRecord = resolved === "dealer" ? await getDealerVehicle(vehicleId) : await getSellerVehicle(vehicleId);
          if (!mounted) return;
          setF({
            vehicleType: str(v.vehicleType) || "CAR",
            make: str(v.make), model: str(v.model), version: str(v.version),
            bodyType: str(v.bodyType), fuelType: str(v.fuelType),
            transmissionType: str(v.transmissionType), driveType: str(v.driveType),
            vehicleCondition: str(v.vehicleCondition),
            registrationMonth: str(v.registrationMonth), registrationYear: str(v.registrationYear), kilometer: str(v.kilometer),
            price: str(v.price), newPrice: str(v.newPrice),
            color: str(v.color), interiorColor: str(v.interiorColor), metallic: v.metallic === true,
            doors: str(v.doors), seats: str(v.seats), hp: str(v.hp), kw: str(v.kw), cubicCapacity: str(v.cubicCapacity),
            gearTransmission: str(v.gearTransmission), numberOfGears: str(v.numberOfGears), cylinders: str(v.cylinders),
            energyLabel: str(v.energyLabel), emissionStandard: str(v.emissionStandard), co2Emission: str(v.co2Emission),
            consumptionCity: str(v.consumptionCity), consumptionCountry: str(v.consumptionCountry), consumptionTotal: str(v.consumptionTotal),
            wheelbase: str(v.wheelbase), emptyWeight: str(v.emptyWeight), loadCapacity: str(v.loadCapacity),
            height: str(v.height), width: str(v.width), length: str(v.length), towingCapacityBraked: str(v.towingCapacityBraked),
            typeApproval: str(v.typeApproval), serialNumber: str(v.serialNumber),
            warranty: str(v.warranty), warrantyStartDate: str(v.warrantyStartDate).slice(0, 10), duration: str(v.duration), maxKm: str(v.maxKm),
            lastInspectionDate: str(v.lastInspectionDate).slice(0, 10), inspectionPassed: v.inspectionPassed === true,
            batteryCapacity: str(v.batteryCapacity), batteryRentalMonth: str(v.batteryRentalMonth), chargingPower: str(v.chargingPower),
            powerConsumption: str(v.powerConsumption), range: str(v.range),
            combustionEnginePowerHp: str(v.combustionEnginePowerHp), electricMotorPowerHp: str(v.electricMotorPowerHp),
            batteryOwnership: str(v.batteryOwnership), chargingPlugTypeStandard: str(v.chargingPlugTypeStandard), chargingPlugTypeFast: str(v.chargingPlugTypeFast),
            vin: str(v.vin), vehicleDescription: str(v.vehicleDescription),
            companyName: str(v.companyName) || prefill.companyName || "",
            businessEmail: str(v.businessEmail) || prefill.businessEmail || "",
            phoneNumber: prefill.phoneNumber ?? "",
            address: prefill.address ?? "",
            zipCode: prefill.zipCode ?? "",
            city: prefill.city ?? "",
          });
          setEquipment(recordToEquipment(v.equipment));
          setExtras(recordToEquipment(v.extras));
          setImages((Array.isArray(v.images) ? (v.images as string[]) : []).map((key) => ({ kind: "remote", key })));
        } else if (mounted) {
          setF((prev) => ({ ...prev, ...prefill }));
        }
      } catch {
        Alert.alert("Fehler", "Daten konnten nicht geladen werden.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [modeProp, vehicleId]);

  const toggleArr = (list: string[], setList: (v: string[]) => void, value: string) =>
    setList(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);

  const validate = (): string | null => {
    if (!f.make) return "Bitte wählen Sie eine Marke.";
    if (!f.bodyType) return "Bitte wählen Sie einen Aufbau.";
    if (!f.color) return "Bitte wählen Sie eine Farbe.";
    if (!f.registrationMonth || !f.registrationYear) return "Bitte geben Sie die Erstzulassung an.";
    if (!f.kilometer.trim()) return "Bitte geben Sie den Kilometerstand an.";
    if (!f.price.trim()) return "Bitte geben Sie den Preis an.";
    if (images.length < 5) return "Bitte laden Sie mindestens 5 Fotos hoch.";
    if (images.length > 25) return "Bitte laden Sie höchstens 25 Fotos hoch.";
    if (!f.phoneNumber.trim()) return "Bitte geben Sie eine Telefonnummer an.";
    if (f.address.trim().length < 5) return "Bitte geben Sie eine gültige Adresse an.";
    if (!/^\d{4}$/.test(f.zipCode.trim())) return "Bitte geben Sie eine gültige PLZ an.";
    if (!f.city) return "Bitte wählen Sie einen Ort.";
    return null;
  };

  const submit = async () => {
    const err = validate();
    if (err) {
      Alert.alert("Fehlende Angaben", err);
      return;
    }
    setSubmitting(true);
    try {
      // Images go to the API as a mix of new local files (uploaded by the API) and
      // existing keys to keep — one multipart call does upload + delete + write.
      const imageInputs = images.map((img) =>
        img.kind === "remote"
          ? img.key
          : { uri: img.uri, name: img.name, mime: img.mime },
      );

      // Build payload (omit empty optional fields — the API rejects "" for enums/numbers).
      const payload: Record<string, unknown> = {
        vehicleType: f.vehicleType,
        make: f.make,
        bodyType: f.bodyType,
        color: f.color,
        metallic: f.metallic,
        registrationMonth: Number(f.registrationMonth),
        registrationYear: Number(f.registrationYear),
        kilometer: numOrUndef(f.kilometer),
        price: numOrUndef(f.price),
        phoneNumber: f.phoneNumber.trim(),
        address: f.address.trim(),
        zipCode: f.zipCode.trim(),
        city: f.city,
      };
      const optStr: (keyof FormState)[] = [
        "model", "version", "fuelType", "transmissionType", "driveType", "vehicleCondition", "interiorColor",
        "gearTransmission", "energyLabel", "emissionStandard", "typeApproval", "serialNumber",
        "warranty", "warrantyStartDate", "lastInspectionDate",
        "batteryOwnership", "chargingPlugTypeStandard", "chargingPlugTypeFast",
        "vin", "vehicleDescription", "companyName", "businessEmail",
      ];
      for (const k of optStr) if (f[k] && String(f[k]).trim()) payload[k] = f[k];
      const optNum: (keyof FormState)[] = [
        "newPrice", "doors", "seats", "hp", "kw", "cubicCapacity",
        "numberOfGears", "cylinders", "co2Emission", "consumptionCity", "consumptionCountry", "consumptionTotal",
        "wheelbase", "emptyWeight", "loadCapacity", "height", "width", "length", "towingCapacityBraked",
        "duration", "maxKm", "batteryCapacity", "batteryRentalMonth", "chargingPower",
        "powerConsumption", "range", "combustionEnginePowerHp", "electricMotorPowerHp",
      ];
      for (const k of optNum) {
        const n = numOrUndef(String(f[k]));
        if (n != null) payload[k] = n;
      }
      if (f.inspectionPassed) payload.inspectionPassed = true;
      if (equipment.length) payload.equipment = Object.fromEntries(equipment.map((k) => [k, true]));
      if (extras.length) payload.extras = Object.fromEntries(extras.map((k) => [k, true]));

      // Create or update — one multipart call carrying data + images.
      if (mode === "dealer") {
        if (vehicleId) await updateDealerVehicle(vehicleId, payload, imageInputs);
        else await createDealerVehicle(payload, imageInputs);
      } else {
        // Ensure the private seller's profile row exists (a fresh in-app signup
        // has none, and createVehicle requires it). Upsert is idempotent.
        await updateSellerProfile({
          phoneNumber: f.phoneNumber.trim(),
          streetAddress: f.address.trim(),
          zipCode: f.zipCode.trim(),
          city: f.city,
        });
        if (vehicleId) await updateSellerVehicle(vehicleId, payload, imageInputs);
        else await createSellerVehicle(payload, imageInputs);
      }

      Alert.alert(isEdit ? "Gespeichert" : "Inserat erstellt", isEdit ? "Ihre Änderungen wurden gespeichert." : "Ihr Entwurf wurde erstellt. Veröffentlichen Sie ihn im Dashboard.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e) {
      // Show the API's specific message (e.g. quota/validation) when we have one.
      const msg = e instanceof Error ? e.message : "";
      Alert.alert(
        "Fehler",
        msg && msg !== "network_error" && !msg.startsWith("request_failed")
          ? msg
          : "Das Inserat konnte nicht gespeichert werden. Bitte prüfen Sie Ihre Angaben.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator color={C.mutedForeground} />
      </View>
    );
  }

  // Fuel-driven show/hide, mirroring the web TechnicalDataSection exactly.
  // Note MHEV is treated as combustion (not electric), unlike the old `includes`.
  const fuel = f.fuelType;
  const showCombustionOrMild = [
    "PETROL", "DIESEL", "LPG_PETROL", "MHEV_DIESEL", "MHEV_PETROL", "CNG_PETROL", "ETHANOL_PETROL",
  ].includes(fuel);
  const showElectric = fuel === "ELECTRIC";
  const showFullHybrid = ["HEV_DIESEL", "HEV_PETROL"].includes(fuel);
  const showHydrogen = fuel === "HYDROGEN";
  const showPluginHybrid = ["PHEV_DIESEL", "PHEV_PETROL"].includes(fuel);

  const showConsumption = showCombustionOrMild || showFullHybrid || showPluginHybrid;
  const showDisplacement = showCombustionOrMild || showHydrogen; // cubicCapacity + cylinders
  const showEmission = showCombustionOrMild || showFullHybrid || showPluginHybrid || showHydrogen;
  const showCo2 = showCombustionOrMild || showFullHybrid || showHydrogen || showPluginHybrid;
  const showEvCore = showElectric || showFullHybrid || showPluginHybrid; // range/battery/consumption
  const showCharging = showElectric || showPluginHybrid; // battery ownership, plugs, charging power
  const showHybridPower = showFullHybrid || showPluginHybrid; // combustion + e-motor power

  // Warranty gating (basic-data-section): any warranty reveals duration/maxKm;
  // only FROM_DATE reveals the start date.
  const showWarrantyDetails = ["FROM_DELIVERY", "FROM_FIRST_REGISTRATION", "FROM_DATE"].includes(f.warranty);
  const showWarrantyStartDate = f.warranty === "FROM_DATE";

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]} style={[styles.header, { borderBottomColor: C.border }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.headerBtn}>
            <Icon name="chevron.left" size={22} color={C.foreground} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: C.foreground }]} numberOfLines={1}>
            {isEdit ? "Inserat bearbeiten" : "Neues Inserat"}
          </Text>
          <View style={styles.headerBtn} />
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <FormSection title="Fahrzeug">
            <SelectField label="Fahrzeugtyp" required value={f.vehicleType} options={VEHICLE_TYPE_OPTS} onChange={setVehicleType} />
            <SelectField label="Marke" required searchable value={f.make} options={makeOptions(f.vehicleType)} onChange={setMake} />
            <SelectField label="Modell" optional searchable value={f.model} options={modelOptions(f.vehicleType, f.make)} onChange={(v) => set("model", v)} disabled={!f.make} placeholder={f.make ? "Auswählen" : "Zuerst Marke wählen"} />
            <TextField label="Version" value={f.version} onChangeText={(v) => set("version", v)} placeholder="z. B. 2.0 TDI quattro" />
            <SelectField label="Aufbau" required searchable value={f.bodyType} options={bodyOptions(f.vehicleType)} onChange={(v) => set("bodyType", v)} />
            <SelectField label="Zustand" optional value={f.vehicleCondition} options={CONDITION_OPTS} onChange={(v) => set("vehicleCondition", v)} />
          </FormSection>

          <FormSection title="Eckdaten">
            <SelectField label="Monat (Erstzulassung)" required value={f.registrationMonth} options={MONTH_OPTS} onChange={(v) => set("registrationMonth", v)} />
            <SelectField label="Jahr (Erstzulassung)" required searchable value={f.registrationYear} options={YEAR_OPTS} onChange={(v) => set("registrationYear", v)} />
            <TextField label="Kilometerstand *" value={f.kilometer} onChangeText={(v) => set("kilometer", v)} keyboardType="number-pad" placeholder="z. B. 84500" />
            <SelectField label="Treibstoff" optional searchable value={f.fuelType} options={fuelOptions(f.vehicleType)} onChange={setFuel} />
            <SelectField label="Schaltung" optional value={f.gearTransmission} options={GEAR_OPTS} onChange={setGear} />
            <SelectField label="Getriebe" optional value={f.transmissionType} options={transmissionOptions(f.gearTransmission)} onChange={(v) => set("transmissionType", v)} disabled={!f.gearTransmission} placeholder={f.gearTransmission ? "Auswählen" : "Zuerst Schaltung wählen"} />
            <SelectField label="Antrieb" optional value={f.driveType} options={DRIVE_OPTS} onChange={(v) => set("driveType", v)} />
          </FormSection>

          <FormSection title="Preis">
            <TextField label="Preis (CHF) *" value={f.price} onChangeText={(v) => set("price", v)} keyboardType="number-pad" placeholder="z. B. 24900" />
            <TextField label="Neupreis (CHF)" value={f.newPrice} onChangeText={(v) => set("newPrice", v)} keyboardType="number-pad" placeholder="optional" />
          </FormSection>

          <FormSection title="Aussehen & Kabine">
            <SelectField label="Aussenfarbe" required value={f.color} options={COLOR_OPTS} onChange={(v) => set("color", v)} />
            <SelectField label="Innenfarbe" optional value={f.interiorColor} options={COLOR_OPTS} onChange={(v) => set("interiorColor", v)} />
            <View style={styles.toggleRow}>
              <Text style={[styles.toggleLabel, { color: C.foreground }]}>Metallic-Lackierung</Text>
              <Switch value={f.metallic} onValueChange={(v) => set("metallic", v)} trackColor={{ true: C.primary, false: C.border }} />
            </View>
            <View style={styles.rowTwo}>
              <View style={{ flex: 1 }}>
                <TextField label="Türen" value={f.doors} onChangeText={(v) => set("doors", v)} keyboardType="number-pad" placeholder="z. B. 5" />
              </View>
              <View style={{ flex: 1 }}>
                <TextField label="Sitze" value={f.seats} onChangeText={(v) => set("seats", v)} keyboardType="number-pad" placeholder="z. B. 5" />
              </View>
            </View>
          </FormSection>

          <FormSection title="Leistung">
            <View style={styles.rowTwo}>
              <View style={{ flex: 1 }}>
                <TextField label="PS" value={f.hp} onChangeText={(v) => set("hp", v)} keyboardType="number-pad" placeholder="z. B. 150" />
              </View>
              <View style={{ flex: 1 }}>
                <TextField label="kW" value={f.kw} onChangeText={(v) => set("kw", v)} keyboardType="number-pad" placeholder="z. B. 110" />
              </View>
            </View>
            {showDisplacement && (
              <View style={styles.rowTwo}>
                <View style={{ flex: 1 }}>
                  <TextField label="Hubraum (cm³)" value={f.cubicCapacity} onChangeText={(v) => set("cubicCapacity", v)} keyboardType="number-pad" placeholder="z. B. 1968" />
                </View>
                <View style={{ flex: 1 }}>
                  <TextField label="Zylinder" value={f.cylinders} onChangeText={(v) => set("cylinders", v)} keyboardType="number-pad" placeholder="z. B. 4" />
                </View>
              </View>
            )}
            <TextField label="Anzahl Gänge" value={f.numberOfGears} onChangeText={(v) => set("numberOfGears", v)} keyboardType="number-pad" placeholder="z. B. 6" />
            <TextField label="Fahrgestellnummer (VIN)" value={f.vin} onChangeText={(v) => set("vin", v.toUpperCase())} placeholder="17 Zeichen" autoCapitalize="characters" editable={!isEdit} />
          </FormSection>

          <FormSection title="Verbrauch & Effizienz">
            <SelectField label="Energieeffizienz" optional value={f.energyLabel} options={ENERGY_OPTS} onChange={(v) => set("energyLabel", v)} />
            {showEmission && (
              <SelectField label="Abgasnorm" optional searchable value={f.emissionStandard} options={EMISSION_OPTS} onChange={(v) => set("emissionStandard", v)} />
            )}
            {showCo2 && (
              <TextField label="CO₂-Emission (g/km)" value={f.co2Emission} onChangeText={(v) => set("co2Emission", v)} keyboardType="number-pad" placeholder="z. B. 120" />
            )}
            {showConsumption && (
              <>
                <View style={styles.rowTwo}>
                  <View style={{ flex: 1 }}>
                    <TextField label="Verbrauch Stadt" value={f.consumptionCity} onChangeText={(v) => set("consumptionCity", v)} keyboardType="decimal-pad" placeholder="l/100 km" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextField label="Verbrauch Land" value={f.consumptionCountry} onChangeText={(v) => set("consumptionCountry", v)} keyboardType="decimal-pad" placeholder="l/100 km" />
                  </View>
                </View>
                <TextField label="Verbrauch kombiniert" value={f.consumptionTotal} onChangeText={(v) => set("consumptionTotal", v)} keyboardType="decimal-pad" placeholder="l/100 km" />
              </>
            )}
          </FormSection>

          {showEvCore && (
            <FormSection title="Elektro & Laden">
              <View style={styles.rowTwo}>
                <View style={{ flex: 1 }}>
                  <TextField label="Batteriekapazität (kWh)" value={f.batteryCapacity} onChangeText={(v) => set("batteryCapacity", v)} keyboardType="decimal-pad" placeholder="z. B. 77" />
                </View>
                <View style={{ flex: 1 }}>
                  <TextField label="Reichweite (km)" value={f.range} onChangeText={(v) => set("range", v)} keyboardType="number-pad" placeholder="z. B. 450" />
                </View>
              </View>
              <TextField label="Stromverbrauch (kWh/100km)" value={f.powerConsumption} onChangeText={(v) => set("powerConsumption", v)} keyboardType="decimal-pad" placeholder="z. B. 17" />

              {showCharging && (
                <>
                  <SelectField label="Batterie" optional value={f.batteryOwnership} options={BATTERY_OWNERSHIP_OPTS} onChange={(v) => set("batteryOwnership", v)} />
                  {f.batteryOwnership === "BATTERY_RENT_REQUIRED" && (
                    <TextField label="Batteriemiete (CHF/Monat)" value={f.batteryRentalMonth} onChangeText={(v) => set("batteryRentalMonth", v)} keyboardType="number-pad" placeholder="optional" />
                  )}
                  <SelectField label="Ladeanschluss (Standard)" optional value={f.chargingPlugTypeStandard} options={PLUG_STD_OPTS} onChange={(v) => set("chargingPlugTypeStandard", v)} />
                  <SelectField label="Ladeanschluss (Schnell)" optional value={f.chargingPlugTypeFast} options={PLUG_FAST_OPTS} onChange={(v) => set("chargingPlugTypeFast", v)} />
                  <TextField label="Ladeleistung (kW)" value={f.chargingPower} onChangeText={(v) => set("chargingPower", v)} keyboardType="decimal-pad" placeholder="z. B. 11" />
                </>
              )}

              {showHybridPower && (
                <View style={styles.rowTwo}>
                  <View style={{ flex: 1 }}>
                    <TextField label="Verbrennerleistung (PS)" value={f.combustionEnginePowerHp} onChangeText={(v) => set("combustionEnginePowerHp", v)} keyboardType="number-pad" placeholder="Hybrid" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextField label="E-Motorleistung (PS)" value={f.electricMotorPowerHp} onChangeText={(v) => set("electricMotorPowerHp", v)} keyboardType="number-pad" placeholder="Hybrid" />
                  </View>
                </View>
              )}
            </FormSection>
          )}

          <FormSection title="Masse & Gewicht">
            <View style={styles.rowTwo}>
              <View style={{ flex: 1 }}>
                <TextField label="Leergewicht (kg)" value={f.emptyWeight} onChangeText={(v) => set("emptyWeight", v)} keyboardType="number-pad" placeholder="z. B. 1500" />
              </View>
              <View style={{ flex: 1 }}>
                <TextField label="Nutzlast (kg)" value={f.loadCapacity} onChangeText={(v) => set("loadCapacity", v)} keyboardType="number-pad" placeholder="optional" />
              </View>
            </View>
            <View style={styles.rowTwo}>
              <View style={{ flex: 1 }}>
                <TextField label="Radstand (mm)" value={f.wheelbase} onChangeText={(v) => set("wheelbase", v)} keyboardType="number-pad" placeholder="optional" />
              </View>
              <View style={{ flex: 1 }}>
                <TextField label="Anhängelast gebremst (kg)" value={f.towingCapacityBraked} onChangeText={(v) => set("towingCapacityBraked", v)} keyboardType="number-pad" placeholder="optional" />
              </View>
            </View>
            <View style={styles.rowTwo}>
              <View style={{ flex: 1 }}>
                <TextField label="Höhe (mm)" value={f.height} onChangeText={(v) => set("height", v)} keyboardType="number-pad" placeholder="optional" />
              </View>
              <View style={{ flex: 1 }}>
                <TextField label="Breite (mm)" value={f.width} onChangeText={(v) => set("width", v)} keyboardType="number-pad" placeholder="optional" />
              </View>
            </View>
            <TextField label="Länge (mm)" value={f.length} onChangeText={(v) => set("length", v)} keyboardType="number-pad" placeholder="optional" />
          </FormSection>

          <FormSection title="Garantie & Prüfung">
            <SelectField label="Garantie" optional value={f.warranty} options={WARRANTY_OPTS} onChange={(v) => set("warranty", v)} />
            {showWarrantyStartDate && (
              <TextField label="Garantiebeginn (JJJJ-MM-TT)" value={f.warrantyStartDate} onChangeText={(v) => set("warrantyStartDate", v)} placeholder="z. B. 2024-01-15" autoCapitalize="none" />
            )}
            {showWarrantyDetails && (
              <View style={styles.rowTwo}>
                <View style={{ flex: 1 }}>
                  <TextField label="Dauer (Monate)" value={f.duration} onChangeText={(v) => set("duration", v)} keyboardType="number-pad" placeholder="z. B. 24" />
                </View>
                <View style={{ flex: 1 }}>
                  <TextField label="Max. km" value={f.maxKm} onChangeText={(v) => set("maxKm", v)} keyboardType="number-pad" placeholder="optional" />
                </View>
              </View>
            )}
            <TextField label="Letzte Prüfung (JJJJ-MM-TT)" value={f.lastInspectionDate} onChangeText={(v) => set("lastInspectionDate", v)} placeholder="z. B. 2024-03-01" autoCapitalize="none" />
            <View style={styles.toggleRow}>
              <Text style={[styles.toggleLabel, { color: C.foreground }]}>Ab MFK / geprüft</Text>
              <Switch value={f.inspectionPassed} onValueChange={(v) => set("inspectionPassed", v)} trackColor={{ true: C.primary, false: C.border }} />
            </View>
          </FormSection>

          <FormSection title="Weitere Angaben">
            <TextField label="Typengenehmigung" value={f.typeApproval} onChangeText={(v) => set("typeApproval", v)} placeholder="optional" />
            <TextField label="Seriennummer" value={f.serialNumber} onChangeText={(v) => set("serialNumber", v)} placeholder="optional" />
          </FormSection>

          <FormSection title="Ausstattung">
            <ChipMulti options={EQUIPMENT_OPTS} selected={equipment} onToggle={(v) => toggleArr(equipment, setEquipment, v)} />
          </FormSection>

          {extrasOptions(f.vehicleType).length > 0 && (
            <FormSection title="Besonderheiten">
              <ChipMulti options={extrasOptions(f.vehicleType)} selected={extras} onToggle={(v) => toggleArr(extras, setExtras, v)} />
            </FormSection>
          )}

          <FormSection title="Beschreibung">
            <TextField
              label="Beschreibung"
              value={f.vehicleDescription}
              onChangeText={(v) => set("vehicleDescription", v)}
              placeholder="Beschreiben Sie Ihr Fahrzeug…"
              multiline
            />
          </FormSection>

          <FormSection title="Fotos">
            <ImageGrid images={images} onChange={setImages} />
          </FormSection>

          <FormSection title="Kontakt & Standort">
            {mode === "dealer" && (
              <>
                <TextField label="Firmenname" value={f.companyName} onChangeText={(v) => set("companyName", v)} autoCapitalize="words" />
                <TextField label="Geschäfts-E-Mail" value={f.businessEmail} onChangeText={(v) => set("businessEmail", v)} keyboardType="email-address" />
              </>
            )}
            <TextField label="Telefon *" value={f.phoneNumber} onChangeText={(v) => set("phoneNumber", v)} keyboardType="phone-pad" placeholder="z. B. 079 123 45 67" />
            <TextField label="Adresse *" value={f.address} onChangeText={(v) => set("address", v)} placeholder="Strasse und Nummer" autoCapitalize="words" />
            <View style={styles.rowTwo}>
              <View style={{ flex: 1 }}>
                <TextField label="PLZ *" value={f.zipCode} onChangeText={(v) => set("zipCode", v)} keyboardType="number-pad" placeholder="8000" />
              </View>
              <View style={{ flex: 1.6 }}>
                <SelectField label="Ort *" searchable value={f.city} options={CITY_OPTS} onChange={(v) => set("city", v)} />
              </View>
            </View>
          </FormSection>
        </ScrollView>
      </KeyboardAvoidingView>

      <SafeAreaView edges={["bottom"]} style={[styles.footer, { borderTopColor: C.border }]}>
        <Button
          label={isEdit ? "Änderungen speichern" : "Entwurf erstellen"}
          onPress={submit}
          loading={submitting}
          size="lg"
          fullWidth
        />
      </SafeAreaView>
    </View>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  const C = useTheme();
  return (
    <View style={sStyles.section}>
      <Text style={[sStyles.sectionTitle, { color: C.foreground }]}>{title}</Text>
      <View style={{ gap: Spacing[4] }}>{children}</View>
    </View>
  );
}

function ChipMulti({ options, selected, onToggle }: { options: SelectOption[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <View style={sStyles.chipWrap}>
      {options.map((o) => (
        <Chip key={o.value} label={o.label} selected={selected.includes(o.value)} onPress={() => onToggle(o.value)} />
      ))}
    </View>
  );
}

const sStyles = StyleSheet.create({
  section: { marginTop: Spacing[6] },
  sectionTitle: { fontFamily: FontFamily.sansBold, fontSize: FontSize.md, letterSpacing: -0.3, marginBottom: Spacing[4] },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: Spacing[2] },
});

function createStyles(C: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: C.background },
    center: { alignItems: "center", justifyContent: "center" },
    header: {
      paddingBottom: Spacing[3],
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: Spacing[4],
    },
    headerBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
    headerTitle: { flex: 1, textAlign: "center", fontFamily: FontFamily.sansBold, fontSize: FontSize.md },
    body: { paddingHorizontal: Spacing[5], paddingBottom: Spacing[10] },
    rowTwo: { flexDirection: "row", gap: Spacing[3] },
    toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: Spacing[1] },
    toggleLabel: { fontFamily: FontFamily.sansMedium, fontSize: FontSize.base },
    footer: { paddingHorizontal: Spacing[5], paddingTop: Spacing[3], borderTopWidth: StyleSheet.hairlineWidth },
  });
}
