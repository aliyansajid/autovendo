import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { Colors, FontFamily, FontSize, Radius, Spacing, Shadow } from '@/constants/theme';
import { authClient } from '@/lib/auth-client';

const C = Colors.dark;
const BG = '#0c0c15';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    const { error: err } = await authClient.signIn.email({ email, password });
    setLoading(false);
    if (err) {
      setError(err.message ?? 'Sign in failed. Please try again.');
      return;
    }
    router.replace('/(tabs)' as any);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoMark}>
                <SymbolView name="car.fill" size={24} tintColor={C.primary} weight="semibold" />
              </View>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>Sign in to your AutoVendo account</Text>
            </View>

            {/* Error */}
            {error && (
              <View style={styles.errorBox}>
                <SymbolView name="exclamationmark.circle" size={14} tintColor={C.destructive} weight="medium" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Email</Text>
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
                    returnKeyType="next"
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Password</Text>
                  <Link href="/(auth)/forgot-password" asChild>
                    <Pressable hitSlop={8}>
                      <Text style={styles.forgotLink}>Forgot password?</Text>
                    </Pressable>
                  </Link>
                </View>
                <View style={[styles.inputWrapper, passwordFocused && styles.inputWrapperFocused]}>
                  <SymbolView
                    name="lock"
                    size={16}
                    tintColor={passwordFocused ? C.primary : 'rgba(255,255,255,0.3)'}
                    weight="medium"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    secureTextEntry={!passwordVisible}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                  <Pressable onPress={() => setPasswordVisible(v => !v)} hitSlop={8} style={styles.eyeBtn}>
                    <SymbolView
                      name={passwordVisible ? 'eye.slash' : 'eye'}
                      size={16}
                      tintColor="rgba(255,255,255,0.35)"
                      weight="medium"
                    />
                  </Pressable>
                </View>
              </View>

              <Pressable
                style={[styles.submitBtn, (!email || !password || loading) && styles.submitBtnDisabled]}
                onPress={handleLogin}
                disabled={loading || !email || !password}>
                {loading
                  ? <ActivityIndicator color="#ffffff" size="small" />
                  : <Text style={styles.submitBtnText}>Sign In</Text>}
              </Pressable>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social — UI only, wired up when OAuth providers are configured */}
              <View style={styles.socialRow}>
                <Pressable style={styles.socialBtn}>
                  <SymbolView name="globe" size={18} tintColor="#ffffff" weight="medium" />
                  <Text style={styles.socialBtnText}>Google</Text>
                </Pressable>
                <Pressable style={styles.socialBtn}>
                  <SymbolView name="applelogo" size={18} tintColor="#ffffff" weight="medium" />
                  <Text style={styles.socialBtnText}>Apple</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Link href="/(auth)/register" asChild>
                <Pressable hitSlop={8}>
                  <Text style={styles.footerLink}>Create one</Text>
                </Pressable>
              </Link>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing[6],
    paddingBottom: Spacing[8],
  },
  header: {
    paddingTop: Spacing[8],
    paddingBottom: Spacing[8],
    gap: Spacing[2],
  },
  logoMark: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    backgroundColor: `${C.primary}22`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[4],
    borderWidth: 1,
    borderColor: `${C.primary}30`,
  },
  title: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize['2xl'],
    color: '#ffffff',
  },
  subtitle: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.45)',
    marginTop: Spacing[1],
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    backgroundColor: `${C.destructive}18`,
    borderWidth: 1,
    borderColor: `${C.destructive}40`,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    marginBottom: Spacing[2],
  },
  errorText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    color: C.destructive,
    flex: 1,
  },
  form: { gap: Spacing[5] },
  fieldGroup: { gap: Spacing[2] },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.6)',
  },
  forgotLink: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.sm,
    color: C.sidebarPrimary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
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
    color: '#ffffff',
    height: '100%',
  },
  eyeBtn: { padding: Spacing[1], marginLeft: Spacing[2] },
  submitBtn: {
    height: 54,
    borderRadius: Radius.lg,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing[2],
    ...Shadow.md,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: FontSize.md,
    color: '#ffffff',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  dividerText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.3)',
  },
  socialRow: { flexDirection: 'row', gap: Spacing[3] },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  socialBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.sm,
    color: '#ffffff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing[8],
  },
  footerText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.4)',
  },
  footerLink: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: FontSize.sm,
    color: C.sidebarPrimary,
  },
});
