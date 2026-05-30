import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Colors } from '@/constants/theme';

const C = Colors.dark;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0c0c15',
          borderTopColor: 'rgba(255,255,255,0.08)',
        },
        tabBarActiveTintColor: C.primary,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.35)',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <SymbolView name="house.fill" size={size} tintColor={color} />
          ),
        }}
      />
    </Tabs>
  );
}
