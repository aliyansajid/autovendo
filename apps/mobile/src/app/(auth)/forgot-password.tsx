import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { Colors, FontFamily, FontSize, Radius, Spacing, Shadow } from '@/constants/theme';
import { authClient } from '@/lib/auth-client';

const C = Colors.dark;
const BG = '#0c0c15';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleForgot = async () => {
    if (!email) return;
    setLoading(true);
    setError(null);
    const { error: err } = await authClient.forgetPassword({
      email,
      redirectTo: '/reset-password',
    });
    setLoading(false);
    if (err) {
      setError(err.message ?? 'Failed to send reset email. Please try again.');
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={[styles.safeArea, { paddingHorizontal: Spacing[6] }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
            <SymbolView name="arrow.left" size={18} tintColor="rgba(255,255,255,0.6)" weight="medium" />
          </Pressable>
          <View style={styles.successContent}>
            <View style={[styles.iconCircle, { backgroundColor: '#1a9e7822' }]}>
              <SymbolView name="envelope.badge.checkmark" size={32} tintColor="#1a9e78" weight="semibold" />
            </View>
            <Text style={styles.successTitle}>Check your inbox</Text>
            <Text style={styles.successText}>
              We've sent a password reset link to{'\n'}
              <Text style={styles.successEmail}>{email}</Text>
            </Text>
            <Text style={styles.successHint}>
              Didn't receive it? Check your spam folder or{' '}
              <Text style={styles.resendLink} onPress={() => setSent(false)}>try again</Text>.
            </Text>
            <Pressable style={styles.submitBtn} onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.submitBtnText}>Back to Sign In</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}>
          <View style={styles.inner}>

            <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
              <SymbolView name="arrow.left" size={18} tintColor="rgba(255,255,255,0.6)" weight="medium" />
            </Pressable>

            <View style={styles.header}>
              <View style={styles.logoMark}>
                <SymbolView name="lock.rotation" size={24} tintColor={C.primary} weight="semibold" />
              </View>
              <Text style={styles.title}>Forgot password?</Text>
              <Text style={styles.subtitle}>
                Enter your email and we'll send you a link to reset your password.
              </Text>
            </View>

            {error && (
              <View style={styles.errorBox}>
                <SymbolView name="exclamationmark.circle" size={14} tintColor={C.destructive} weight="medium" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.form}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Email address</Text>
                <View style={[styles.inputWrapper, emailFocused && styles.inputWrapperFocused]}>
                  <SymbolView
                    name="envelope"
                    size={16}
                    tintColor={emailFocused ? C.primary : 'rgba(255,255,255,0.3)'}
                    weight="medium"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="send"
                    onSubmitEditing={handleForgot}
                  />
                </View>
              </View>

              <Pressable
                style={[styles.submitBtn, (!email || loading) && styles.submitBtnDisabled]}
                onPress={handleForgot}
                disabled={!email || loading}>
                {loading
                  ? <ActivityIndicator color="#ffffff" size="small" />
                  : <Text style={styles.submitBtnText}>Send Reset Link</Text>}
              </Pressable>
            </View>

            <Pressable onPress={() => router.back()} style={styles.footer} hitSlop={8}>
              <SymbolView name="arrow.left" size={12} tintColor="rgba(255,255,255,0.4)" weight="medium" />
              <Text style={styles.footerText}>Back to Sign In</Text>
            </Pressable>

          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: Spacing[6], paddingBottom: Spacing[8] },
  backBtn: {
    width: 36, height: 36, borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center', marginTop: Spacing[6],
  },
  header: { paddingTop: Spacing[8], paddingBottom: Spacing[8], gap: Spacing[2] },
  logoMark: {
    width: 48, height: 48, borderRadius: Radius.lg,
    backgroundColor: `${C.primary}22`, alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing[4], borderWidth: 1, borderColor: `${C.primary}30`,
  },
  title: { fontFamily: FontFamily.sansBold, fontSize: FontSize['2xl'], color: '#ffffff' },
  subtitle: {
    fontFamily: FontFamily.sans, fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.45)', lineHeight: 24, marginTop: Spacing[1],
  },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing[2],
    backgroundColor: `${C.destructive}18`, borderWidth: 1,
    borderColor: `${C.destructive}40`, borderRadius: Radius.md,
    paddingHorizontal: Spacing[4], paddingVertical: Spacing[3], marginBottom: Spacing[2],
  },
  errorText: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, color: C.destructive, flex: 1 },
  form: { gap: Spacing[5] },
  fieldGroup: { gap: Spacing[2] },
  label: { fontFamily: FontFamily.sansMedium, fontSize: FontSize.sm, color: 'rgba(255,255,255,0.6)' },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: Radius.md,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
    paddingHorizontal: Spacing[4], height: 52,
  },
  inputWrapperFocused: { borderColor: `${C.primary}80`, backgroundColor: `${C.primary}0D` },
  inputIcon: { marginRight: Spacing[3] },
  input: { flex: 1, fontFamily: FontFamily.sans, fontSize: FontSize.base, color: '#ffffff', height: '100%' },
  submitBtn: {
    height: 54, borderRadius: Radius.lg, backgroundColor: C.primary,
    alignItems: 'center', justifyContent: 'center', ...Shadow.md,
  },
  submitBtnDisabled: { opacity: 0.45 },
  submitBtnText: { fontFamily: FontFamily.sansSemiBold, fontSize: FontSize.md, color: '#ffffff' },
  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing[2], marginTop: Spacing[8],
  },
  footerText: { fontFamily: FontFamily.sansMedium, fontSize: FontSize.sm, color: 'rgba(255,255,255,0.4)' },
  // Success state
  successContent: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: Spacing[4], paddingBottom: Spacing[16],
  },
  iconCircle: {
    width: 80, height: 80, borderRadius: Radius.full,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing[2],
  },
  successTitle: { fontFamily: FontFamily.sansBold, fontSize: FontSize['2xl'], color: '#ffffff', textAlign: 'center' },
  successText: {
    fontFamily: FontFamily.sans, fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 24,
  },
  successEmail: { fontFamily: FontFamily.sansSemiBold, color: 'rgba(255,255,255,0.8)' },
  successHint: {
    fontFamily: FontFamily.sans, fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.35)', textAlign: 'center', lineHeight: 20,
  },
  resendLink: { color: C.sidebarPrimary, fontFamily: FontFamily.sansMedium },
});
