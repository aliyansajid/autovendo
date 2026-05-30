import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { FontFamily, FontSize, Spacing, Radius, type ThemeColors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: 'By using AutoVendo, you agree to these Terms of Service. If you do not agree, please discontinue use of the platform immediately.',
  },
  {
    title: '2. Eligibility',
    body: 'You must be at least 18 years old to create an account and use AutoVendo. By registering, you confirm that you meet this requirement.',
  },
  {
    title: '3. User Accounts',
    body: 'You are responsible for maintaining the confidentiality of your login credentials. You agree to notify us immediately of any unauthorised access to your account.',
  },
  {
    title: '4. Listings & Content',
    body: 'All vehicle listings must be accurate and lawful. You may not post misleading, fraudulent, or illegal content. AutoVendo reserves the right to remove any listing that violates these terms.',
  },
  {
    title: '5. Prohibited Activities',
    body: 'You may not use AutoVendo to spam other users, scrape data without permission, impersonate others, or conduct any activity that violates applicable laws or regulations.',
  },
  {
    title: '6. Fees & Payments',
    body: 'Listing fees are charged at the time of publication. All fees are non-refundable unless otherwise stated. Subscription plans are billed according to the selected cycle.',
  },
  {
    title: '7. Limitation of Liability',
    body: 'AutoVendo is a marketplace and is not party to any transaction between buyers and sellers. We are not liable for the accuracy of listings, the condition of vehicles, or any disputes arising from transactions.',
  },
  {
    title: '8. Termination',
    body: 'We reserve the right to suspend or terminate any account that violates these terms, engages in fraudulent activity, or harms the platform or its users.',
  },
  {
    title: '9. Governing Law',
    body: 'These terms are governed by the laws of Switzerland. Any disputes shall be resolved in the courts of Zurich, Switzerland.',
  },
  {
    title: '10. Changes to Terms',
    body: 'We may modify these Terms of Service at any time. Continued use of the platform after changes constitutes acceptance of the updated terms.',
  },
];

export default function TermsScreen() {
  const C = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <SymbolView name="chevron.left" size={20} tintColor={C.foreground} />
        </Pressable>
        <Text style={styles.title}>Terms of Service</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.updated}>Last updated: January 2025</Text>
        <Text style={styles.intro}>
          These Terms of Service govern your use of the AutoVendo mobile application and website. Please read them carefully.
        </Text>
        {SECTIONS.map((s, i) => (
          <View key={i} style={styles.section}>
            <Text style={styles.sectionTitle}>{s.title}</Text>
            <Text style={styles.sectionBody}>{s.body}</Text>
          </View>
        ))}
        <View style={styles.contactBox}>
          <Text style={styles.contactText}>
            For legal inquiries, contact us at{' '}
            <Text style={styles.contactEmail}>legal@autovendo.ch</Text>
          </Text>
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
    updated: {
      fontFamily: FontFamily.sans,
      fontSize: FontSize.sm,
      color: C.mutedForeground,
    },
    intro: {
      fontFamily: FontFamily.sans,
      fontSize: FontSize.base,
      color: C.mutedForeground,
      lineHeight: FontSize.base * 1.6,
    },
    section: { gap: Spacing[2] },
    sectionTitle: {
      fontFamily: FontFamily.sansSemiBold,
      fontSize: FontSize.base,
      color: C.foreground,
    },
    sectionBody: {
      fontFamily: FontFamily.sans,
      fontSize: FontSize.base,
      color: C.mutedForeground,
      lineHeight: FontSize.base * 1.6,
    },
    contactBox: {
      backgroundColor: C.card,
      borderRadius: Radius.xl,
      padding: Spacing[4],
    },
    contactText: {
      fontFamily: FontFamily.sans,
      fontSize: FontSize.base,
      color: C.mutedForeground,
      lineHeight: FontSize.base * 1.6,
    },
    contactEmail: { color: C.sidebarPrimary },
  });
}
