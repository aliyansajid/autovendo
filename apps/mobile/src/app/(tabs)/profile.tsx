import { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { FontFamily, FontSize, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useTabBarHeight } from "@/hooks/use-tab-bar-height";
import { useFavorites } from "@/lib/favorites";
import { authClient, useSession } from "@/lib/auth-client";
import { Icon, type IconName } from "@/components/ui/icon";
import { openUrl } from "@/lib/contact";

const WEB = "https://autovendo.ch";

type Row = { icon: IconName; label: string; value?: string; onPress: () => void };

function initials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function ProfileScreen() {
  const C = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const tabBarHeight = useTabBarHeight();
  const { ids } = useFavorites();
  const { data: session } = useSession();
  const user = session?.user;

  const onSell = () => {
    if (user) router.push("/sell");
    else router.push("/(auth)/login");
  };

  const signOut = () => {
    Alert.alert("Abmelden", "Möchten Sie sich wirklich abmelden?", [
      { text: "Abbrechen", style: "cancel" },
      { text: "Abmelden", style: "destructive", onPress: () => authClient.signOut() },
    ]);
  };

  const accountRows: Row[] = [
    {
      icon: "heart.fill",
      label: "Meine Favoriten",
      value: ids.length > 0 ? String(ids.length) : undefined,
      onPress: () => router.push("/favorites"),
    },
    user
      ? { icon: "tag.fill", label: "Verkaufen", onPress: onSell }
      : { icon: "person.crop.circle", label: "Anmelden / Registrieren", onPress: () => router.push("/(auth)/login") },
  ];

  const infoRows: Row[] = [
    { icon: "info.circle", label: "Über AutoVendo", onPress: () => openUrl(`${WEB}/de/about`) },
    { icon: "questionmark.circle", label: "Häufige Fragen", onPress: () => openUrl(`${WEB}/de/faq`) },
    { icon: "envelope", label: "Kontakt", onPress: () => openUrl(`${WEB}/de/contact`) },
  ];

  const legalRows: Row[] = [
    { icon: "doc.text", label: "Impressum", onPress: () => openUrl(`${WEB}/de/impressum`) },
    { icon: "lock.shield", label: "Datenschutz", onPress: () => openUrl(`${WEB}/de/datenschutz`) },
    { icon: "doc.plaintext", label: "AGB", onPress: () => openUrl(`${WEB}/de/agb`) },
  ];

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: tabBarHeight + Spacing[6] }}>
        <SafeAreaView edges={["top"]}>
          <Text style={[styles.heading, { color: C.foreground }]}>Profil</Text>
        </SafeAreaView>

        {/* Signed-in identity */}
        {user && (
          <View style={[styles.userCard, { backgroundColor: C.card, borderColor: C.border }]}>
            <View style={[styles.avatar, { backgroundColor: C.primary }]}>
              <Text style={[styles.avatarText, { color: C.primaryForeground }]}>{initials(user.name)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={[styles.userName, { color: C.foreground }]}>{user.name}</Text>
              <Text numberOfLines={1} style={[styles.userEmail, { color: C.mutedForeground }]}>{user.email}</Text>
            </View>
          </View>
        )}

        {/* Sell CTA */}
        <Pressable style={[styles.sellCard, { backgroundColor: C.primary }]} onPress={onSell}>
          <View style={styles.sellText}>
            <Text style={[styles.sellTitle, { color: C.primaryForeground }]}>Fahrzeug verkaufen</Text>
            <Text style={[styles.sellSub, { color: C.primaryForeground }]}>Als Privatperson oder Händler inserieren</Text>
          </View>
          <View style={styles.sellIcon}>
            <Icon name="arrow.right" size={20} color={C.primaryForeground} />
          </View>
        </Pressable>

        <Group title="Konto" rows={accountRows} />
        <Group title="Information" rows={infoRows} />
        <Group title="Rechtliches" rows={legalRows} />

        {user && (
          <Pressable style={styles.signOut} onPress={signOut}>
            <Icon name="rectangle.portrait.and.arrow.right" size={18} color={C.destructive} />
            <Text style={[styles.signOutText, { color: C.destructive }]}>Abmelden</Text>
          </Pressable>
        )}

        <Text style={[styles.version, { color: C.mutedForeground }]}>AutoVendo · Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

function Group({ title, rows }: { title: string; rows: Row[] }) {
  const C = useTheme();
  return (
    <View style={group.wrap}>
      <Text style={[group.title, { color: C.mutedForeground }]}>{title.toUpperCase()}</Text>
      <View style={[group.card, { backgroundColor: C.card, borderColor: C.border }]}>
        {rows.map((r, i) => (
          <Pressable
            key={r.label}
            style={[group.row, i < rows.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border }]}
            onPress={r.onPress}
          >
            <Icon name={r.icon} size={19} color={C.foreground} />
            <Text style={[group.label, { color: C.foreground }]}>{r.label}</Text>
            {r.value && <Text style={[group.value, { color: C.mutedForeground }]}>{r.value}</Text>}
            <Icon name="chevron.right" size={15} color={C.mutedForeground} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const group = StyleSheet.create({
  wrap: { paddingHorizontal: Spacing[5], marginTop: Spacing[6] },
  title: { fontFamily: FontFamily.sansSemiBold, fontSize: FontSize.xs, letterSpacing: 0.6, marginBottom: Spacing[2], marginLeft: Spacing[1] },
  card: { borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth * 2, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: Spacing[3], paddingHorizontal: Spacing[4], paddingVertical: Spacing[4] },
  label: { flex: 1, fontFamily: FontFamily.sansMedium, fontSize: FontSize.base },
  value: { fontFamily: FontFamily.sansMedium, fontSize: FontSize.sm },
});

function createStyles(C: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: C.background },
    heading: {
      fontFamily: FontFamily.sansBold,
      fontSize: FontSize.xl,
      letterSpacing: -0.5,
      paddingHorizontal: Spacing[5],
      paddingTop: Spacing[2],
      paddingBottom: Spacing[4],
    },
    userCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing[3],
      marginHorizontal: Spacing[5],
      marginBottom: Spacing[4],
      padding: Spacing[4],
      borderRadius: Radius.lg,
      borderWidth: StyleSheet.hairlineWidth * 2,
    },
    avatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
    avatarText: { fontFamily: FontFamily.sansBold, fontSize: FontSize.base, letterSpacing: 0.5 },
    userName: { fontFamily: FontFamily.sansBold, fontSize: FontSize.base },
    userEmail: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, marginTop: 1 },
    sellCard: { flexDirection: "row", alignItems: "center", marginHorizontal: Spacing[5], padding: Spacing[5], borderRadius: Radius.lg },
    sellText: { flex: 1 },
    sellTitle: { fontFamily: FontFamily.sansBold, fontSize: FontSize.md, letterSpacing: -0.3 },
    sellSub: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, marginTop: 2, opacity: 0.9 },
    sellIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },
    signOut: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: Spacing[2],
      marginTop: Spacing[8],
      marginHorizontal: Spacing[5],
      paddingVertical: Spacing[3],
    },
    signOutText: { fontFamily: FontFamily.sansSemiBold, fontSize: FontSize.base },
    version: { fontFamily: FontFamily.sans, fontSize: FontSize.xs, textAlign: "center", marginTop: Spacing[6] },
  });
}
