import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { useTheme } from "@/hooks/use-theme";

// Centralized icon wrapper. Today it renders SF Symbols (iOS-first stack);
// swapping to a cross-platform set later means changing only this file.
export type IconName = SymbolViewProps["name"];

export function Icon({
  name,
  size = 20,
  color,
  weight = "regular",
}: {
  name: IconName;
  size?: number;
  color?: string;
  weight?: SymbolViewProps["weight"];
}) {
  const C = useTheme();
  return (
    <SymbolView
      name={name}
      size={size}
      tintColor={color ?? C.foreground}
      weight={weight}
      resizeMode="scaleAspectFit"
    />
  );
}
