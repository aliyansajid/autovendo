import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { Stack } from 'expo-router';
import { FontFamily, FontSize, Spacing, type ThemeColors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function MyVehiclesScreen() {
  const C = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: 'Meine Fahrzeuge' }} />
      <View style={styles.empty}>
        <View style={styles.emptyIcon}>
          <SymbolView name="car.fill" size={36} tintColor={C.mutedForeground} />
        </View>
        <Text style={styles.emptyTitle}>Noch keine Inserate</Text>
        <Text style={styles.emptyBody}>Ihre veröffentlichten Fahrzeuge erscheinen hier.</Text>
      </View>
    </View>
  );
}

function createStyles(C: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
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
