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
  carBodyTypeEnum, utilityBodyTypeEnum, truckBodyTypeEnum, camperBodyTypeEnum,
  carFuelTypeEnum, utilityFuelTypeEnum, truckFuelTypeEnum, camperFuelTypeEnum,
  carExtrasEnum, utilityExtrasEnum, truckExtrasEnum, camperExtrasEnum,
  ColorEnum, VehicleConditionEnum, TransmissionTypeEnum, DriveTypeEnum, EquipmentEnum,
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
  uploadVehicleImages,
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
  return groups.flatMap((g) => g.items.map((i) => ({ value: i.value, label: i.label })));
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
    setF((prev) => ({ ...prev, vehicleType: vt, make: "", bodyType: "", fuelType: "" }));
    setExtras([]);
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
      // 1) Upload new images, preserve order, keep existing keys.
      const localImgs = images.filter((i): i is Extract<FormImage, { kind: "local" }> => i.kind === "local");
      const uploadedKeys = localImgs.length ? await uploadVehicleImages(localImgs.map((i) => ({ uri: i.uri, name: i.name, mime: i.mime }))) : [];
      let u = 0;
      const imageKeys = images.map((img) => (img.kind === "remote" ? img.key : uploadedKeys[u++]));

      // 2) Build payload (omit empty optional fields — the API rejects "" for enums/numbers).
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
        images: imageKeys,
        phoneNumber: f.phoneNumber.trim(),
        address: f.address.trim(),
        zipCode: f.zipCode.trim(),
        city: f.city,
      };
      const optStr: (keyof FormState)[] = ["model", "version", "fuelType", "transmissionType", "driveType", "vehicleCondition", "interiorColor", "vin", "vehicleDescription", "companyName", "businessEmail"];
      for (const k of optStr) if (f[k] && String(f[k]).trim()) payload[k] = f[k];
      const optNum: (keyof FormState)[] = ["newPrice", "doors", "seats", "hp", "kw", "cubicCapacity"];
      for (const k of optNum) {
        const n = numOrUndef(String(f[k]));
        if (n != null) payload[k] = n;
      }
      if (equipment.length) payload.equipment = Object.fromEntries(equipment.map((k) => [k, true]));
      if (extras.length) payload.extras = Object.fromEntries(extras.map((k) => [k, true]));

      // 3) Create or update.
      if (mode === "dealer") {
        if (vehicleId) await updateDealerVehicle(vehicleId, payload);
        else await createDealerVehicle(payload);
      } else {
        // Ensure the private seller's profile row exists (a fresh in-app signup
        // has none, and createVehicle requires it). Upsert is idempotent.
        await updateSellerProfile({
          phoneNumber: f.phoneNumber.trim(),
          streetAddress: f.address.trim(),
          zipCode: f.zipCode.trim(),
          city: f.city,
        });
        if (vehicleId) await updateSellerVehicle(vehicleId, payload);
        else await createSellerVehicle(payload);
      }

      Alert.alert(isEdit ? "Gespeichert" : "Inserat erstellt", isEdit ? "Ihre Änderungen wurden gespeichert." : "Ihr Entwurf wurde erstellt. Veröffentlichen Sie ihn im Dashboard.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Fehler", "Das Inserat konnte nicht gespeichert werden. Bitte prüfen Sie Ihre Angaben.");
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

  const isElectric = f.fuelType === "ELECTRIC" || f.fuelType.includes("HEV") || f.fuelType.includes("PHEV");
  void isElectric;

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
            <SelectField label="Marke" required searchable value={f.make} options={makeOptions(f.vehicleType)} onChange={(v) => set("make", v)} />
            <TextField label="Modell" value={f.model} onChangeText={(v) => set("model", v)} placeholder="z. B. A4" autoCapitalize="words" />
            <TextField label="Version" value={f.version} onChangeText={(v) => set("version", v)} placeholder="z. B. 2.0 TDI quattro" />
            <SelectField label="Aufbau" required searchable value={f.bodyType} options={bodyOptions(f.vehicleType)} onChange={(v) => set("bodyType", v)} />
            <SelectField label="Zustand" optional value={f.vehicleCondition} options={CONDITION_OPTS} onChange={(v) => set("vehicleCondition", v)} />
          </FormSection>

          <FormSection title="Eckdaten">
            <SelectField label="Monat (Erstzulassung)" required value={f.registrationMonth} options={MONTH_OPTS} onChange={(v) => set("registrationMonth", v)} />
            <TextField label="Jahr (Erstzulassung) *" value={f.registrationYear} onChangeText={(v) => set("registrationYear", v)} keyboardType="number-pad" placeholder="z. B. 2020" />
            <TextField label="Kilometerstand *" value={f.kilometer} onChangeText={(v) => set("kilometer", v)} keyboardType="number-pad" placeholder="z. B. 84500" />
            <SelectField label="Treibstoff" optional searchable value={f.fuelType} options={fuelOptions(f.vehicleType)} onChange={(v) => set("fuelType", v)} />
            <SelectField label="Getriebe" optional value={f.transmissionType} options={TRANSMISSION_OPTS} onChange={(v) => set("transmissionType", v)} />
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
            <TextField label="Hubraum (cm³)" value={f.cubicCapacity} onChangeText={(v) => set("cubicCapacity", v)} keyboardType="number-pad" placeholder="z. B. 1968" />
            <TextField label="Fahrgestellnummer (VIN)" value={f.vin} onChangeText={(v) => set("vin", v.toUpperCase())} placeholder="17 Zeichen" autoCapitalize="characters" />
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
