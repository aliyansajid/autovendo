import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { FontFamily, FontSize, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { authClient } from "@/lib/auth-client";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { AuthHeader, AuthError, SocialButtons } from "./_components";

export default function LoginScreen() {
  const C = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unverified, setUnverified] = useState(false);

  const canSubmit = email.length > 0 && password.length > 0;

  const handleLogin = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError(null);
    setUnverified(false);
    const { error: err } = await authClient.signIn.email({ email, password });
    setLoading(false);
    if (err) {
      if (err.code === "EMAIL_NOT_VERIFIED") {
        setUnverified(true);
        setError("Ihre E-Mail-Adresse ist noch nicht bestätigt.");
      } else {
        setError(err.message ?? "Anmeldung fehlgeschlagen. Bitte erneut versuchen.");
      }
      return;
    }
    router.replace("/(tabs)");
  };

  return (
    <View style={[styles.root, { backgroundColor: C.background }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <AuthHeader title="Willkommen zurück" subtitle="Melden Sie sich bei Ihrem AutoVendo-Konto an" />

            {error && <AuthError message={error} />}

            {unverified && (
              <Pressable
                style={[styles.resend, { borderColor: C.border }]}
                onPress={() => router.push({ pathname: "/(auth)/verify-email", params: { email } })}
              >
                <Text style={[styles.resendText, { color: C.primary }]}>
                  Bestätigungs-E-Mail erneut senden
                </Text>
              </Pressable>
            )}

            <View style={styles.form}>
              <TextField
                label="E-Mail"
                icon="envelope"
                placeholder="name@beispiel.ch"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                returnKeyType="next"
              />
              <TextField
                label="Passwort"
                icon="lock"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secure
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                rightLabel="Vergessen?"
                onRightLabelPress={() => router.push("/(auth)/forgot-password")}
              />

              <Button
                label="Anmelden"
                onPress={handleLogin}
                size="lg"
                fullWidth
                loading={loading}
                disabled={!canSubmit}
                style={{ marginTop: Spacing[2] }}
              />

              <SocialButtons onDone={() => router.replace("/(tabs)")} />
            </View>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: C.mutedForeground }]}>Noch kein Konto? </Text>
              <Pressable onPress={() => router.replace("/(auth)/register")} hitSlop={8}>
                <Text style={[styles.footerLink, { color: C.primary }]}>Registrieren</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <BackButton />
    </View>
  );
}

function BackButton() {
  const C = useTheme();
  return (
    <SafeAreaView edges={["top"]} style={styles.backWrap}>
      <Pressable style={[styles.backBtn, { backgroundColor: C.secondary }]} onPress={() => router.replace("/(tabs)")} hitSlop={8}>
        <Icon name="xmark" size={18} color={C.foreground} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing[6], paddingBottom: Spacing[8] },
  form: { gap: Spacing[4], marginTop: Spacing[2] },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: Spacing[8] },
  footerText: { fontFamily: FontFamily.sans, fontSize: FontSize.sm },
  footerLink: { fontFamily: FontFamily.sansSemiBold, fontSize: FontSize.sm },
  resend: {
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: Radius.md,
    paddingVertical: Spacing[3],
    alignItems: "center",
    marginBottom: Spacing[4],
  },
  resendText: { fontFamily: FontFamily.sansMedium, fontSize: FontSize.sm },
  backWrap: { position: "absolute", top: 0, right: Spacing[5] },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing[2],
  },
});
