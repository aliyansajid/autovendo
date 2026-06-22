import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { FontFamily, FontSize, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { authClient } from "@/lib/auth-client";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";

export default function ChangePasswordScreen() {
  const C = useTheme();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real-time validation.
  const newPwError = next.length > 0 && next.length < 8 ? "Mindestens 8 Zeichen" : null;
  const confirmError = confirm.length > 0 && confirm !== next ? "Passwörter stimmen nicht überein" : null;
  const canSubmit = current.length > 0 && next.length >= 8 && next === confirm;

  const submit = async () => {
    setError(null);
    if (!current) return setError("Bitte geben Sie Ihr aktuelles Passwort ein.");
    if (next.length < 8) return setError("Das neue Passwort muss mindestens 8 Zeichen lang sein.");
    if (next !== confirm) return setError("Die Passwörter stimmen nicht überein.");
    setSaving(true);
    try {
      // Direct Better Auth call — verifies the current password and updates it.
      // The expo client attaches the session cookie automatically.
      const { error: err } = await authClient.changePassword({
        currentPassword: current,
        newPassword: next,
        revokeOtherSessions: true,
      });
      if (err) {
        setError(err.message ?? "Das Passwort konnte nicht geändert werden. Prüfen Sie Ihr aktuelles Passwort.");
        return;
      }
      Alert.alert("Passwort geändert", "Ihr Passwort wurde aktualisiert.", [{ text: "OK", onPress: () => router.back() }]);
    } catch {
      setError("Das Passwort konnte nicht geändert werden. Bitte versuchen Sie es erneut.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: C.background }]}>
      <SafeAreaView edges={["top"]} style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.back}>
          <Icon name="chevron.left" size={22} color={C.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: C.foreground }]}>Passwort ändern</Text>
        <View style={styles.back} />
      </SafeAreaView>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {error && <Text style={[styles.error, { color: C.destructive }]}>{error}</Text>}
          <TextField label="Aktuelles Passwort" value={current} onChangeText={setCurrent} secure icon="lock" placeholder="••••••••" editable={!saving} />
          <TextField label="Neues Passwort" value={next} onChangeText={setNext} secure icon="lock.rotation" placeholder="••••••••" error={newPwError} editable={!saving} />
          <TextField label="Neues Passwort bestätigen" value={confirm} onChangeText={setConfirm} secure icon="lock.rotation" placeholder="••••••••" error={confirmError} onSubmitEditing={() => canSubmit && submit()} returnKeyType="done" editable={!saving} />
          <Button label="Passwort speichern" onPress={submit} loading={saving} disabled={!canSubmit} size="lg" fullWidth style={{ marginTop: Spacing[3] }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
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
  body: { paddingHorizontal: Spacing[5], paddingTop: Spacing[3], gap: Spacing[4] },
  error: { fontFamily: FontFamily.sans, fontSize: FontSize.sm },
});
