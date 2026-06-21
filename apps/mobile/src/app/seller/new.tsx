import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { FontFamily, FontSize, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { openUrl } from "@/lib/contact";

export default function SellerNewListing() {
  const C = useTheme();
  return (
    <View style={[styles.root, { backgroundColor: C.background }]}>
      <SafeAreaView edges={["top"]} style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.back}>
          <Icon name="chevron.left" size={22} color={C.foreground} />
        </Pressable>
      </SafeAreaView>
      <View style={styles.body}>
        <View style={[styles.tile, { backgroundColor: C.secondary }]}>
          <Icon name="square.and.pencil" size={44} color={C.primary} />
        </View>
        <Text style={[styles.title, { color: C.foreground }]}>Inserat erstellen</Text>
        <Text style={[styles.text, { color: C.mutedForeground }]}>
          Das native Erstellen von Inseraten wird gerade fertiggestellt. In der Zwischenzeit können Sie Ihr
          Inserat auf autovendo.ch erfassen.
        </Text>
        <Button
          label="Auf autovendo.ch erstellen"
          icon="safari.fill"
          onPress={() => openUrl("https://seller.autovendo.ch/de/dashboard/vehicles/new")}
          size="lg"
          fullWidth
          style={{ marginTop: Spacing[6] }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: Spacing[4], paddingTop: Spacing[2] },
  back: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  body: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: Spacing[6] },
  tile: { width: 104, height: 104, borderRadius: Radius.xl, alignItems: "center", justifyContent: "center", marginBottom: Spacing[6] },
  title: { fontFamily: FontFamily.sansBold, fontSize: FontSize.xl, letterSpacing: -0.5, textAlign: "center" },
  text: { fontFamily: FontFamily.sans, fontSize: FontSize.base, textAlign: "center", lineHeight: FontSize.base * 1.55, marginTop: Spacing[3] },
});
