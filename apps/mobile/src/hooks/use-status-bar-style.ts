import { useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { setStatusBarStyle, type StatusBarStyle } from "expo-status-bar";

/**
 * Apply a status bar icon style while this screen is focused, then restore the
 * app-wide default ("dark" icons, for white backgrounds) when it blurs.
 *
 * Needed because screens in a tab/stack navigator stay mounted: a screen with a
 * dark header (light icons) would otherwise leave the status bar light when the
 * user navigates to a plain white screen, making the icons invisible. With this
 * hook, only dark-background screens opt into "light"; every white screen gets
 * the correct dark icons automatically without any per-screen code.
 */
export function useStatusBarStyle(style: StatusBarStyle) {
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle(style, true);
      return () => setStatusBarStyle("dark", true);
    }, [style]),
  );
}
