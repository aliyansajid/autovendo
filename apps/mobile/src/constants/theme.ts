import "@/global.css";

export const Colors = {
  light: {
    background: "#ffffff",
    foreground: "#111118",
    card: "#ffffff",
    cardForeground: "#111118",
    popover: "#ffffff",
    popoverForeground: "#111118",
    primary: "#1e4da6",
    primaryForeground: "#eef2ff",
    secondary: "#f4f4f6",
    secondaryForeground: "#2d2d38",
    muted: "#f4f4f6",
    mutedForeground: "#717180",
    accent: "#f4f4f6",
    accentForeground: "#2d2d38",
    destructive: "#d4431e",
    border: "#e8e8ec",
    input: "#e8e8ec",
    ring: "#b5b5bd",
    sidebar: "#f9f9f9",
    sidebarForeground: "#111118",
    sidebarPrimary: "#2c5bc8",
    sidebarPrimaryForeground: "#eef2ff",
    sidebarAccent: "#f4f4f6",
    sidebarAccentForeground: "#2d2d38",
    sidebarBorder: "#e8e8ec",
    rating: "#f9a602",
  },
  dark: {
    background: "#111118",
    foreground: "#f9f9f9",
    card: "#2d2d38",
    cardForeground: "#f9f9f9",
    popover: "#2d2d38",
    popoverForeground: "#f9f9f9",
    primary: "#1e4da6",
    primaryForeground: "#eef2ff",
    secondary: "#3a3a46",
    secondaryForeground: "#f9f9f9",
    muted: "#3a3a46",
    mutedForeground: "#aaaabc",
    accent: "#3a3a46",
    accentForeground: "#f9f9f9",
    destructive: "#e8956c",
    border: "rgba(255, 255, 255, 0.10)",
    input: "rgba(255, 255, 255, 0.15)",
    ring: "#8d8d95",
    sidebar: "#2d2d38",
    sidebarForeground: "#f9f9f9",
    sidebarPrimary: "#4a7ae8",
    sidebarPrimaryForeground: "#eef2ff",
    sidebarAccent: "#3a3a46",
    sidebarAccentForeground: "#f9f9f9",
    sidebarBorder: "rgba(255, 255, 255, 0.10)",
    rating: "#f9a602",
  },
} as const;

export type ColorScheme = "light" | "dark";
export type ThemeColors = typeof Colors.light;
export type ThemeColorKey = keyof ThemeColors;

export const FontFamily = {
  sans: "Geist",
  sansMedium: "Geist-Medium",
  sansSemiBold: "Geist-SemiBold",
  sansBold: "Geist-Bold",
  mono: "GeistMono",
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  "2xl": 28,
  "3xl": 34,
} as const;

export const LineHeight = {
  tight: 1.2,
  snug: 1.35,
  normal: 1.5,
  relaxed: 1.625,
} as const;

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
} as const;

export const Spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const Shadow = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;
