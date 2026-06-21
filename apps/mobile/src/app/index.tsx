import { useEffect, useState } from "react";
import { View } from "react-native";
import { Redirect } from "expo-router";
import { storage, STORAGE_KEYS } from "@/lib/storage";
import { useTheme } from "@/hooks/use-theme";

// Decides the first screen: onboarding (once) → otherwise straight into the
// app. No account is required to browse, so we never gate on a session here.
export default function Index() {
  const C = useTheme();
  const [seen, setSeen] = useState<boolean | null>(null);

  useEffect(() => {
    storage.get<boolean>(STORAGE_KEYS.onboardingSeen).then((v) => setSeen(v === true));
  }, []);

  if (seen === null) {
    return <View style={{ flex: 1, backgroundColor: C.background }} />;
  }

  return <Redirect href={seen ? "/(tabs)" : "/onboarding"} />;
}
