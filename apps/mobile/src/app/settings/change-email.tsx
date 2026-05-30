import { useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
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
import { FontFamily, FontSize, Spacing, Radius, Shadow, type ThemeColors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const appUrl = process.env.EXPO_PUBLIC_APP_URL ?? 'https://autovendo.ch';

export default function ChangeEmailScreen() {
  const C = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);

  const [newEmail, setNewEmail] = useState('');
  const [focused, setFocused] = useState(false);
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
              <Pressable style={styles.submitBtn} onPress={() => router.back()}>
                <Text style={styles.submitBtnText}>Done</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={styles.description}>
                Enter your new email address. We'll send a confirmation link to verify it before making the change.
              </Text>

              <View style={styles.form}>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>New Email Address</Text>
                  <View style={[styles.inputWrapper, focused && styles.inputWrapperFocused]}>
                    <SymbolView
                      name="envelope"
                      size={16}
                      tintColor={focused ? C.primary : 'rgba(255,255,255,0.3)'}
                      weight="medium"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={newEmail}
                      onChangeText={setNewEmail}
                      placeholder="you@example.com"
                      placeholderTextColor="rgba(255,255,255,0.25)"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoComplete="email"
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                    />
                  </View>
                </View>

                <Pressable
                  style={[styles.submitBtn, (loading || !newEmail.trim()) && styles.submitBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={loading || !newEmail.trim()}
                >
                  {loading ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.submitBtnText}>Send Confirmation</Text>
                  )}
                </Pressable>
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
    fieldGroup: { gap: Spacing[2] },
    label: {
      fontFamily: FontFamily.sansMedium,
      fontSize: FontSize.sm,
      color: C.mutedForeground,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: C.secondary,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: C.border,
      paddingHorizontal: Spacing[4],
      height: 52,
    },
    inputWrapperFocused: {
      borderColor: `${C.primary}80`,
      backgroundColor: `${C.primary}0D`,
    },
    inputIcon: { marginRight: Spacing[3] },
    input: {
      flex: 1,
      fontFamily: FontFamily.sans,
      fontSize: FontSize.base,
      color: C.foreground,
      height: '100%',
    },
    submitBtn: {
      height: 54,
      borderRadius: Radius.lg,
      backgroundColor: C.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...Shadow.md,
    },
    submitBtnDisabled: { opacity: 0.5 },
    submitBtnText: {
      fontFamily: FontFamily.sansSemiBold,
      fontSize: FontSize.md,
      color: '#ffffff',
    },
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
