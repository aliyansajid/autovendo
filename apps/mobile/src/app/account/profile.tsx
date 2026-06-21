import { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Switch, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { swissCities } from "@repo/vehicle-constants";
import { FontFamily, FontSize, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { SelectField, type SelectOption } from "@/components/form/select-field";
import {
  fetchMe, isDealer,
  fetchSellerProfile, updateSellerProfile,
  fetchDealerProfile, updateDealerProfile,
} from "@/lib/account";

const CITY_OPTS: SelectOption[] = (swissCities as { value: string; label: string }[]).map((c) => ({ value: c.value, label: c.label }));

const DAYS: { key: string; label: string }[] = [
  { key: "MONDAY", label: "Montag" },
  { key: "TUESDAY", label: "Dienstag" },
  { key: "WEDNESDAY", label: "Mittwoch" },
  { key: "THURSDAY", label: "Donnerstag" },
  { key: "FRIDAY", label: "Freitag" },
  { key: "SATURDAY", label: "Samstag" },
  { key: "SUNDAY", label: "Sonntag" },
];

type Hours = Record<string, { isOpen: boolean; open: string; close: string }>;

function hhmm(t: string | null): string {
  if (!t) return "";
  const m = t.match(/(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : "";
}

export default function EditProfileScreen() {
  const C = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const [dealer, setDealer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // shared
  const [phoneNumber, setPhone] = useState("");
  const [streetAddress, setAddress] = useState("");
  const [zipCode, setZip] = useState("");
  const [city, setCity] = useState("");
  // dealer-only
  const [companyName, setCompany] = useState("");
  const [contactPerson, setContact] = useState("");
  const [businessEmail, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState<Hours>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await fetchMe();
        const isD = isDealer(me);
        if (!mounted) return;
        setDealer(isD);
        if (isD) {
          const p = await fetchDealerProfile();
          if (!mounted) return;
          setCompany(p.companyName ?? "");
          setContact(p.contactPerson ?? "");
          setPhone(p.phoneNumber ?? "");
          setEmail(p.businessEmail ?? "");
          setWebsite(p.website ?? "");
          setDescription(p.description ?? "");
          setAddress(p.streetAddress ?? "");
          setZip(p.zipCode ?? "");
          setCity(p.city ?? "");
          const h: Hours = {};
          for (const d of DAYS) {
            const found = p.openingHours?.find((o) => o.day === d.key);
            h[d.key] = { isOpen: found?.isOpen ?? false, open: hhmm(found?.openTime ?? null), close: hhmm(found?.closeTime ?? null) };
          }
          setHours(h);
        } else {
          const p = await fetchSellerProfile();
          if (!mounted) return;
          setPhone(p.phoneNumber ?? "");
          setAddress(p.streetAddress ?? "");
          setZip(p.zipCode ?? "");
          setCity(p.city ?? "");
        }
      } catch {
        Alert.alert("Fehler", "Profil konnte nicht geladen werden.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const setHour = (day: string, patch: Partial<{ isOpen: boolean; open: string; close: string }>) =>
    setHours((h) => ({ ...h, [day]: { ...h[day], ...patch } }));

  const save = async () => {
    if (!/^\d{4}$/.test(zipCode.trim())) return Alert.alert("Fehler", "Bitte geben Sie eine gültige PLZ an.");
    if (!city) return Alert.alert("Fehler", "Bitte wählen Sie einen Ort.");
    setSaving(true);
    try {
      if (dealer) {
        await updateDealerProfile({
          companyName: companyName.trim(),
          contactPerson: contactPerson.trim(),
          phoneNumber: phoneNumber.trim(),
          businessEmail: businessEmail.trim(),
          website: website.trim() || null,
          description: description.trim() || null,
          streetAddress: streetAddress.trim(),
          zipCode: zipCode.trim(),
          city,
          openingHours: DAYS.map((d) => ({
            day: d.key,
            isOpen: hours[d.key]?.isOpen ?? false,
            openTime: hours[d.key]?.isOpen ? hours[d.key]?.open || null : null,
            closeTime: hours[d.key]?.isOpen ? hours[d.key]?.close || null : null,
          })),
        });
      } else {
        await updateSellerProfile({ phoneNumber: phoneNumber.trim(), streetAddress: streetAddress.trim(), zipCode: zipCode.trim(), city });
      }
      Alert.alert("Gespeichert", "Ihr Profil wurde aktualisiert.", [{ text: "OK", onPress: () => router.back() }]);
    } catch {
      Alert.alert("Fehler", "Profil konnte nicht gespeichert werden. Bitte prüfen Sie Ihre Angaben.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator color={C.mutedForeground} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]} style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.back}>
          <Icon name="chevron.left" size={22} color={C.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: C.foreground }]}>Profil bearbeiten</Text>
        <View style={styles.back} />
      </SafeAreaView>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {dealer && (
            <>
              <Text style={[styles.section, { color: C.foreground }]}>Firma</Text>
              <View style={{ gap: Spacing[4] }}>
                <TextField label="Firmenname" value={companyName} onChangeText={setCompany} autoCapitalize="words" />
                <TextField label="Kontaktperson" value={contactPerson} onChangeText={setContact} autoCapitalize="words" />
                <TextField label="Geschäfts-E-Mail" value={businessEmail} onChangeText={setEmail} keyboardType="email-address" />
                <TextField label="Website" value={website} onChangeText={setWebsite} keyboardType="url" placeholder="https://" />
                <TextField label="Beschreibung" value={description} onChangeText={setDescription} multiline placeholder="Über Ihr Unternehmen…" />
              </View>
            </>
          )}

          <Text style={[styles.section, { color: C.foreground, marginTop: dealer ? Spacing[6] : 0 }]}>Kontakt & Standort</Text>
          <View style={{ gap: Spacing[4] }}>
            <TextField label="Telefon" value={phoneNumber} onChangeText={setPhone} keyboardType="phone-pad" placeholder="z. B. 079 123 45 67" />
            <TextField label="Adresse" value={streetAddress} onChangeText={setAddress} autoCapitalize="words" placeholder="Strasse und Nummer" />
            <View style={styles.rowTwo}>
              <View style={{ flex: 1 }}>
                <TextField label="PLZ" value={zipCode} onChangeText={setZip} keyboardType="number-pad" placeholder="8000" />
              </View>
              <View style={{ flex: 1.6 }}>
                <SelectField label="Ort" searchable value={city} options={CITY_OPTS} onChange={setCity} />
              </View>
            </View>
          </View>

          {dealer && (
            <>
              <Text style={[styles.section, { color: C.foreground, marginTop: Spacing[6] }]}>Öffnungszeiten</Text>
              <View style={[styles.hoursCard, { borderColor: C.border }]}>
                {DAYS.map((d, i) => {
                  const h = hours[d.key] ?? { isOpen: false, open: "", close: "" };
                  return (
                    <View key={d.key} style={[styles.dayRow, i < DAYS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border }]}>
                      <View style={styles.dayTop}>
                        <Text style={[styles.dayLabel, { color: C.foreground }]}>{d.label}</Text>
                        <Switch value={h.isOpen} onValueChange={(v) => setHour(d.key, { isOpen: v })} trackColor={{ true: C.primary, false: C.border }} />
                      </View>
                      {h.isOpen && (
                        <View style={styles.timeRow}>
                          <TextInput
                            style={[styles.timeInput, { backgroundColor: C.secondary, color: C.foreground }]}
                            placeholder="08:00" placeholderTextColor={C.mutedForeground}
                            value={h.open} onChangeText={(t) => setHour(d.key, { open: t })}
                          />
                          <Text style={[styles.dash, { color: C.mutedForeground }]}>–</Text>
                          <TextInput
                            style={[styles.timeInput, { backgroundColor: C.secondary, color: C.foreground }]}
                            placeholder="18:00" placeholderTextColor={C.mutedForeground}
                            value={h.close} onChangeText={(t) => setHour(d.key, { close: t })}
                          />
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </>
          )}

          <Button label="Speichern" onPress={save} loading={saving} size="lg" fullWidth style={{ marginTop: Spacing[6] }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function createStyles(C: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: C.background },
    center: { alignItems: "center", justifyContent: "center" },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: Spacing[4],
      paddingTop: Spacing[2],
      paddingBottom: Spacing[3],
    },
    back: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
    title: { fontFamily: FontFamily.sansBold, fontSize: FontSize.lg, letterSpacing: -0.4 },
    body: { paddingHorizontal: Spacing[5], paddingTop: Spacing[3], paddingBottom: Spacing[10] },
    section: { fontFamily: FontFamily.sansBold, fontSize: FontSize.md, letterSpacing: -0.3, marginBottom: Spacing[4] },
    rowTwo: { flexDirection: "row", gap: Spacing[3] },
    hoursCard: { borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, overflow: "hidden" },
    dayRow: { padding: Spacing[4], gap: Spacing[3] },
    dayTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    dayLabel: { fontFamily: FontFamily.sansMedium, fontSize: FontSize.base },
    timeRow: { flexDirection: "row", alignItems: "center", gap: Spacing[3] },
    timeInput: { flex: 1, height: 44, borderRadius: Radius.md, paddingHorizontal: Spacing[3], fontFamily: FontFamily.sans, fontSize: FontSize.base, textAlign: "center" },
    dash: { fontFamily: FontFamily.sans, fontSize: FontSize.base },
  });
}
