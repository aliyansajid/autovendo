import { useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { useState } from 'react';
import { FontFamily, FontSize, Spacing, Radius, type ThemeColors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type NotifRow = {
  icon: string;
  label: string;
  description: string;
  key: string;
};

const PUSH_OPTIONS: NotifRow[] = [
  { icon: 'bell.fill', label: 'New Messages', description: 'When someone contacts you about a listing', key: 'push_messages' },
  { icon: 'car.fill', label: 'Price Drops', description: 'When a saved vehicle drops in price', key: 'push_price' },
  { icon: 'star.fill', label: 'New Listings', description: 'When new matches for your saved searches appear', key: 'push_listings' },
];

const EMAIL_OPTIONS: NotifRow[] = [
  { icon: 'envelope.fill', label: 'Weekly Digest', description: 'A summary of new vehicles in your area', key: 'email_digest' },
  { icon: 'tag.fill', label: 'Promotions', description: 'Special deals and featured listing offers', key: 'email_promo' },
  { icon: 'checkmark.seal.fill', label: 'Account Updates', description: 'Security and account activity alerts', key: 'email_account' },
];

function NotifToggle({
  row,
  value,
  onChange,
  styles,
  C,
}: {
  row: NotifRow;
  value: boolean;
  onChange: (v: boolean) => void;
  styles: ReturnType<typeof createStyles>;
  C: ThemeColors;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <SymbolView name={row.icon as any} size={16} tintColor={C.mutedForeground} />
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{row.label}</Text>
        <Text style={styles.rowDesc}>{row.description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: C.muted, true: C.primary }}
        thumbColor={C.foreground}
        ios_backgroundColor={C.muted}
      />
    </View>
  );
}

export default function NotificationsScreen() {
  const C = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);

  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    push_messages: true,
    push_price: true,
    push_listings: false,
    email_digest: true,
    email_promo: false,
    email_account: true,
  });

  const toggle = (key: string) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <SymbolView name="chevron.left" size={20} tintColor={C.foreground} />
        </Pressable>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.content}>
        {/* Push */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Push Notifications</Text>
          <View style={styles.card}>
            {PUSH_OPTIONS.map((row, i) => (
              <View key={row.key}>
                <NotifToggle
                  row={row}
                  value={prefs[row.key]}
                  onChange={() => toggle(row.key)}
                  styles={styles}
                  C={C}
                />
                {i < PUSH_OPTIONS.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Email */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email Notifications</Text>
          <View style={styles.card}>
            {EMAIL_OPTIONS.map((row, i) => (
              <View key={row.key}>
                <NotifToggle
                  row={row}
                  value={prefs[row.key]}
                  onChange={() => toggle(row.key)}
                  styles={styles}
                  C={C}
                />
                {i < EMAIL_OPTIONS.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>
      </View>
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
      borderBottomColor: C.border,
    },
    backBtn: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontFamily: FontFamily.sansSemiBold,
      fontSize: FontSize.md,
      color: C.foreground,
    },
    content: {
      padding: Spacing[4],
      gap: Spacing[4],
    },
    section: { gap: Spacing[2] },
    sectionTitle: {
      fontFamily: FontFamily.sansSemiBold,
      fontSize: FontSize.sm,
      color: C.mutedForeground,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      paddingHorizontal: Spacing[1],
    },
    card: {
      backgroundColor: C.card,
      borderRadius: Radius.xl,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing[4],
      paddingVertical: Spacing[3],
      gap: Spacing[3],
    },
    rowIcon: {
      width: 32,
      height: 32,
      borderRadius: Radius.md,
      backgroundColor: C.secondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowContent: { flex: 1, gap: 2 },
    rowLabel: {
      fontFamily: FontFamily.sansMedium,
      fontSize: FontSize.base,
      color: C.foreground,
    },
    rowDesc: {
      fontFamily: FontFamily.sans,
      fontSize: FontSize.sm,
      color: C.mutedForeground,
      lineHeight: FontSize.sm * 1.4,
    },
    divider: {
      height: 1,
      backgroundColor: C.border,
      marginLeft: Spacing[4] + 32 + Spacing[3],
    },
  });
}
