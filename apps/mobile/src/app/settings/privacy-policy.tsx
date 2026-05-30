import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { FontFamily, FontSize, Spacing, Radius, type ThemeColors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const SECTIONS = [
  {
    title: '1. Data We Collect',
    body: 'We collect information you provide directly, such as your name, email address, and vehicle listing details. We also collect usage data such as pages viewed, searches made, and interactions with listings.',
  },
  {
    title: '2. How We Use Your Data',
    body: 'Your data is used to provide and improve the AutoVendo service, send transactional emails (verification, password resets), and communicate updates about your account or listings.',
  },
  {
    title: '3. Data Sharing',
    body: 'We do not sell your personal data. We share data only with service providers necessary to operate our platform (e.g., email delivery, payment processing) and only to the extent required.',
  },
  {
    title: '4. Cookies & Tracking',
    body: 'AutoVendo uses cookies and similar technologies to maintain sessions and analyse platform usage. You can control cookie settings through your device or browser.',
  },
  {
    title: '5. Data Retention',
    body: 'We retain your data for as long as your account is active. You may request deletion of your account and associated data at any time from the settings screen.',
  },
  {
    title: '6. Your Rights',
    body: 'Under applicable data protection laws (including GDPR), you have the right to access, correct, or delete your personal data. Contact us at privacy@autovendo.ch to exercise these rights.',
  },
  {
    title: '7. Security',
    body: 'We implement industry-standard security measures including encrypted connections (HTTPS), hashed passwords, and regular security reviews to protect your data.',
  },
  {
    title: '8. Changes to This Policy',
    body: 'We may update this Privacy Policy from time to time. We will notify you of material changes via email or in-app notification.',
  },
];

export default function PrivacyPolicyScreen() {
  const C = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <SymbolView name="chevron.left" size={20} tintColor={C.foreground} />
        </Pressable>
        <Text style={styles.title}>Privacy Policy</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.updated}>Last updated: January 2025</Text>
        <Text style={styles.intro}>
          AutoVendo is committed to protecting your privacy. This policy explains what data we collect, how we use it, and your rights.
        </Text>
        {SECTIONS.map((s, i) => (
          <View key={i} style={styles.section}>
            <Text style={styles.sectionTitle}>{s.title}</Text>
            <Text style={styles.sectionBody}>{s.body}</Text>
          </View>
        ))}
        <View style={styles.contactBox}>
          <Text style={styles.contactText}>
            Questions? Contact us at{' '}
            <Text style={styles.contactEmail}>privacy@autovendo.ch</Text>
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
