import { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  type ViewToken,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { FontFamily, FontSize, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Icon, type IconName } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { storage, STORAGE_KEYS } from "@/lib/storage";

type Slide = {
  id: string;
  icon: IconName;
  title: string;
  description: string;
};

const SLIDES: Slide[] = [
  {
    id: "1",
    icon: "car.2.fill",
    title: "Tausende Fahrzeuge an einem Ort",
    description:
      "Entdecken Sie Autos, Wohnmobile und Nutzfahrzeuge von Händlern und Privatpersonen in der ganzen Schweiz.",
  },
  {
    id: "2",
    icon: "slider.horizontal.3",
    title: "Finden Sie genau das Richtige",
    description:
      "Filtern Sie nach Marke, Preis, Kilometerstand, Treibstoff und vielem mehr – in nur wenigen Schritten.",
  },
  {
    id: "3",
    icon: "tag.fill",
    title: "Verkaufen leicht gemacht",
    description:
      "Inserieren Sie als Privatperson oder Händler und erreichen Sie tausende Käuferinnen und Käufer.",
  },
];

export default function OnboardingScreen() {
  const C = useTheme();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);
  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 60 });

  const isLast = index === SLIDES.length - 1;

  const onViewable = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]?.index != null) setIndex(viewableItems[0].index);
  }, []);

  const finish = useCallback(async () => {
    await storage.set(STORAGE_KEYS.onboardingSeen, true);
    router.replace("/(tabs)");
  }, []);

  const next = () => {
    if (isLast) finish();
    else listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  };

  return (
    <View style={[styles.root, { backgroundColor: C.background }]}>
      <SafeAreaView edges={["top"]} style={styles.topBar}>
        <Text style={[styles.wordmark, { color: C.foreground }]}>
          Auto<Text style={{ color: C.primary }}>Vendo</Text>
        </Text>
        {!isLast && (
          <Pressable onPress={finish} hitSlop={12}>
            <Text style={[styles.skip, { color: C.mutedForeground }]}>Überspringen</Text>
          </Pressable>
        )}
      </SafeAreaView>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(s) => s.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={viewConfig.current}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.iconTile, { backgroundColor: C.secondary }]}>
              <Icon name={item.icon} size={56} color={C.primary} weight="semibold" />
            </View>
            <Text style={[styles.title, { color: C.foreground }]}>{item.title}</Text>
            <Text style={[styles.description, { color: C.mutedForeground }]}>{item.description}</Text>
          </View>
        )}
      />

      <SafeAreaView edges={["bottom"]} style={styles.controls}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  width: i === index ? 22 : 7,
                  backgroundColor: i === index ? C.primary : C.border,
                },
              ]}
            />
          ))}
        </View>
        <Button label={isLast ? "Loslegen" : "Weiter"} onPress={next} size="lg" fullWidth />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing[5],
  },
  wordmark: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.lg,
    letterSpacing: -0.4,
  },
  skip: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.sm,
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing[8],
    gap: Spacing[5],
  },
  iconTile: {
    width: 132,
    height: 132,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing[4],
  },
  title: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize["2xl"],
    textAlign: "center",
    letterSpacing: -0.5,
    lineHeight: FontSize["2xl"] * 1.2,
  },
  description: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    textAlign: "center",
    lineHeight: FontSize.base * 1.5,
  },
  controls: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[4],
    gap: Spacing[6],
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing[2],
  },
  dot: {
    height: 7,
    borderRadius: 4,
  },
});
