import { Tabs } from 'expo-router';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassView, GlassContainer, isGlassEffectAPIAvailable } from 'expo-glass-effect';
import { Colors } from '@/constants/theme';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const C = Colors.dark;

const TABS = [
  { name: 'index', title: 'Home', symbol: 'house.fill' },
  { name: 'search', title: 'Search', symbol: 'magnifyingglass' },
  { name: 'profile', title: 'Profile', symbol: 'person.fill' },
] as const;

function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const glassAvailable = isGlassEffectAPIAvailable();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      <GlassContainer spacing={0}>
        <GlassView
          style={styles.tabBar}
          colorScheme="dark"
          glassEffectStyle="regular"
        >
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const tab = TABS.find(t => t.name === route.name);
            const color = isFocused ? '#ffffff' : 'rgba(255,255,255,0.4)';

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                style={styles.tab}>
                <View style={[styles.iconWrap, isFocused && styles.iconWrapActive]}>
                  <SymbolView
                    name={tab?.symbol as any ?? 'circle'}
                    size={22}
                    tintColor={color}
                    weight={isFocused ? 'semibold' : 'regular'}
                  />
                </View>
              </Pressable>
            );
          })}
        </GlassView>
      </GlassContainer>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: '#0c0c15' },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="search" options={{ title: 'Search' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 32,
    paddingHorizontal: 8,
    paddingVertical: 10,
    overflow: 'hidden',
    width: '100%',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 48,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
});
