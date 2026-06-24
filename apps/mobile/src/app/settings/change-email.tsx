import { useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { FontFamily, FontSize, Spacing, Radius, type ThemeColors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';

const appUrl = process.env.EXPO_PUBLIC_APP_URL ?? 'https://autovendo.ch';

export default function ChangeEmailScreen() {
  const C = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);

  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!newEmail.trim()) return;
    setLoading(true);
    try {
      const { error } = await authClient.changeEmail({
        newEmail: newEmail.trim(),
        callbackURL: `${appUrl}/auth/confirm-email-change`,
      });
      if (error) {
        Alert.alert('Error', 'Something went wrong. Please try again.');
      } else {
        setSent(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <SymbolView name="chevron.left" size={20} tintColor={C.foreground} />
          </Pressable>
          <Text style={styles.title}>Change Email</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {sent ? (
            <View style={styles.successWrap}>
              <View style={styles.successIcon}>
                <SymbolView name="envelope.badge.fill" size={40} tintColor={C.sidebarPrimary} />
              </View>
              <Text style={styles.successTitle}>Check your inbox</Text>
              <Text style={styles.successBody}>
                We sent a confirmation link to {newEmail}. Click it to confirm your new email address.
              </Text>
              <Button size="lg" fullWidth label="Done" onPress={() => router.back()} />
            </View>
          ) : (
            <>
              <Text style={styles.description}>
                Enter your new email address. We'll send a confirmation link to verify it before making the change.
              </Text>

              <View style={styles.form}>
                <TextField
                  label="New Email Address"
                  icon="envelope"
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  value={newEmail}
                  onChangeText={setNewEmail}
                />

                <Button
                  size="lg"
                  fullWidth
                  label="Send Confirmation"
                  loading={loading}
                  disabled={!newEmail.trim()}
                  onPress={handleSubmit}
                />
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(C: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing[4],
      paddingVertical: Spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: C.secondary,
    },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    title: {
      fontFamily: FontFamily.sansSemiBold,
      fontSize: FontSize.md,
      color: C.foreground,
    },
    content: {
      paddingHorizontal: Spacing[6],
      paddingTop: Spacing[6],
      gap: Spacing[6],
    },
    description: {
      fontFamily: FontFamily.sans,
      fontSize: FontSize.base,
      color: C.mutedForeground,
      lineHeight: FontSize.base * 1.6,
    },
    form: { gap: Spacing[5] },
    // Success state
    successWrap: {
      alignItems: 'center',
      gap: Spacing[4],
      paddingTop: Spacing[10],
    },
    successIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: `${C.primary}22`,
      borderWidth: 1,
      borderColor: `${C.primary}40`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    successTitle: {
      fontFamily: FontFamily.sansBold,
      fontSize: FontSize.xl,
      color: C.foreground,
    },
    successBody: {
      fontFamily: FontFamily.sans,
      fontSize: FontSize.base,
      color: C.mutedForeground,
      textAlign: 'center',
      lineHeight: FontSize.base * 1.6,
      paddingHorizontal: Spacing[4],
    },
  });
}
