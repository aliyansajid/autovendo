import { useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { useState } from 'react';
import { FontFamily, FontSize, Spacing, Radius, type ThemeColors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const FAQS = [
  {
    q: 'How do I list my vehicle?',
    a: 'You can list a vehicle by signing up as a dealer. Once registered, go to your dashboard and tap "Add Listing" to get started.',
  },
  {
    q: 'How do I contact a seller?',
    a: 'Open any vehicle listing and tap the "Contact Seller" button. You can send a message or call directly depending on the seller\'s preferences.',
  },
  {
    q: 'Is AutoVendo free to use?',
    a: 'Browsing and searching vehicles is completely free. Dealers pay a listing fee to publish their vehicles on the platform.',
  },
  {
    q: 'How do I save a vehicle?',
    a: 'Tap the heart icon on any listing to save it. You can view all saved vehicles from Settings → Saved Vehicles.',
  },
  {
    q: 'How do I reset my password?',
    a: 'On the login screen, tap "Forgot password?" and enter your email address. We\'ll send you a reset link.',
  },
  {
    q: 'Are the listings verified?',
    a: 'AutoVendo verifies dealer accounts. Private sellers are not verified, so we recommend meeting in person and doing proper checks before any transaction.',
  },
  {
    q: 'How do I delete my account?',
    a: 'Go to Settings → Account Actions → Delete Account. Note that this action is permanent and cannot be undone.',
  },
];

function FAQItem({ item, styles, C }: { item: typeof FAQS[number]; styles: ReturnType<typeof createStyles>; C: ThemeColors }) {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <Pressable
        style={({ pressed }) => [styles.faqRow, pressed && { opacity: 0.7 }]}
        onPress={() => setOpen((o) => !o)}
      >
        <Text style={styles.faqQ}>{item.q}</Text>
        <SymbolView
          name={open ? 'chevron.up' : 'chevron.down'}
          size={14}
          tintColor={C.mutedForeground}
        />
      </Pressable>
      {open && <Text style={styles.faqA}>{item.a}</Text>}
    </View>
  );
}

export default function HelpScreen() {
  const C = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <SymbolView name="chevron.left" size={20} tintColor={C.foreground} />
        </Pressable>
        <Text style={styles.title}>Help & FAQ</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Find answers to common questions below. If you need more help, contact our support team.
        </Text>

        <View style={styles.card}>
          {FAQS.map((item, i) => (
            <View key={i}>
              <FAQItem item={item} styles={styles} C={C} />
              {i < FAQS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <View style={styles.contactBox}>
          <SymbolView name="envelope.fill" size={20} tintColor={C.sidebarPrimary} />
          <View style={styles.contactText}>
            <Text style={styles.contactTitle}>Still need help?</Text>
            <Text style={styles.contactEmail}>support@autovendo.ch</Text>
          </View>
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
      borderBottomColor: C.border,
    },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    title: {
      fontFamily: FontFamily.sansSemiBold,
      fontSize: FontSize.md,
      color: C.foreground,
    },
    content: {
      padding: Spacing[4],
      gap: Spacing[4],
      paddingBottom: Spacing[16],
    },
    intro: {
      fontFamily: FontFamily.sans,
      fontSize: FontSize.base,
      color: C.mutedForeground,
      lineHeight: FontSize.base * 1.6,
    },
    card: {
      backgroundColor: C.card,
      borderRadius: Radius.xl,
      overflow: 'hidden',
    },
    faqRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing[4],
      paddingVertical: Spacing[4],
      gap: Spacing[3],
    },
    faqQ: {
      flex: 1,
      fontFamily: FontFamily.sansMedium,
      fontSize: FontSize.base,
      color: C.foreground,
      lineHeight: FontSize.base * 1.4,
    },
    faqA: {
      fontFamily: FontFamily.sans,
      fontSize: FontSize.sm,
      color: C.mutedForeground,
      lineHeight: FontSize.sm * 1.6,
      paddingHorizontal: Spacing[4],
      paddingBottom: Spacing[4],
    },
    divider: {
      height: 1,
      backgroundColor: C.border,
      marginHorizontal: Spacing[4],
    },
    contactBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing[3],
      backgroundColor: C.sidebarAccent,
      borderRadius: Radius.xl,
      padding: Spacing[4],
      borderWidth: 1,
      borderColor: C.border,
    },
    contactText: { gap: 2 },
    contactTitle: {
      fontFamily: FontFamily.sansMedium,
      fontSize: FontSize.base,
      color: C.foreground,
    },
    contactEmail: {
      fontFamily: FontFamily.sans,
      fontSize: FontSize.sm,
      color: C.sidebarPrimary,
    },
  });
}
