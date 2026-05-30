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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { Colors, FontFamily, FontSize, Radius, Spacing, Shadow } from '@/constants/theme';

const C = Colors.dark;
const BG = '#0c0c15';

type AccountType = 'buyer' | 'dealer' | 'seller';

const ACCOUNT_TYPES: { key: AccountType; label: string; description: string; symbol: string }[] = [
  { key: 'buyer', label: 'Buyer', description: 'Browse & contact sellers', symbol: 'magnifyingglass' },
  { key: 'dealer', label: 'Dealer', description: 'Manage your dealership', symbol: 'building.2' },
  { key: 'seller', label: 'Private Seller', description: 'List your vehicle', symbol: 'tag' },
];

export default function RegisterScreen() {
  const [accountType, setAccountType] = useState<AccountType>('buyer');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const isFocused = (field: string) => focused === field;

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
              <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
                <SymbolView name="arrow.left" size={18} tintColor="rgba(255,255,255,0.6)" weight="medium" />
              </Pressable>
              <View style={styles.logoMark}>
                <SymbolView name="car.fill" size={24} tintColor={C.primary} weight="semibold" />
              </View>
              <Text style={styles.title}>Create account</Text>
              <Text style={styles.subtitle}>Join AutoVendo and start your journey</Text>
            </View>

            {/* Account type */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>I want to</Text>
              <View style={styles.typeRow}>
                {ACCOUNT_TYPES.map(type => {
                  const active = accountType === type.key;
                  return (
                    <Pressable
                      key={type.key}
                      style={[styles.typeCard, active && styles.typeCardActive]}
                      onPress={() => setAccountType(type.key)}>
                      <SymbolView
                        name={type.symbol as any}
                        size={20}
                        tintColor={active ? C.primary : 'rgba(255,255,255,0.35)'}
                        weight="medium"
                      />
                      <Text style={[styles.typeLabel, active && styles.typeLabelActive]}>
                        {type.label}
                      </Text>
                      <Text style={styles.typeDescription}>{type.description}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Name row */}
              <View style={styles.nameRow}>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={styles.label}>First name</Text>
                  <View style={[styles.inputWrapper, isFocused('firstName') && styles.inputWrapperFocused]}>
                    <TextInput
                      style={styles.input}
                      placeholder="John"
                      placeholderTextColor="rgba(255,255,255,0.25)"
                      value={firstName}
                      onChangeText={setFirstName}
                      onFocus={() => setFocused('firstName')}
                      onBlur={() => setFocused(null)}
                      autoCapitalize="words"
                      returnKeyType="next"
                    />
                  </View>
                </View>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Last name</Text>
                  <View style={[styles.inputWrapper, isFocused('lastName') && styles.inputWrapperFocused]}>
                    <TextInput
                      style={styles.input}
                      placeholder="Doe"
                      placeholderTextColor="rgba(255,255,255,0.25)"
                      value={lastName}
                      onChangeText={setLastName}
                      onFocus={() => setFocused('lastName')}
                      onBlur={() => setFocused(null)}
                      autoCapitalize="words"
                      returnKeyType="next"
                    />
                  </View>
                </View>
              </View>

              {/* Email */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={[styles.inputWrapper, isFocused('email') && styles.inputWrapperFocused]}>
                  <SymbolView
                    name="envelope"
                    size={16}
                    tintColor={isFocused('email') ? C.primary : 'rgba(255,255,255,0.3)'}
                    weight="medium"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused(null)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Password</Text>
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
                    returnKeyType="done"
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
                {/* Password strength hint */}
                <View style={styles.strengthRow}>
                  {[0, 1, 2, 3].map(i => (
                    <View
                      key={i}
                      style={[
                        styles.strengthBar,
                        password.length > i * 2 && { backgroundColor: password.length >= 8 ? '#1a9e78' : C.primary },
                      ]}
                    />
                  ))}
                  <Text style={styles.strengthText}>
                    {password.length === 0 ? 'Enter a password' : password.length < 6 ? 'Weak' : password.length < 8 ? 'Fair' : 'Strong'}
                  </Text>
                </View>
              </View>

              {/* Terms note */}
              <Text style={styles.termsText}>
                By creating an account you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>.
              </Text>

              {/* Submit */}
              <Pressable style={styles.submitBtn}>
                <Text style={styles.submitBtnText}>Create Account</Text>
              </Pressable>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <Pressable hitSlop={8}>
                  <Text style={styles.footerLink}>Sign in</Text>
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

  // Header
  header: {
    paddingTop: Spacing[6],
    paddingBottom: Spacing[6],
    gap: Spacing[2],
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[4],
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

  // Account type
  section: { gap: Spacing[3], marginBottom: Spacing[5] },
  sectionLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.6)',
  },
  typeRow: { flexDirection: 'row', gap: Spacing[3] },
  typeCard: {
    flex: 1,
    padding: Spacing[4],
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: Spacing[1],
    alignItems: 'center',
  },
  typeCardActive: {
    backgroundColor: `${C.primary}18`,
    borderColor: `${C.primary}60`,
  },
  typeLabel: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  typeLabelActive: { color: '#ffffff' },
  typeDescription: {
    fontFamily: FontFamily.sans,
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
  },

  // Form
  form: { gap: Spacing[5] },
  nameRow: { flexDirection: 'row', gap: Spacing[3] },
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
  inputIcon: { marginRight: Spacing[3] },
  input: {
    flex: 1,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    color: '#ffffff',
    height: '100%',
  },
  eyeBtn: { padding: Spacing[1], marginLeft: Spacing[2] },

  // Password strength
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
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.3)',
    minWidth: 40,
  },

  // Terms
  termsText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.35)',
    lineHeight: 18,
  },
  termsLink: {
    color: C.sidebarPrimary,
    fontFamily: FontFamily.sansMedium,
  },

  // Submit
  submitBtn: {
    height: 54,
    borderRadius: Radius.lg,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  submitBtnText: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: FontSize.md,
    color: '#ffffff',
  },

  // Footer
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
