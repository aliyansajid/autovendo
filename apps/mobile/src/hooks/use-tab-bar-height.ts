import { useSafeAreaInsets } from "react-native-safe-area-context";

// Mirrors GlassTabBar in (tabs)/_layout.tsx:
//   container paddingBottom: Math.max(insets.bottom, 16)
//   pill: paddingVertical(10) * 2 + iconWrap height(40) = 60px
const PILL_HEIGHT = 80;

export function useTabBarHeight(): number {
  const insets = useSafeAreaInsets();
  return Math.max(insets.bottom, 16) + PILL_HEIGHT;
}
