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
import { useSession, authClient } from '@/lib/auth-client';
import { FontFamily, FontSize, Spacing, Radius, Shadow, type ThemeColors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function EditProfileScreen() {
  const C = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);

  const { data: session } = useSession();
  const user = session?.user;

  const [name, setName] = useState(user?.name ?? '');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const initials = name
    ? name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const { error } = await authClient.updateUser({ name: name.trim() });
      if (error) {
        Alert.alert('Error', 'Something went wrong. Please try again.');
      } else {
        router.back();
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
          <Text style={styles.title}>Edit Profile</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={[styles.inputWrapper, focused && styles.inputWrapperFocused]}>
                <SymbolView
                  name="person"
                  size={16}
                  tintColor={focused ? C.primary : 'rgba(255,255,255,0.3)'}
                  weight="medium"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Your full name"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  autoCapitalize="words"
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                />
              </View>
            </View>

            <Pressable
              style={[styles.submitBtn, (!name.trim() || loading) && styles.submitBtnDisabled]}
              onPress={handleSave}
              disabled={loading || !name.trim()}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>Save Changes</Text>
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
    avatarWrap: {
      alignItems: 'center',
      paddingBottom: Spacing[2],
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: `${C.primary}22`,
      borderWidth: 1,
      borderColor: `${C.primary}40`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontFamily: FontFamily.sansBold,
      fontSize: FontSize.xl,
      color: C.foreground,
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
  });
}
