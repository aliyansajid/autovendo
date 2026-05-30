import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { FontFamily, FontSize, Spacing, Radius, type ThemeColors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function SavedVehiclesScreen() {
  const C = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <SymbolView name="chevron.left" size={20} tintColor={C.foreground} />
        </Pressable>
        <Text style={styles.title}>Saved Vehicles</Text>
        <View style={styles.backBtn} />
      </View>
      <View style={styles.empty}>
        <View style={styles.emptyIcon}>
          <SymbolView name="heart.fill" size={36} tintColor={C.mutedForeground} />
        </View>
        <Text style={styles.emptyTitle}>No saved vehicles</Text>
        <Text style={styles.emptyBody}>Vehicles you save will appear here for quick access.</Text>
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
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    title: {
      fontFamily: FontFamily.sansSemiBold,
      fontSize: FontSize.md,
      color: C.foreground,
    },
    empty: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing[3],
      padding: Spacing[8],
    },
    emptyIcon: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: C.secondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing[2],
    },
    emptyTitle: {
      fontFamily: FontFamily.sansSemiBold,
      fontSize: FontSize.lg,
      color: C.foreground,
    },
    emptyBody: {
      fontFamily: FontFamily.sans,
      fontSize: FontSize.base,
      color: C.mutedForeground,
      textAlign: 'center',
    },
  });
}
