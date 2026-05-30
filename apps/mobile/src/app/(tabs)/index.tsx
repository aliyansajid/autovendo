import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontFamily, FontSize, Spacing } from '@/constants/theme';

const C = Colors.dark;

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Text style={styles.text}>AutoVendo</Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0c0c15' },
  safe: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize['2xl'],
    color: C.primary,
    letterSpacing: 0.5,
  },
});
