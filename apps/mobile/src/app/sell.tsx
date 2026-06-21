import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { FontFamily, FontSize, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Icon, type IconName } from "@/components/ui/icon";
import { fetchMe, isDealer } from "@/lib/account";
import { openUrl } from "@/lib/contact";

type Option = {
  key: "seller" | "dealer";
  icon: IconName;
  title: string;
  tagline: string;
  points: string[];
};

const OPTIONS: Option[] = [
  {
    key: "seller",
    icon: "person.fill",
    title: "Privatperson",
    tagline: "Einzelnes Fahrzeug verkaufen",
    points: ["Standard – CHF 19 / Monat", "Best Value – CHF 49 bis verkauft", "In wenigen Minuten inseriert"],
  },
  {
    key: "dealer",
    icon: "building.2.fill",
    title: "Händler",
    tagline: "Mehrere Fahrzeuge verwalten",
    points: ["Abo mit Fahrzeug-Kontingent", "Firmenprofil & Öffnungszeiten", "Anfragen zentral verwalten"],
  },
];

export default function SellScreen() {
  const C = useTheme();
  const [checking, setChecking] = useState(false);

  const choose = async (key: Option["key"]) => {
    if (key === "seller") {
      // Private selling is available to any signed-in user.
      router.push("/seller");
      return;
    }
    // Dealer area requires an existing dealer account (company/UID onboarding
    // happens on the web). Route dealers in; send others to web onboarding.
    if (checking) return;
    setChecking(true);
    try {
      const me = await fetchMe();
      if (isDealer(me)) {
        router.push("/dealer-dashboard");
      } else {
        Alert.alert(
          "Händler-Konto erforderlich",
          "Händler-Konten werden auf autovendo.ch eingerichtet. Möchten Sie die Registrierung öffnen?",
          [
            { text: "Abbrechen", style: "cancel" },
            { text: "Öffnen", onPress: () => openUrl("https://seller.autovendo.ch") },
          ],
        );
      }
    } catch {
      Alert.alert("Fehler", "Konto konnte nicht geprüft werden.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: C.background }]}>
      <SafeAreaView edges={["top"]} style={styles.header}>
        <Pressable style={[styles.back, { backgroundColor: C.secondary }]} onPress={() => router.back()} hitSlop={8}>
          <Icon name="chevron.left" size={20} color={C.foreground} />
        </Pressable>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: C.foreground }]}>Wie möchten Sie verkaufen?</Text>
        <Text style={[styles.subtitle, { color: C.mutedForeground }]}>
          Wählen Sie die passende Option für Ihr Inserat.
        </Text>

        <View style={styles.options}>
          {OPTIONS.map((o) => (
            <Pressable
              key={o.key}
              style={[styles.card, { backgroundColor: C.card, borderColor: C.border }]}
              onPress={() => choose(o.key)}
            >
              <View style={styles.cardHead}>
                <View style={[styles.iconTile, { backgroundColor: C.secondary }]}>
                  <Icon name={o.icon} size={24} color={C.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: C.foreground }]}>{o.title}</Text>
                  <Text style={[styles.cardTagline, { color: C.mutedForeground }]}>{o.tagline}</Text>
                </View>
                <Icon name="chevron.right" size={16} color={C.mutedForeground} />
              </View>
              <View style={[styles.points, { borderTopColor: C.border }]}>
                {o.points.map((p) => (
                  <View key={p} style={styles.point}>
                    <Icon name="checkmark.circle.fill" size={15} color={C.primary} />
                    <Text style={[styles.pointText, { color: C.secondaryForeground }]}>{p}</Text>
                  </View>
                ))}
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: Spacing[5], paddingTop: Spacing[2] },
  back: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  scroll: { paddingHorizontal: Spacing[5], paddingTop: Spacing[4], paddingBottom: Spacing[10] },
  title: { fontFamily: FontFamily.sansBold, fontSize: FontSize["2xl"], letterSpacing: -0.6 },
  subtitle: { fontFamily: FontFamily.sans, fontSize: FontSize.base, marginTop: Spacing[2], lineHeight: FontSize.base * 1.5 },
  options: { marginTop: Spacing[6], gap: Spacing[4] },
  card: { borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth * 2, overflow: "hidden" },
  cardHead: { flexDirection: "row", alignItems: "center", gap: Spacing[3], padding: Spacing[4] },
  iconTile: { width: 48, height: 48, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontFamily: FontFamily.sansBold, fontSize: FontSize.md, letterSpacing: -0.3 },
  cardTagline: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, marginTop: 1 },
  points: { borderTopWidth: StyleSheet.hairlineWidth * 2, paddingHorizontal: Spacing[4], paddingVertical: Spacing[3], gap: Spacing[2] },
  point: { flexDirection: "row", alignItems: "center", gap: Spacing[2] },
  pointText: { fontFamily: FontFamily.sans, fontSize: FontSize.sm },
});
