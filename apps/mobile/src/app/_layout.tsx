import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useFonts } from 'expo-font';
import { useColorScheme } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    'Geist': require('../../assets/fonts/Geist/ttf/Geist-Regular.ttf'),
    'Geist-Medium': require('../../assets/fonts/Geist/ttf/Geist-Medium.ttf'),
    'Geist-SemiBold': require('../../assets/fonts/Geist/ttf/Geist-SemiBold.ttf'),
    'Geist-Bold': require('../../assets/fonts/Geist/ttf/Geist-Bold.ttf'),
    'GeistMono': require('../../assets/fonts/GeistMono/ttf/GeistMono-Regular.ttf'),
    'GeistMono-Medium': require('../../assets/fonts/GeistMono/ttf/GeistMono-Medium.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}
