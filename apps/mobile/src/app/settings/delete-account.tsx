import { useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
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
          <TextField
            label="Confirm your password"
            icon="lock"
            secure
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
          />

          <Button
            variant="destructive"
            size="lg"
            fullWidth
            label="Delete My Account"
            loading={loading}
            disabled={!password.trim()}
            onPress={handleDelete}
          />
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
  });
}
