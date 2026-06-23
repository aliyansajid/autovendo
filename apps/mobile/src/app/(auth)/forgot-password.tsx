import { useState } from "react";
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { FontFamily, FontSize, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { authClient } from "@/lib/auth-client";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { AuthHeader, AuthError } from "./_components";

const RESET_REDIRECT = "https://auth.autovendo.ch/de/reset-password";

export default function ForgotPasswordScreen() {
  const C = useTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email || loading) return;
    setLoading(true);
    setError(null);
    const { error: err } = await authClient.requestPasswordReset({ email, redirectTo: RESET_REDIRECT });
    setLoading(false);
    if (err) {
      setError(err.message ?? "Anfrage fehlgeschlagen. Bitte erneut versuchen.");
      return;
    }
    setSent(true);
  };

  return (
    <View style={[styles.root, { backgroundColor: C.background }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {sent ? (
              <View style={styles.sentBox}>
                <View style={[styles.iconTile, { backgroundColor: C.secondary }]}>
                  <Icon name="envelope.badge.fill" size={40} color={C.primary} />
                </View>
                <Text style={[styles.sentTitle, { color: C.foreground }]}>E-Mail gesendet</Text>
                <Text style={[styles.sentText, { color: C.mutedForeground }]}>
                  Falls ein Konto mit {email} existiert, haben wir einen Link zum Zurücksetzen des Passworts gesendet.
                </Text>
                <Button label="Zurück zur Anmeldung" onPress={() => router.replace("/(auth)/login")} size="lg" fullWidth style={{ marginTop: Spacing[6] }} />
              </View>
            ) : (
              <>
                <AuthHeader title="Passwort vergessen" subtitle="Wir senden Ihnen einen Link zum Zurücksetzen" />
                {error && <AuthError message={error} />}
                <View style={styles.form}>
                  <TextField
                    label="E-Mail"
                    icon="envelope"
                    placeholder="name@beispiel.ch"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                  />
                  <Button label="Link senden" onPress={handleSubmit} size="lg" fullWidth loading={loading} disabled={!email} style={{ marginTop: Spacing[2] }} />
                </View>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <SafeAreaView edges={["top"]} style={styles.backWrap}>
        <Pressable style={[styles.backBtn, { backgroundColor: C.secondary }]} onPress={() => router.back()} hitSlop={8}>
          <Icon name="chevron.left" size={18} color={C.foreground} />
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing[6], paddingBottom: Spacing[8] },
  form: { gap: Spacing[4], marginTop: Spacing[2] },
  sentBox: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: Spacing[16] },
  iconTile: { width: 96, height: 96, borderRadius: Radius.xl, alignItems: "center", justifyContent: "center", marginBottom: Spacing[5] },
  sentTitle: { fontFamily: FontFamily.sansBold, fontSize: FontSize.xl, letterSpacing: -0.4 },
  sentText: { fontFamily: FontFamily.sans, fontSize: FontSize.base, textAlign: "center", lineHeight: FontSize.base * 1.5, marginTop: Spacing[2], paddingHorizontal: Spacing[2] },
  backWrap: { position: "absolute", top: 0, left: Spacing[5] },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
});
