import { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { useSession, signOut } from '@/lib/auth-client';
import { FontFamily, FontSize, Spacing, Radius, type ThemeColors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useTabBarHeight } from '@/hooks/use-tab-bar-height';

// ─── Types ────────────────────────────────────────────────────────────────────

type SettingRowProps = {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  chevron?: boolean;
  styles: ReturnType<typeof createStyles>;
  C: ThemeColors;
};

type SectionProps = {
  title: string;
  children: React.ReactNode;
  styles: ReturnType<typeof createStyles>;
};

// ─── Components ───────────────────────────────────────────────────────────────

function Section({ title, children, styles }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function SettingRow({ icon, label, value, onPress, danger, chevron = true, styles, C }: SettingRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onPress}
    >
      <View style={[styles.rowIcon, danger && styles.rowIconDanger]}>
        <SymbolView
          name={icon as any}
          size={18}
          tintColor={danger ? C.destructive : C.mutedForeground}
        />
      </View>
      <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
      <View style={styles.rowRight}>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        {chevron && (
          <SymbolView
            name="chevron.right"
            size={14}
            tintColor={danger ? C.destructive : C.muted}
          />
        )}
      </View>
    </Pressable>
  );
}

function Divider({ styles }: { styles: ReturnType<typeof createStyles> }) {
  return <View style={styles.divider} />;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const C = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const tabBarHeight = useTabBarHeight();
  const { data: session } = useSession();
  const user = session?.user;

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  const go = (path: string) => router.push(path as any);

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login' as any);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Settings</Text>
        </View>

        {/* Profile Card */}
        <Pressable style={styles.profileCard} onPress={() => go('/settings/edit-profile')}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name ?? '—'}</Text>
            <Text style={styles.profileEmail}>{user?.email ?? '—'}</Text>
          </View>
          <SymbolView
            name="chevron.right"
            size={16}
            tintColor={C.muted}
          />
        </Pressable>

        {/* Account */}
        <Section title="Account" styles={styles}>
          <SettingRow
            icon="person.fill"
            label="Edit Profile"
            onPress={() => go('/settings/edit-profile')}
            styles={styles}
            C={C}
          />
          <Divider styles={styles} />
          <SettingRow
            icon="envelope.fill"
            label="Change Email"
            onPress={() => go('/settings/change-email')}
            styles={styles}
            C={C}
          />
          <Divider styles={styles} />
          <SettingRow
            icon="lock.fill"
            label="Change Password"
            onPress={() => go('/settings/change-password')}
            styles={styles}
            C={C}
          />
        </Section>

        {/* Listings */}
        <Section title="My Listings" styles={styles}>
          <SettingRow
            icon="car.fill"
            label="My Vehicles"
            onPress={() => go('/settings/my-vehicles')}
            styles={styles}
            C={C}
          />
          <Divider styles={styles} />
          <SettingRow
            icon="heart.fill"
            label="Saved Vehicles"
            onPress={() => go('/settings/saved-vehicles')}
            styles={styles}
            C={C}
          />
        </Section>

        {/* Notifications */}
        <Section title="Notifications" styles={styles}>
          <SettingRow
            icon="bell.fill"
            label="Push Notifications"
            onPress={() => go('/settings/notifications')}
            styles={styles}
            C={C}
          />
          <Divider styles={styles} />
          <SettingRow
            icon="envelope.badge.fill"
            label="Email Notifications"
            onPress={() => go('/settings/notifications')}
            styles={styles}
            C={C}
          />
        </Section>

        {/* Support */}
        <Section title="Support" styles={styles}>
          <SettingRow
            icon="questionmark.circle.fill"
            label="Help & FAQ"
            onPress={() => go('/settings/help')}
            styles={styles}
            C={C}
          />
          <Divider styles={styles} />
          <SettingRow
            icon="shield.fill"
            label="Privacy Policy"
            onPress={() => go('/settings/privacy-policy')}
            styles={styles}
            C={C}
          />
          <Divider styles={styles} />
          <SettingRow
            icon="doc.text.fill"
            label="Terms of Service"
            onPress={() => go('/settings/terms')}
            styles={styles}
            C={C}
          />
          <Divider styles={styles} />
          <SettingRow
            icon="info.circle.fill"
            label="App Version"
            value="1.0.0"
            chevron={false}
            onPress={undefined}
            styles={styles}
            C={C}
          />
        </Section>

        {/* Danger Zone */}
        <Section title="Account Actions" styles={styles}>
          <SettingRow
            icon="rectangle.portrait.and.arrow.right.fill"
            label="Sign Out"
            danger
            chevron={false}
            onPress={handleSignOut}
            styles={styles}
            C={C}
          />
          <Divider styles={styles} />
          <SettingRow
            icon="trash.fill"
            label="Delete Account"
            danger
            chevron={false}
            onPress={() => go('/settings/delete-account')}
            styles={styles}
            C={C}
          />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function createStyles(C: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: C.secondary,
    },
    content: {
      paddingHorizontal: Spacing[4],
      gap: Spacing[4],
    },

    // Header
    header: {
      paddingTop: Spacing[3],
      paddingBottom: Spacing[2],
    },
    screenTitle: {
      fontFamily: FontFamily.sansBold,
      fontSize: FontSize['2xl'],
      color: C.foreground,
    },

    // Profile Card
    profileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: C.card,
      borderRadius: Radius.xl,
      padding: Spacing[4],
      gap: Spacing[3],
      borderWidth: 1,
      borderColor: C.border,
    },
    avatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: C.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontFamily: FontFamily.sansBold,
      fontSize: FontSize.md,
      color: '#fff',
    },
    profileInfo: {
      flex: 1,
      gap: 2,
    },
    profileName: {
      fontFamily: FontFamily.sansSemiBold,
      fontSize: FontSize.base,
      color: C.foreground,
    },
    profileEmail: {
      fontFamily: FontFamily.sans,
      fontSize: FontSize.sm,
      color: C.mutedForeground,
    },

    // Section
    section: {
      gap: Spacing[2],
    },
    sectionTitle: {
      fontFamily: FontFamily.sansSemiBold,
      fontSize: FontSize.sm,
      color: C.mutedForeground,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      paddingHorizontal: Spacing[1],
    },
    sectionCard: {
      backgroundColor: C.card,
      borderRadius: Radius.xl,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: C.border,
    },

    // Row
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing[4],
      paddingVertical: Spacing[3] + 2,
      gap: Spacing[3],
    },
    rowPressed: {
      backgroundColor: C.muted,
    },
    rowIcon: {
      width: 32,
      height: 32,
      borderRadius: Radius.md,
      backgroundColor: C.secondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowIconDanger: {
      backgroundColor: `${C.destructive}18`,
    },
    rowLabel: {
      flex: 1,
      fontFamily: FontFamily.sans,
      fontSize: FontSize.base,
      color: C.foreground,
    },
    rowLabelDanger: {
      color: C.destructive,
    },
    rowRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing[2],
    },
    rowValue: {
      fontFamily: FontFamily.sans,
      fontSize: FontSize.sm,
      color: C.mutedForeground,
      maxWidth: 140,
      numberOfLines: 1,
    },

    // Divider
    divider: {
      height: 1,
      backgroundColor: C.border,
      marginLeft: Spacing[4] + 32 + Spacing[3],
    },
  });
}
