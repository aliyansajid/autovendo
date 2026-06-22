import { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Switch, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { swissCities } from "@repo/vehicle-constants";
import { FontFamily, FontSize, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useSession } from "@/lib/auth-client";
import { imageUrl } from "@/lib/image";
import { pickSingleImage } from "@/lib/image-picker";
import { validate, fieldError, isAcceptedImage } from "@/lib/validation";
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
type Picked = { uri: string; name: string; mime: string };
type ImageSlot = { current: string | null; picked: Picked | null };

// Stable snapshot of all editable text fields — used for the dirty check.
type Snap = {
  name: string; email: string; phone: string; address: string; zip: string; city: string;
  company: string; contact: string; bizEmail: string; website: string; description: string; uid: string;
  hours: Hours;
};
const snap = (s: Snap): string => JSON.stringify(s);

function hhmm(t: string | null): string {
  if (!t) return "";
  const m = t.match(/(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : "";
}
function slotUri(s: ImageSlot): string | null {
  return s.picked ? s.picked.uri : imageUrl(s.current);
}

export default function EditProfileScreen() {
  const C = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const { data: session } = useSession();
  const [dealer, setDealer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // identity (Better Auth user table)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState<ImageSlot>({ current: null, picked: null });
  const [initial, setInitial] = useState({ name: "", email: "" });
  const [initialSnap, setInitialSnap] = useState("");

  // contact (both)
  const [phoneNumber, setPhone] = useState("");
  const [streetAddress, setAddress] = useState("");
  const [zipCode, setZip] = useState("");
  const [city, setCity] = useState("");

  // dealer business (Dealer table)
  const [companyName, setCompany] = useState("");
  const [contactPerson, setContact] = useState("");
  const [businessEmail, setBizEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [uidNumber, setUid] = useState("");
  const [logo, setLogo] = useState<ImageSlot>({ current: null, picked: null });
  const [cover, setCover] = useState<ImageSlot>({ current: null, picked: null });
  const [hours, setHours] = useState<Hours>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const u = session?.user;
        if (u) {
          setName(u.name ?? "");
          setEmail(u.email ?? "");
          setAvatar({ current: u.image ?? null, picked: null });
          setInitial({ name: u.name ?? "", email: u.email ?? "" });
        }

        const me = await fetchMe();
        const isD = isDealer(me);
        if (!mounted) return;
        setDealer(isD);

        if (isD) {
          const p = await fetchDealerProfile();
          if (!mounted) return;
          setCompany(p.companyName ?? "");
          setContact(p.contactPerson ?? "");
          setBizEmail(p.businessEmail ?? "");
          setWebsite(p.website ?? "");
          setDescription(p.description ?? "");
          setUid(p.uidNumber ?? "");
          setLogo({ current: p.logo ?? null, picked: null });
          setCover({ current: p.coverImage ?? null, picked: null });
          setPhone(p.phoneNumber ?? "");
          setAddress(p.streetAddress ?? "");
          setZip(p.zipCode ?? "");
          setCity(p.city ?? "");
          const h: Hours = {};
          for (const d of DAYS) {
            const found = p.openingHours?.find((o) => o.day === d.key);
            h[d.key] = { isOpen: found?.isOpen ?? false, open: hhmm(found?.openTime ?? null), close: hhmm(found?.closeTime ?? null) };
          }
          setHours(h);
          setInitialSnap(snap({
            name: u?.name ?? "", email: u?.email ?? "", phone: p.phoneNumber ?? "", address: p.streetAddress ?? "",
            zip: p.zipCode ?? "", city: p.city ?? "", company: p.companyName ?? "", contact: p.contactPerson ?? "",
            bizEmail: p.businessEmail ?? "", website: p.website ?? "", description: p.description ?? "", uid: p.uidNumber ?? "", hours: h,
          }));
        } else {
          const p = await fetchSellerProfile();
          if (!mounted) return;
          setPhone(p.phoneNumber ?? "");
          setAddress(p.streetAddress ?? "");
          setZip(p.zipCode ?? "");
          setCity(p.city ?? "");
          setInitialSnap(snap({
            name: u?.name ?? "", email: u?.email ?? "", phone: p.phoneNumber ?? "", address: p.streetAddress ?? "",
            zip: p.zipCode ?? "", city: p.city ?? "", company: "", contact: "", bizEmail: "", website: "", description: "", uid: "", hours: {},
          }));
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
  }, [session]);

  const setHour = (day: string, patch: Partial<{ isOpen: boolean; open: string; close: string }>) =>
    setHours((h) => ({ ...h, [day]: { ...h[day], ...patch } }));

  const pickInto = async (setter: (s: ImageSlot) => void) => {
    const img = await pickSingleImage();
    if (!img) return;
    if (!isAcceptedImage(img.mime)) {
      Alert.alert("Ungültiges Bild", "Nur PNG-, JPG-, JPEG- oder WEBP-Bilder sind erlaubt.");
      return;
    }
    setter({ current: null, picked: img });
  };

  // Field validation — mirrors the server Zod rules (see lib/validation.ts).
  const errs = {
    name: validate.name(name),
    email: validate.email(email),
    phone: validate.phone(phoneNumber),
    address: validate.address(streetAddress),
    zip: validate.zip(zipCode),
    city: validate.city(city),
    company: dealer ? validate.companyName(companyName) : null,
    contact: dealer ? validate.contactPerson(contactPerson) : null,
    bizEmail: dealer ? validate.businessEmail(businessEmail) : null,
    uid: dealer ? validate.uid(uidNumber) : null,
    website: dealer ? validate.websiteOptional(website) : null,
    description: dealer ? validate.descriptionOptional(description) : null,
  };
  const valid = Object.values(errs).every((e) => !e);

  // Dirty check — enable the button only when something actually changed.
  const currentSnap = snap({
    name, email, phone: phoneNumber, address: streetAddress, zip: zipCode, city,
    company: companyName, contact: contactPerson, bizEmail: businessEmail, website, description, uid: uidNumber, hours,
  });
  const dirty = currentSnap !== initialSnap || !!avatar.picked || !!logo.picked || !!cover.picked;
  const canSave = valid && dirty;

  const save = async () => {
    setSubmitted(true);
    if (!canSave) return;
    setSaving(true);
    try {
      const nameChanged = name.trim() !== initial.name;
      const emailChanged = !!email.trim() && email.trim() !== initial.email;

      // Single call per role — the API uploads any images, writes the DB rows,
      // and proxies the email change to Better Auth. The client only sends data.
      if (dealer) {
        await updateDealerProfile({
          name: nameChanged ? name.trim() : undefined,
          email: emailChanged ? email.trim() : undefined,
          avatar: avatar.picked ?? undefined,
          companyName: companyName.trim(),
          contactPerson: contactPerson.trim(),
          businessEmail: businessEmail.trim(),
          website: website.trim() || null,
          description: description.trim() || null,
          uidNumber: uidNumber.trim() || undefined,
          // New file → upload; otherwise keep the existing URL.
          logo: logo.picked ?? logo.current,
          coverImage: cover.picked ?? cover.current,
          phoneNumber: phoneNumber.trim(),
          streetAddress: streetAddress.trim(),
          zipCode: zipCode.trim(),
          city,
          country: "Switzerland",
          openingHours: DAYS.map((d) => ({
            day: d.key,
            isOpen: hours[d.key]?.isOpen ?? false,
            openTime: hours[d.key]?.isOpen ? hours[d.key]?.open || null : null,
            closeTime: hours[d.key]?.isOpen ? hours[d.key]?.close || null : null,
          })),
        });
      } else {
        await updateSellerProfile({
          name: nameChanged ? name.trim() : undefined,
          email: emailChanged ? email.trim() : undefined,
          phoneNumber: phoneNumber.trim(),
          streetAddress: streetAddress.trim(),
          zipCode: zipCode.trim(),
          city,
        });
      }

      Alert.alert(
        "Gespeichert",
        emailChanged
          ? "Ihr Profil wurde aktualisiert. Bitte bestätigen Sie die E-Mail-Änderung über den Link in Ihrem Postfach."
          : "Ihr Profil wurde aktualisiert.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (e) {
      // Surface the API's message (same as web's toast) when there is one.
      const message = e instanceof Error && e.message && !e.message.startsWith("request_failed")
        ? e.message
        : "Profil konnte nicht gespeichert werden. Bitte prüfen Sie Ihre Angaben.";
      Alert.alert("Fehler", message);
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

  const avatarUri = slotUri(avatar);
  const logoUri = slotUri(logo);
  const coverUri = slotUri(cover);

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]} style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.back}>
            <Icon name="chevron.left" size={22} color={C.foreground} />
          </Pressable>
          <Text style={[styles.title, { color: C.foreground }]} numberOfLines={1}>Profil bearbeiten</Text>
          <View style={styles.back} />
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Account identity */}
          <Text style={[styles.section, { color: C.foreground }]}>Konto</Text>
          {dealer && (
            <View style={styles.avatarRow}>
              <View style={[styles.avatar, { backgroundColor: C.secondary }]}>
                {avatarUri ? <Image source={{ uri: avatarUri }} style={styles.avatarImg} contentFit="cover" /> : <Icon name="person.fill" size={28} color={C.mutedForeground} />}
              </View>
              <Pressable onPress={() => pickInto(setAvatar)} hitSlop={6} disabled={saving}>
                <Text style={[styles.link, { color: C.primary, opacity: saving ? 0.5 : 1 }]}>Foto ändern</Text>
              </Pressable>
            </View>
          )}
          <View style={{ gap: Spacing[4] }}>
            <TextField label="Name" value={name} onChangeText={setName} autoCapitalize="words" error={fieldError(name, errs.name, submitted)} editable={!saving} />
            <TextField label="E-Mail" value={email} onChangeText={setEmail} keyboardType="email-address" error={fieldError(email, errs.email, submitted)} editable={!saving} />
            {email.trim() !== initial.email && !errs.email && (
              <Text style={[styles.hint, { color: C.mutedForeground }]}>
                Eine Bestätigung wird an Ihre aktuelle E-Mail-Adresse gesendet.
              </Text>
            )}
          </View>

          {dealer && (
            <>
              <Text style={[styles.section, { color: C.foreground, marginTop: Spacing[6] }]}>Firma</Text>
              <View style={{ gap: Spacing[4] }}>
                <TextField label="Firmenname" value={companyName} onChangeText={setCompany} autoCapitalize="words" error={fieldError(companyName, errs.company, submitted)} editable={!saving} />
                <TextField label="Kontaktperson" value={contactPerson} onChangeText={setContact} autoCapitalize="words" error={fieldError(contactPerson, errs.contact, submitted)} editable={!saving} />
                <TextField label="Geschäfts-E-Mail" value={businessEmail} onChangeText={setBizEmail} keyboardType="email-address" error={fieldError(businessEmail, errs.bizEmail, submitted)} editable={!saving} />
                <TextField label="Website" value={website} onChangeText={setWebsite} keyboardType="url" placeholder="https://" error={fieldError(website, errs.website, submitted)} editable={!saving} />
                <TextField label="UID-Nummer" value={uidNumber} onChangeText={setUid} placeholder="CHE-123.456.789" autoCapitalize="characters" error={fieldError(uidNumber, errs.uid, submitted)} editable={!saving} />
                <TextField label="Beschreibung" value={description} onChangeText={setDescription} multiline placeholder="Über Ihr Unternehmen…" error={fieldError(description, errs.description, submitted)} editable={!saving} />
              </View>

              <Text style={[styles.section, { color: C.foreground, marginTop: Spacing[6] }]}>Branding</Text>
              <View style={styles.brandingRow}>
                <View style={styles.brandCol}>
                  <Text style={[styles.smallLabel, { color: C.mutedForeground }]}>Logo</Text>
                  <Pressable style={[styles.logoTile, { backgroundColor: C.secondary, borderColor: C.border, opacity: saving ? 0.5 : 1 }]} onPress={() => pickInto(setLogo)} disabled={saving}>
                    {logoUri ? <Image source={{ uri: logoUri }} style={styles.logoImg} contentFit="contain" /> : <Icon name="plus" size={22} color={C.mutedForeground} />}
                  </Pressable>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.smallLabel, { color: C.mutedForeground }]}>Titelbild</Text>
                  <Pressable style={[styles.coverTile, { backgroundColor: C.secondary, borderColor: C.border, opacity: saving ? 0.5 : 1 }]} onPress={() => pickInto(setCover)} disabled={saving}>
                    {coverUri ? <Image source={{ uri: coverUri }} style={styles.coverImg} contentFit="cover" /> : <Icon name="photo" size={22} color={C.mutedForeground} />}
                  </Pressable>
                </View>
              </View>
            </>
          )}

          {/* Contact & location */}
          <Text style={[styles.section, { color: C.foreground, marginTop: Spacing[6] }]}>Kontakt & Standort</Text>
          <View style={{ gap: Spacing[4] }}>
            <TextField label="Telefon" value={phoneNumber} onChangeText={setPhone} keyboardType="phone-pad" placeholder="z. B. 079 123 45 67" error={fieldError(phoneNumber, errs.phone, submitted)} editable={!saving} />
            <TextField label="Adresse" value={streetAddress} onChangeText={setAddress} autoCapitalize="words" placeholder="Strasse und Nummer" error={fieldError(streetAddress, errs.address, submitted)} editable={!saving} />
            <View style={styles.rowTwo}>
              <View style={{ flex: 1 }}>
                <TextField label="PLZ" value={zipCode} onChangeText={setZip} keyboardType="number-pad" placeholder="8000" error={fieldError(zipCode, errs.zip, submitted)} editable={!saving} />
              </View>
              <View style={{ flex: 1.6 }}>
                <SelectField label="Ort" searchable value={city} options={CITY_OPTS} onChange={setCity} error={fieldError(city, errs.city, submitted)} disabled={saving} />
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
                        <Switch value={h.isOpen} onValueChange={(v) => setHour(d.key, { isOpen: v })} trackColor={{ true: C.primary, false: C.border }} disabled={saving} />
                      </View>
                      {h.isOpen && (
                        <View style={styles.timeRow}>
                          <TextInput style={[styles.timeInput, { backgroundColor: C.secondary, color: C.foreground, opacity: saving ? 0.5 : 1 }]} placeholder="08:00" placeholderTextColor={C.mutedForeground} value={h.open} onChangeText={(t) => setHour(d.key, { open: t })} editable={!saving} />
                          <Text style={[styles.dash, { color: C.mutedForeground }]}>–</Text>
                          <TextInput style={[styles.timeInput, { backgroundColor: C.secondary, color: C.foreground, opacity: saving ? 0.5 : 1 }]} placeholder="18:00" placeholderTextColor={C.mutedForeground} value={h.close} onChangeText={(t) => setHour(d.key, { close: t })} editable={!saving} />
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </>
          )}

          <Button label="Speichern" onPress={save} loading={saving} disabled={!canSave} size="lg" fullWidth style={{ marginTop: Spacing[6] }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function createStyles(C: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: C.background },
    center: { alignItems: "center", justifyContent: "center" },
    header: { paddingBottom: Spacing[3], borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border },
    headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing[4] },
    back: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
    title: { flex: 1, textAlign: "center", fontFamily: FontFamily.sansBold, fontSize: FontSize.md },
    body: { paddingHorizontal: Spacing[5], paddingTop: Spacing[3], paddingBottom: Spacing[10] },
    section: { fontFamily: FontFamily.sansBold, fontSize: FontSize.md, letterSpacing: -0.3, marginBottom: Spacing[4] },
    hint: { fontFamily: FontFamily.sans, fontSize: FontSize.xs, marginTop: -Spacing[1] },
    avatarRow: { flexDirection: "row", alignItems: "center", gap: Spacing[4], marginBottom: Spacing[4] },
    avatar: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", overflow: "hidden" },
    avatarImg: { width: "100%", height: "100%" },
    link: { fontFamily: FontFamily.sansSemiBold, fontSize: FontSize.sm },
    smallLabel: { fontFamily: FontFamily.sansMedium, fontSize: FontSize.sm, marginBottom: Spacing[2] },
    brandingRow: { flexDirection: "row", gap: Spacing[4] },
    brandCol: { width: 96 },
    logoTile: { width: 96, height: 96, borderRadius: Radius.md, borderWidth: StyleSheet.hairlineWidth * 2, borderStyle: "dashed", alignItems: "center", justifyContent: "center", overflow: "hidden" },
    logoImg: { width: "100%", height: "100%" },
    coverTile: { flex: 1, height: 96, borderRadius: Radius.md, borderWidth: StyleSheet.hairlineWidth * 2, borderStyle: "dashed", alignItems: "center", justifyContent: "center", overflow: "hidden" },
    coverImg: { width: "100%", height: "100%" },
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
