import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { authClient } from '@/lib/auth-client';
import { Colors, FontFamily, FontSize } from '@/constants/theme';

const C = Colors.dark;

export default function VerifySuccessScreen() {
  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if (data?.user) {
        router.replace('/(tabs)' as any);
      } else {
        router.replace('/(auth)/login' as any);
      }
    });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <SymbolView name="checkmark.seal.fill" size={56} tintColor="#4a7ae8" />
      </View>
      <Text style={styles.title}>Email verified!</Text>
      <Text style={styles.subtitle}>Taking you in…</Text>
      <ActivityIndicator color="#4a7ae8" style={{ marginTop: 24 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0c15',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(74,122,232,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize['2xl'],
    color: C.foreground,
  },
  subtitle: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    color: C.mutedForeground,
  },
});
