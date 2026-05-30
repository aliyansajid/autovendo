import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { useColorScheme } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
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
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
