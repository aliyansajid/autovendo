import { Tabs } from 'expo-router';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassView, GlassContainer, isGlassEffectAPIAvailable } from 'expo-glass-effect';
import { useTheme } from '@/hooks/use-theme';

// Minimal shape of the tab bar props expo-router passes; the standalone
// @react-navigation/bottom-tabs types aren't resolvable in this setup.
type BottomTabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  descriptors: Record<string, { options: Record<string, unknown> }>;
  navigation: {
    emit: (e: { type: string; target: string; canPreventDefault: boolean }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
};

const TABS = [
  { name: 'index', title: 'Start', symbol: 'house.fill' },
  { name: 'search', title: 'Suchen', symbol: 'magnifyingglass' },
  { name: 'dealers', title: 'Händler', symbol: 'building.2.fill' },
  { name: 'profile', title: 'Profil', symbol: 'person.fill' },
] as const;

function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const C = useTheme();
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
            const color = isFocused ? C.foreground : C.mutedForeground;

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
  const C = useTheme();

  return (
    <Tabs
      tabBar={(props) => <GlassTabBar {...(props as unknown as BottomTabBarProps)} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: C.background },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Start' }} />
      <Tabs.Screen name="search" options={{ title: 'Suchen' }} />
      <Tabs.Screen name="dealers" options={{ title: 'Händler' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
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
