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
import { FontFamily, FontSize, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { authClient } from "@/lib/auth-client";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { AuthHeader, AuthError, SocialButtons } from "./_components";

export default function RegisterScreen() {
  const C = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = name.trim().length > 0 && email.length > 0 && password.length >= 8;

  const handleRegister = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError(null);
    const { error: err } = await authClient.signUp.email({ name: name.trim(), email, password });
    setLoading(false);
    if (err) {
      setError(err.message ?? "Registrierung fehlgeschlagen. Bitte erneut versuchen.");
      return;
    }
    // Email verification is required server-side; guide the user to confirm.
    router.replace({ pathname: "/(auth)/verify-email", params: { email } });
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
            <AuthHeader title="Konto erstellen" subtitle="Inserieren und Favoriten speichern mit einem Konto" />

            {error && <AuthError message={error} />}

            <View style={styles.form}>
              <TextField
                label="Name"
                icon="person"
                placeholder="Max Muster"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                returnKeyType="next"
              />
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
                placeholder="Mindestens 8 Zeichen"
                value={password}
                onChangeText={setPassword}
                secure
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />

              <Button
                label="Konto erstellen"
                onPress={handleRegister}
                size="lg"
                fullWidth
                loading={loading}
                disabled={!canSubmit}
                style={{ marginTop: Spacing[2] }}
              />

              <SocialButtons onDone={() => router.replace("/(tabs)")} />
            </View>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: C.mutedForeground }]}>Bereits ein Konto? </Text>
              <Pressable onPress={() => router.replace("/(auth)/login")} hitSlop={8}>
                <Text style={[styles.footerLink, { color: C.primary }]}>Anmelden</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <SafeAreaView edges={["top"]} style={styles.backWrap}>
        <Pressable style={[styles.backBtn, { backgroundColor: C.secondary }]} onPress={() => router.replace("/(tabs)")} hitSlop={8}>
          <Icon name="xmark" size={18} color={C.foreground} />
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing[6], paddingBottom: Spacing[8] },
  form: { gap: Spacing[4], marginTop: Spacing[2] },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: Spacing[8] },
  footerText: { fontFamily: FontFamily.sans, fontSize: FontSize.sm },
  footerLink: { fontFamily: FontFamily.sansSemiBold, fontSize: FontSize.sm },
  backWrap: { position: "absolute", top: 0, right: Spacing[5] },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", marginTop: Spacing[2] },
});
