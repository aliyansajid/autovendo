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

type Field = 'current' | 'new' | 'confirm';

export default function ChangePasswordScreen() {
  const C = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);

  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [visible, setVisible] = useState<Record<Field, boolean>>({ current: false, new: false, confirm: false });
  const [focused, setFocused] = useState<Field | null>(null);
  const [loading, setLoading] = useState(false);

  const toggle = (field: Field) => setVisible((v) => ({ ...v, [field]: !v[field] }));
  const canSubmit = current.trim() && newPass.trim() && newPass === confirm;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (newPass.length < 8) {
      Alert.alert('Too short', 'Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword: current,
        newPassword: newPass,
        revokeOtherSessions: true,
      });
      if (error) {
        Alert.alert('Error', 'Current password is incorrect or something went wrong.');
      } else {
        Alert.alert('Success', 'Your password has been changed.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: Field, label: string, placeholder: string) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[
        styles.inputWrapper,
        focused === field && styles.inputWrapperFocused,
        field === 'confirm' && confirm && newPass !== confirm && styles.inputWrapperError,
      ]}>
        <SymbolView
          name="lock"
          size={16}
          tintColor={focused === field ? C.primary : 'rgba(255,255,255,0.3)'}
          weight="medium"
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          value={field === 'current' ? current : field === 'new' ? newPass : confirm}
          onChangeText={field === 'current' ? setCurrent : field === 'new' ? setNewPass : setConfirm}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.25)"
          secureTextEntry={!visible[field]}
          autoCapitalize="none"
          onFocus={() => setFocused(field)}
          onBlur={() => setFocused(null)}
        />
        <Pressable onPress={() => toggle(field)} hitSlop={8} style={styles.eyeBtn}>
          <SymbolView
            name={visible[field] ? 'eye.slash' : 'eye'}
            size={16}
            tintColor="rgba(255,255,255,0.35)"
            weight="medium"
          />
        </Pressable>
      </View>
      {field === 'confirm' && confirm && newPass !== confirm ? (
        <Text style={styles.errorText}>Passwords do not match</Text>
      ) : null}
    </View>
  );

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
          <Text style={styles.title}>Change Password</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            {renderField('current', 'Current Password', '••••••••')}
            {renderField('new', 'New Password', 'Min. 8 characters')}
            {renderField('confirm', 'Confirm New Password', 'Repeat new password')}

            <Pressable
              style={[styles.submitBtn, (!canSubmit || loading) && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit || loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>Update Password</Text>
              )}
            </Pressable>
          </View>
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
    inputWrapperError: {
      borderColor: `${C.destructive}80`,
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
    errorText: {
      fontFamily: FontFamily.sans,
      fontSize: FontSize.sm,
      color: C.destructive,
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
  });
}
