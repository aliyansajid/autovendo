import { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { FontFamily, FontSize, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { authClient } from "@/lib/auth-client";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

export default function VerifyEmailScreen() {
  const C = useTheme();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const resend = async () => {
    if (!email || resending) return;
    setResending(true);
    try {
      await authClient.sendVerificationEmail({ email });
      setResent(true);
    } catch {
      // ignore
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: C.background }]}>
      <SafeAreaView style={styles.container}>
        <View style={[styles.iconTile, { backgroundColor: C.secondary }]}>
          <Icon name="envelope.badge.fill" size={44} color={C.primary} />
        </View>
        <Text style={[styles.title, { color: C.foreground }]}>Bestätigen Sie Ihre E-Mail</Text>
        <Text style={[styles.text, { color: C.mutedForeground }]}>
          Wir haben einen Bestätigungslink an{email ? ` ${email}` : " Ihre E-Mail-Adresse"} gesendet. Öffnen Sie
          die E-Mail und bestätigen Sie Ihr Konto, um sich anzumelden.
        </Text>

        {resent && (
          <View style={[styles.resentChip, { backgroundColor: C.secondary }]}>
            <Icon name="checkmark.circle.fill" size={15} color={C.primary} />
            <Text style={[styles.resentText, { color: C.foreground }]}>E-Mail erneut gesendet</Text>
          </View>
        )}

        <View style={styles.actions}>
          <Button label="Zur Anmeldung" onPress={() => router.replace("/(auth)/login")} size="lg" fullWidth />
          {email && (
            <Pressable onPress={resend} hitSlop={8} style={styles.resendLink} disabled={resending}>
              <Text style={[styles.resendLinkText, { color: C.primary }]}>
                {resending ? "Wird gesendet…" : "E-Mail erneut senden"}
              </Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: Spacing[6] },
  iconTile: { width: 104, height: 104, borderRadius: Radius.xl, alignItems: "center", justifyContent: "center", marginBottom: Spacing[6] },
  title: { fontFamily: FontFamily.sansBold, fontSize: FontSize.xl, letterSpacing: -0.5, textAlign: "center" },
  text: { fontFamily: FontFamily.sans, fontSize: FontSize.base, textAlign: "center", lineHeight: FontSize.base * 1.55, marginTop: Spacing[3] },
  resentChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[2],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: Radius.full,
    marginTop: Spacing[5],
  },
  resentText: { fontFamily: FontFamily.sansMedium, fontSize: FontSize.sm },
  actions: { alignSelf: "stretch", marginTop: Spacing[8], gap: Spacing[4], alignItems: "center" },
  resendLink: { paddingVertical: Spacing[1] },
  resendLinkText: { fontFamily: FontFamily.sansMedium, fontSize: FontSize.sm },
});
