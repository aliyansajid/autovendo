import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { Colors, FontFamily, FontSize, Spacing, Radius } from '@/constants/theme';

const C = Colors.dark;

export default function VerifyEmailScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <SymbolView name="envelope.badge.fill" size={48} tintColor="#4a7ae8" />
          </View>

          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.subtitle}>
            We sent a verification link to your email address. Click the link to activate your account.
          </Text>

          <View style={styles.note}>
            <SymbolView name="info.circle" size={14} tintColor={C.mutedForeground} />
            <Text style={styles.noteText}>
              Didn't get it? Check your spam folder or try signing in to resend.
            </Text>
          </View>

          <Pressable style={styles.btn} onPress={() => router.replace('/(auth)/login' as any)}>
            <Text style={styles.btnText}>Back to sign in</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0c0c15' },
  safe: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing[6],
    gap: Spacing[4],
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(74,122,232,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[2],
  },
  title: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize['2xl'],
    color: C.foreground,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    color: C.mutedForeground,
    textAlign: 'center',
    lineHeight: 22,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[2],
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: Radius.lg,
    padding: Spacing[3],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  noteText: {
    flex: 1,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    color: C.mutedForeground,
    lineHeight: 18,
  },
  btn: {
    width: '100%',
    height: 50,
    borderRadius: Radius.xl,
    backgroundColor: '#1e4da6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing[2],
  },
  btnText: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: FontSize.base,
    color: '#fff',
  },
});
