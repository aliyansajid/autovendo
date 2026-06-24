import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { FontFamily, FontSize, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Icon } from "@/components/ui/icon";
import { GoogleIcon, AppleIcon } from "@/components/ui/brand-icons";

export function AuthHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const C = useTheme();
  return (
    <View style={styles.header}>
      <Text style={[styles.wordmark, { color: C.foreground }]}>
        Auto<Text style={{ color: C.primary }}>Vendo</Text>
      </Text>
      <Text style={[styles.title, { color: C.foreground }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: C.mutedForeground }]}>{subtitle}</Text>
    </View>
  );
}

export function AuthError({ message }: { message: string }) {
  const C = useTheme();
  return (
    <View style={[styles.errorBox, { backgroundColor: `${C.destructive}1A`, borderColor: `${C.destructive}55` }]}>
      <Icon name="exclamationmark.circle.fill" size={15} color={C.destructive} />
      <Text style={[styles.errorText, { color: C.destructive }]}>{message}</Text>
    </View>
  );
}

export function SocialButtons({ onDone }: { onDone: () => void }) {
  const C = useTheme();
  const [pending, setPending] = useState<"google" | "apple" | null>(null);

  const social = async (provider: "google" | "apple") => {
    if (pending) return;
    setPending(provider);
    try {
      const { error } = await authClient.signIn.social({ provider, callbackURL: "/(tabs)" });
      // On native, signIn.social does not navigate automatically.
      if (!error) onDone();
    } catch {
      // swallow — user cancelled or provider unavailable
    } finally {
      setPending(null);
    }
  };

  return (
    <View>
      <View style={styles.divider}>
        <View style={[styles.line, { backgroundColor: C.border }]} />
        <Text style={[styles.dividerText, { color: C.mutedForeground }]}>oder</Text>
        <View style={[styles.line, { backgroundColor: C.border }]} />
      </View>
      <View style={styles.socialRow}>
        <Button
          variant="secondary"
          label="Google"
          leftIcon={<GoogleIcon size={18} />}
          loading={pending === "google"}
          disabled={!!pending}
          onPress={() => social("google")}
          style={{ flex: 1 }}
        />
        <Button
          variant="secondary"
          label="Apple"
          leftIcon={<AppleIcon size={18} color={C.foreground} />}
          loading={pending === "apple"}
          disabled={!!pending}
          onPress={() => social("apple")}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: Spacing[10], paddingBottom: Spacing[6], gap: Spacing[1] },
  wordmark: { fontFamily: FontFamily.sansBold, fontSize: FontSize.md, letterSpacing: -0.4, marginBottom: Spacing[4] },
  title: { fontFamily: FontFamily.sansBold, fontSize: FontSize["2xl"], letterSpacing: -0.6 },
  subtitle: { fontFamily: FontFamily.sans, fontSize: FontSize.base, marginTop: 2 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[2],
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    marginBottom: Spacing[4],
  },
  errorText: { flex: 1, fontFamily: FontFamily.sans, fontSize: FontSize.sm },
  divider: { flexDirection: "row", alignItems: "center", gap: Spacing[3], marginVertical: Spacing[5] },
  line: { flex: 1, height: StyleSheet.hairlineWidth },
  dividerText: { fontFamily: FontFamily.sans, fontSize: FontSize.xs },
  socialRow: { flexDirection: "row", gap: Spacing[3] },
});
