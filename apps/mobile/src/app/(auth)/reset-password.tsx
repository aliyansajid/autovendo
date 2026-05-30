import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { Colors, FontFamily, FontSize, Radius, Spacing, Shadow } from '@/constants/theme';

const C = Colors.dark;
const BG = '#0c0c15';

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const isFocused = (f: string) => focused === f;

  const strength =
    password.length === 0 ? null :
    password.length < 6 ? 'weak' :
    password.length < 8 ? 'fair' : 'strong';

  const strengthColor =
    strength === 'strong' ? '#1a9e78' :
    strength === 'fair' ? '#f9a602' : '#e8956c';

  const strengthBars = strength === 'strong' ? 4 : strength === 'fair' ? 2 : 1;

  const passwordsMatch = confirm.length > 0 && password === confirm;
  const canSubmit = strength === 'strong' && passwordsMatch;

  if (done) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={[styles.safeArea, { paddingHorizontal: Spacing[6] }]}>
          <View style={styles.successContent}>
            <View style={[styles.iconCircle, { backgroundColor: '#1a9e7822' }]}>
              <SymbolView name="checkmark.shield.fill" size={36} tintColor="#1a9e78" weight="semibold" />
            </View>
            <Text style={styles.successTitle}>Password reset!</Text>
            <Text style={styles.successText}>
              Your password has been updated successfully. You can now sign in with your new password.
            </Text>
            <Pressable style={styles.submitBtn} onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.submitBtnText}>Sign In</Text>
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

            {/* Back */}
            <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
              <SymbolView name="arrow.left" size={18} tintColor="rgba(255,255,255,0.6)" weight="medium" />
            </Pressable>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoMark}>
                <SymbolView name="lock.open.fill" size={24} tintColor={C.primary} weight="semibold" />
              </View>
              <Text style={styles.title}>Set new password</Text>
              <Text style={styles.subtitle}>
                Choose a strong password. You'll use it to sign in going forward.
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* New password */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>New password</Text>
                <View style={[styles.inputWrapper, isFocused('password') && styles.inputWrapperFocused]}>
                  <SymbolView
                    name="lock"
                    size={16}
                    tintColor={isFocused('password') ? C.primary : 'rgba(255,255,255,0.3)'}
                    weight="medium"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Min. 8 characters"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused(null)}
                    secureTextEntry={!passwordVisible}
                    returnKeyType="next"
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

                {/* Strength indicator */}
                {password.length > 0 && (
                  <View style={styles.strengthRow}>
                    {[1, 2, 3, 4].map(i => (
                      <View
                        key={i}
                        style={[
                          styles.strengthBar,
                          i <= strengthBars && { backgroundColor: strengthColor },
                        ]}
                      />
                    ))}
                    <Text style={[styles.strengthText, { color: strengthColor }]}>
                      {strength === 'strong' ? 'Strong' : strength === 'fair' ? 'Fair' : 'Weak'}
                    </Text>
                  </View>
                )}

                {/* Requirements */}
                <View style={styles.requirements}>
                  <Requirement met={password.length >= 8} label="At least 8 characters" />
                  <Requirement met={/[A-Z]/.test(password)} label="One uppercase letter" />
                  <Requirement met={/[0-9]/.test(password)} label="One number" />
                </View>
              </View>

              {/* Confirm password */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Confirm password</Text>
                <View style={[
                  styles.inputWrapper,
                  isFocused('confirm') && styles.inputWrapperFocused,
                  confirm.length > 0 && !passwordsMatch && styles.inputWrapperError,
                  passwordsMatch && styles.inputWrapperSuccess,
                ]}>
                  <SymbolView
                    name="lock"
                    size={16}
                    tintColor={isFocused('confirm') ? C.primary : 'rgba(255,255,255,0.3)'}
                    weight="medium"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Re-enter password"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    value={confirm}
                    onChangeText={setConfirm}
                    onFocus={() => setFocused('confirm')}
                    onBlur={() => setFocused(null)}
                    secureTextEntry={!confirmVisible}
                    returnKeyType="done"
                  />
                  {confirm.length > 0 && (
                    <SymbolView
                      name={passwordsMatch ? 'checkmark.circle.fill' : 'xmark.circle.fill'}
                      size={16}
                      tintColor={passwordsMatch ? '#1a9e78' : '#e8956c'}
                      weight="medium"
                    />
                  )}
                  <Pressable onPress={() => setConfirmVisible(v => !v)} hitSlop={8} style={styles.eyeBtn}>
                    <SymbolView
                      name={confirmVisible ? 'eye.slash' : 'eye'}
                      size={16}
                      tintColor="rgba(255,255,255,0.35)"
                      weight="medium"
                    />
                  </Pressable>
                </View>
                {confirm.length > 0 && !passwordsMatch && (
                  <Text style={styles.errorText}>Passwords don't match</Text>
                )}
              </View>

              {/* Submit */}
              <Pressable
                style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
                onPress={() => canSubmit && setDone(true)}>
                <Text style={styles.submitBtnText}>Reset Password</Text>
              </Pressable>
            </View>

          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function Requirement({ met, label }: { met: boolean; label: string }) {
  return (
    <View style={reqStyles.row}>
      <SymbolView
        name={met ? 'checkmark.circle.fill' : 'circle'}
        size={13}
        tintColor={met ? '#1a9e78' : 'rgba(255,255,255,0.2)'}
        weight="medium"
      />
      <Text style={[reqStyles.text, met && reqStyles.textMet]}>{label}</Text>
    </View>
  );
}

const reqStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  text: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.3)',
  },
  textMet: { color: '#1a9e78' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: Spacing[6], paddingBottom: Spacing[8] },

  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing[6],
  },

  // Header
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
    lineHeight: 24,
    marginTop: Spacing[1],
  },

  // Form
  form: { gap: Spacing[5] },
  fieldGroup: { gap: Spacing[2] },
  label: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.6)',
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
  inputWrapperError: {
    borderColor: '#e8956c60',
    backgroundColor: '#e8956c0D',
  },
  inputWrapperSuccess: {
    borderColor: '#1a9e7860',
    backgroundColor: '#1a9e780D',
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
  errorText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    color: '#e8956c',
  },

  // Strength
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginTop: Spacing[1],
  },
  strengthBar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  strengthText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.xs,
    minWidth: 36,
  },

  // Requirements
  requirements: { gap: Spacing[1], marginTop: Spacing[1] },

  // Submit
  submitBtn: {
    height: 54,
    borderRadius: Radius.lg,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing[2],
    ...Shadow.md,
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: FontSize.md,
    color: '#ffffff',
  },

  // Success
  successContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[4],
    paddingBottom: Spacing[16],
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[2],
  },
  successTitle: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize['2xl'],
    color: '#ffffff',
  },
  successText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing[4],
  },
});
