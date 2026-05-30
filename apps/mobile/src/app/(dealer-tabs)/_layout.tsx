import { Tabs } from 'expo-router';
import { View, Pressable, StyleSheet } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassView, GlassContainer, isGlassEffectAPIAvailable } from 'expo-glass-effect';
import { Colors } from '@/constants/theme';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const C = Colors.dark;

const TABS = [
  { name: 'index', symbol: 'chart.bar.fill' },
  { name: 'listings', symbol: 'car.fill' },
  { name: 'add', symbol: null },
  { name: 'leads', symbol: 'person.2.fill' },
  { name: 'profile', symbol: 'person.fill' },
] as const;

function DealerGlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const onPress = (route: (typeof state.routes)[number], isFocused: boolean) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  const regularTabs = state.routes.filter(r => r.name !== 'add');
  const addRoute = state.routes.find(r => r.name === 'add');
  const addIndex = state.routes.findIndex(r => r.name === 'add');
  const isAddFocused = state.index === addIndex;

  // Split into left and right of add button
  const leftRoutes = state.routes.slice(0, 2);
  const rightRoutes = state.routes.slice(3);

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      <GlassContainer spacing={10}>
        {/* Add button — separate GlassView, merges with tab bar via GlassContainer */}
        {addRoute && (
          <Pressable
            onPress={() => onPress(addRoute, isAddFocused)}
            style={styles.addWrapper}>
            <GlassView
              style={[styles.addBtn, isAddFocused && styles.addBtnActive]}
              colorScheme="dark"
              glassEffectStyle="regular"
              isInteractive>
              <SymbolView
                name="plus"
                size={24}
                tintColor="#ffffff"
                weight="semibold"
              />
            </GlassView>
          </Pressable>
        )}

        {/* Main tab bar */}
        <GlassView
          style={styles.tabBar}
          colorScheme="dark"
          glassEffectStyle="regular">
          {/* Left tabs */}
          {leftRoutes.map((route, index) => {
            const isFocused = state.index === index;
            const tab = TABS.find(t => t.name === route.name);
            const color = isFocused ? '#ffffff' : 'rgba(255,255,255,0.4)';
            return (
              <Pressable
                key={route.key}
                onPress={() => onPress(route, isFocused)}
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

          {/* Center spacer for add button */}
          <View style={styles.addSpacer} />

          {/* Right tabs */}
          {rightRoutes.map((route, index) => {
            const routeIndex = index + 3;
            const isFocused = state.index === routeIndex;
            const tab = TABS.find(t => t.name === route.name);
            const color = isFocused ? '#ffffff' : 'rgba(255,255,255,0.4)';
            return (
              <Pressable
                key={route.key}
                onPress={() => onPress(route, isFocused)}
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

export default function DealerTabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <DealerGlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: '#0c0c15' },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="listings" options={{ title: 'Listings' }} />
      <Tabs.Screen name="add" options={{ title: 'Add' }} />
      <Tabs.Screen name="leads" options={{ title: 'Leads' }} />
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
    paddingHorizontal: 24,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 32,
    paddingHorizontal: 8,
    paddingVertical: 10,
    overflow: 'hidden',
    width: '100%',
    alignItems: 'center',
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
  addSpacer: {
    width: 64,
  },
  addWrapper: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    zIndex: 10,
  },
  addBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  addBtnActive: {
    opacity: 0.85,
  },
});
