import { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

const BG = '#0c0c15';

type Slide = {
  id: string;
  symbol: string;
  accent: string;
  label: string;
  title: string;
  description: string;
};

const SLIDES: Slide[] = [
  {
    id: '1',
    symbol: 'car.fill',
    accent: '#1e4da6',
    label: 'Welcome',
    title: 'Welcome to AutoVendo',
    description:
      'The premium marketplace for buying and selling vehicles. Your next car is just a tap away.',
  },
  {
    id: '2',
    symbol: 'magnifyingglass',
    accent: '#4a7ae8',
    label: 'Discover',
    title: 'Find Your Dream Car',
    description:
      'Browse thousands of verified listings. Filter by make, model, price, fuel type and more.',
  },
  {
    id: '3',
    symbol: 'tag.fill',
    accent: '#1a9e78',
    label: 'Sell',
    title: 'Sell with Confidence',
    description:
      'List as a dealer or private seller. Reach thousands of buyers with professional listings.',
  },
  {
    id: '4',
    symbol: 'checkmark.seal.fill',
    accent: '#1e4da6',
    label: 'Start',
    title: "You're All Set",
    description:
      'Create a free account or sign in to start exploring the best vehicles available.',
  },
];

// ─── Animated dot ────────────────────────────────────────────────────────────

function Dot({ active, accent }: { active: boolean; accent: string }) {
  const width = useSharedValue(active ? 24 : 8);
  const opacity = useSharedValue(active ? 1 : 0.3);

  useEffect(() => {
    width.value = withTiming(active ? 24 : 8, { duration: 280 });
    opacity.value = withTiming(active ? 1 : 0.3, { duration: 280 });
  }, [active]);

  const animStyle = useAnimatedStyle(() => ({
    width: width.value,
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[{ height: 6, borderRadius: 3, backgroundColor: accent, marginHorizontal: 3 }, animStyle]}
    />
  );
}

// ─── Slide visual ─────────────────────────────────────────────────────────────

function SlideVisual({ accent, symbol }: { accent: string; symbol: string }) {
  return (
    <View style={styles.visualArea}>
      {/* Concentric glow rings */}
      <View style={[styles.ring, styles.ring3, { borderColor: accent + '18' }]} />
      <View style={[styles.ring, styles.ring2, { borderColor: accent + '28' }]} />
      <View style={[styles.ring, styles.ring1, { borderColor: accent + '45' }]} />

      {/* Icon circle */}
      <View style={[styles.iconCircle, { backgroundColor: accent + '22' }]}>
        <View style={[styles.iconInner, { backgroundColor: accent + '30' }]}>
          <SymbolView
            name={symbol as any}
            size={52}
            tintColor={accent}
            weight="semibold"
          />
        </View>
      </View>
    </View>
  );
}

// ─── Single slide ─────────────────────────────────────────────────────────────

function SlideItem({ item, slideWidth }: { item: Slide; slideWidth: number }) {
  return (
    <View style={[styles.slide, { width: slideWidth }]}>
      <SlideVisual accent={item.accent} symbol={item.symbol} />

      <View style={styles.content}>
        <Text style={[styles.label, { color: item.accent }]}>{item.label.toUpperCase()}</Text>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const isLast = currentIndex === SLIDES.length - 1;
  const accent = SLIDES[currentIndex].accent;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 60 });

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]?.index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    [],
  );

  const goNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  };

  const skip = () => {
    flatListRef.current?.scrollToIndex({ index: SLIDES.length - 1, animated: true });
  };

  return (
    <View style={styles.container}>
      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SlideItem item={item} slideWidth={width} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig.current}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
      />

      {/* Fixed controls */}
      <SafeAreaView edges={['bottom']} style={styles.controls}>
        {/* Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <Dot key={i} active={i === currentIndex} accent={accent} />
          ))}
        </View>

        {isLast ? (
          /* Last slide CTAs */
          <View style={styles.ctaGroup}>
            <Pressable
              style={[styles.primaryBtn, { backgroundColor: accent }]}
              onPress={() => router.replace('/(auth)/register' as any)}>
              <Text style={styles.primaryBtnText}>Create Account</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryBtn}
              onPress={() => router.replace('/(auth)/login' as any)}>
              <Text style={styles.secondaryBtnText}>
                Already have an account?{' '}
                <Text style={[styles.secondaryBtnHighlight, { color: accent }]}>Sign In</Text>
              </Text>
            </Pressable>
          </View>
        ) : (
          /* Skip + Next */
          <View style={styles.navRow}>
            <Pressable onPress={skip} hitSlop={16}>
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
            <Pressable
              style={[styles.nextBtn, { backgroundColor: accent }]}
              onPress={goNext}>
              <SymbolView name="arrow.right" size={22} tintColor="#fff" weight="semibold" />
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  // Slide
  slide: {
    flex: 1,
    paddingHorizontal: Spacing[6],
  },

  // Visual
  visualArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing[8],
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
  },
  ring1: {
    width: 170,
    height: 170,
    borderRadius: 85,
  },
  ring2: {
    width: 250,
    height: 250,
    borderRadius: 125,
  },
  ring3: {
    width: 330,
    height: 330,
    borderRadius: 165,
  },
  iconCircle: {
    width: 108,
    height: 108,
    borderRadius: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Content
  content: {
    paddingBottom: Spacing[4],
    paddingTop: Spacing[8],
    gap: Spacing[3],
  },
  label: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: FontSize.xs,
    letterSpacing: 1.5,
  },
  title: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize['3xl'],
    color: '#ffffff',
    lineHeight: 40,
  },
  description: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 24,
  },

  // Controls
  controls: {
    paddingHorizontal: Spacing[6],
    paddingBottom: Spacing[4],
    gap: Spacing[6],
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing[4],
  },

  // Nav row (skip + next)
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skipText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.45)',
  },
  nextBtn: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Last slide CTAs
  ctaGroup: {
    gap: Spacing[4],
  },
  primaryBtn: {
    height: 54,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: FontSize.md,
    color: '#ffffff',
  },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing[2],
  },
  secondaryBtnText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.45)',
  },
  secondaryBtnHighlight: {
    fontFamily: FontFamily.sansSemiBold,
  },
});
