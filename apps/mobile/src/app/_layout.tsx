import "@/global.css";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { FavoritesProvider } from "@/lib/favorites";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Geist: require("../../assets/fonts/Geist/ttf/Geist-Regular.ttf"),
    "Geist-Medium": require("../../assets/fonts/Geist/ttf/Geist-Medium.ttf"),
    "Geist-SemiBold": require("../../assets/fonts/Geist/ttf/Geist-SemiBold.ttf"),
    "Geist-Bold": require("../../assets/fonts/Geist/ttf/Geist-Bold.ttf"),
    GeistMono: require("../../assets/fonts/GeistMono/ttf/GeistMono-Regular.ttf"),
    "GeistMono-Medium": require("../../assets/fonts/GeistMono/ttf/GeistMono-Medium.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <FavoritesProvider>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="vehicle/[id]" options={{ presentation: "card" }} />
            <Stack.Screen name="dealer/[id]" options={{ presentation: "card" }} />
          </Stack>
        </FavoritesProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
