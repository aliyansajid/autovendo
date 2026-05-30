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
import { Colors, FontFamily, FontSize, Spacing, Radius } from '@/constants/theme';

const C = Colors.dark;

// ─── Types ────────────────────────────────────────────────────────────────────

type SettingRowProps = {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  chevron?: boolean;
};

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

// ─── Components ───────────────────────────────────────────────────────────────

function Section({ title, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function SettingRow({ icon, label, value, onPress, danger, chevron = true }: SettingRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onPress}
    >
      <View style={[styles.rowIcon, danger && styles.rowIconDanger]}>
        <SymbolView
          name={icon as any}
          size={18}
          tintColor={danger ? '#e57373' : C.mutedForeground}
        />
      </View>
      <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
      <View style={styles.rowRight}>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        {chevron && (
          <SymbolView
            name="chevron.right"
            size={14}
            tintColor={danger ? '#e57373' : 'rgba(255,255,255,0.2)'}
          />
        )}
      </View>
    </Pressable>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
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
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Settings</Text>
        </View>

        {/* Profile Card */}
        <Pressable style={styles.profileCard}>
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
            tintColor="rgba(255,255,255,0.2)"
          />
        </Pressable>

        {/* Account */}
        <Section title="Account">
          <SettingRow
            icon="person.fill"
            label="Edit Profile"
            onPress={() => {}}
          />
          <Divider />
          <SettingRow
            icon="envelope.fill"
            label="Change Email"
            onPress={() => {}}
          />
          <Divider />
          <SettingRow
            icon="lock.fill"
            label="Change Password"
            onPress={() => {}}
          />
        </Section>

        {/* Listings */}
        <Section title="My Listings">
          <SettingRow
            icon="car.fill"
            label="My Vehicles"
            onPress={() => {}}
          />
          <Divider />
          <SettingRow
            icon="heart.fill"
            label="Saved Vehicles"
            onPress={() => {}}
          />
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          <SettingRow
            icon="bell.fill"
            label="Push Notifications"
            onPress={() => {}}
          />
          <Divider />
          <SettingRow
            icon="envelope.badge.fill"
            label="Email Notifications"
            onPress={() => {}}
          />
        </Section>

        {/* Support */}
        <Section title="Support">
          <SettingRow
            icon="questionmark.circle.fill"
            label="Help & FAQ"
            onPress={() => {}}
          />
          <Divider />
          <SettingRow
            icon="shield.fill"
            label="Privacy Policy"
            onPress={() => {}}
          />
          <Divider />
          <SettingRow
            icon="doc.text.fill"
            label="Terms of Service"
            onPress={() => {}}
          />
          <Divider />
          <SettingRow
            icon="info.circle.fill"
            label="App Version"
            value="1.0.0"
            chevron={false}
            onPress={undefined}
          />
        </Section>

        {/* Danger Zone */}
        <Section title="Account Actions">
          <SettingRow
            icon="rectangle.portrait.and.arrow.right.fill"
            label="Sign Out"
            danger
            chevron={false}
            onPress={handleSignOut}
          />
          <Divider />
          <SettingRow
            icon="trash.fill"
            label="Delete Account"
            danger
            chevron={false}
            onPress={() => {}}
          />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0c15',
  },
  content: {
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[16],
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
    backgroundColor: '#161624',
    borderRadius: Radius.xl,
    padding: Spacing[4],
    gap: Spacing[3],
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#4a7ae8',
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
    backgroundColor: '#161624',
    borderRadius: Radius.xl,
    overflow: 'hidden',
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
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconDanger: {
    backgroundColor: 'rgba(229,115,115,0.12)',
  },
  rowLabel: {
    flex: 1,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    color: C.foreground,
  },
  rowLabelDanger: {
    color: '#e57373',
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
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginLeft: Spacing[4] + 32 + Spacing[3],
  },
});
