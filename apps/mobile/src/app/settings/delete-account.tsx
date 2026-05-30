import { useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
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

const CONSEQUENCES = [
  'Your profile and personal information',
  'All your vehicle listings',
  'Your saved vehicles',
  'Your message history',
  'Your subscription and billing history',
];

export default function DeleteAccountScreen() {
  const C = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);

  const [password, setPassword] = useState('');
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const { error } = await authClient.deleteUser({ password });
              if (error) {
                Alert.alert('Error', 'Incorrect password or something went wrong.');
              } else {
                router.replace('/(auth)/login' as any);
              }
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <SymbolView name="chevron.left" size={20} tintColor={C.foreground} />
        </Pressable>
        <Text style={styles.title}>Delete Account</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Warning Banner */}
        <View style={styles.warningBox}>
          <SymbolView name="exclamationmark.triangle.fill" size={20} tintColor={C.destructive} weight="medium" />
          <Text style={styles.warningText}>
            This action is permanent and cannot be undone.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Deleting your account will permanently remove:</Text>
          {CONSEQUENCES.map((item, i) => (
            <View key={i} style={styles.bulletRow}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Confirm your password</Text>
            <View style={[styles.inputWrapper, focused && styles.inputWrapperFocused]}>
              <SymbolView
                name="lock"
                size={16}
                tintColor={focused ? C.primary : 'rgba(255,255,255,0.3)'}
                weight="medium"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="rgba(255,255,255,0.25)"
                secureTextEntry={!visible}
                autoCapitalize="none"
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
              />
              <Pressable onPress={() => setVisible((v) => !v)} hitSlop={8} style={styles.eyeBtn}>
                <SymbolView
                  name={visible ? 'eye.slash' : 'eye'}
                  size={16}
                  tintColor="rgba(255,255,255,0.35)"
                  weight="medium"
                />
              </Pressable>
            </View>
          </View>

          <Pressable
            style={[styles.deleteBtn, (!password.trim() || loading) && styles.deleteBtnDisabled]}
            onPress={handleDelete}
            disabled={!password.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.deleteBtnText}>Delete My Account</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
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
      color: C.destructive,
    },
    content: {
      paddingHorizontal: Spacing[6],
      paddingTop: Spacing[6],
      gap: Spacing[6],
      paddingBottom: Spacing[16],
    },
    warningBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing[3],
      backgroundColor: `${C.destructive}18`,
      borderRadius: Radius.md,
      padding: Spacing[4],
      borderWidth: 1,
      borderColor: `${C.destructive}40`,
    },
    warningText: {
      flex: 1,
      fontFamily: FontFamily.sansMedium,
      fontSize: FontSize.sm,
      color: C.destructive,
      lineHeight: FontSize.sm * 1.5,
    },
    section: { gap: Spacing[3] },
    sectionLabel: {
      fontFamily: FontFamily.sansMedium,
      fontSize: FontSize.base,
      color: C.foreground,
    },
    bulletRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: Spacing[3],
    },
    bullet: {
      width: 5,
      height: 5,
      borderRadius: 3,
      backgroundColor: C.mutedForeground,
      marginTop: 8,
    },
    bulletText: {
      flex: 1,
      fontFamily: FontFamily.sans,
      fontSize: FontSize.base,
      color: C.mutedForeground,
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
    eyeBtn: { padding: Spacing[1], marginLeft: Spacing[2] },
    deleteBtn: {
      height: 54,
      borderRadius: Radius.lg,
      backgroundColor: C.destructive,
      alignItems: 'center',
      justifyContent: 'center',
      ...Shadow.md,
    },
    deleteBtnDisabled: { opacity: 0.5 },
    deleteBtnText: {
      fontFamily: FontFamily.sansSemiBold,
      fontSize: FontSize.md,
      color: '#ffffff',
    },
  });
}
