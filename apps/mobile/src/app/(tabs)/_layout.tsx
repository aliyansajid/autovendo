import { Tabs, router } from 'expo-router';
import { View, Pressable, StyleSheet } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassView, GlassContainer } from 'expo-glass-effect';
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

  // Inject a prominent "+" (sell) button in the middle of the tab row.
  const mid = Math.floor(state.routes.length / 2);

  const renderTab = (route: { key: string; name: string }, index: number) => {
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
      <Pressable key={route.key} onPress={onPress} style={styles.tab}>
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
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      <GlassContainer spacing={0}>
        <GlassView style={styles.tabBar} colorScheme="dark" glassEffectStyle="regular">
          {state.routes.slice(0, mid).map((route, i) => renderTab(route, i))}

          {/* Center button → create a new listing (auth + role resolved inside) */}
          <Pressable style={styles.tab} onPress={() => router.push('/listing/new')}>
            <View style={[styles.sellBtn, { backgroundColor: C.primary }]}>
              <SymbolView name="plus" size={24} tintColor={C.primaryForeground} weight="semibold" />
            </View>
          </Pressable>

          {state.routes.slice(mid).map((route, i) => renderTab(route, i + mid))}
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
  sellBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
});
