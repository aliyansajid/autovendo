import { useCallback, useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, Alert, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { FontFamily, FontSize, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import {
  fetchSellerVehicles,
  deleteSellerVehicle,
  updateSellerVehicle,
  createSellerListingCheckout,
  type OwnedVehicle,
} from "@/lib/account";
import { openCheckout } from "@/lib/checkout";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { OwnedVehicleCard } from "@/components/ui/owned-vehicle-card";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";

export default function SellerDashboard() {
  const C = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);

  const [items, setItems] = useState<OwnedVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(false);
    try {
      const res = await fetchSellerVehicles({ pageSize: 50, sort: "created-desc" });
      setItems(res.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Reload whenever the dashboard regains focus (e.g. returning from the form).
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const publish = useCallback(
    async (v: OwnedVehicle) => {
      const checkout = async (planId: "standard" | "best_value") => {
        try {
          const url = await createSellerListingCheckout({ vehicleId: v.id, planId, locale: "de" });
          await openCheckout(url);
          load(true);
        } catch {
          Alert.alert("Fehler", "Zahlung konnte nicht gestartet werden.");
        }
      };
      Alert.alert("Inserat veröffentlichen", "Wählen Sie einen Tarif", [
        { text: "Standard – CHF 19/Monat", onPress: () => checkout("standard") },
        { text: "Best Value – CHF 49 (bis verkauft)", onPress: () => checkout("best_value") },
        { text: "Abbrechen", style: "cancel" },
      ]);
    },
    [load],
  );

  const openMenu = useCallback(
    (v: OwnedVehicle) => {
      const buttons: { text: string; style?: "cancel" | "destructive"; onPress?: () => void }[] = [];

      buttons.push({ text: "Bearbeiten", onPress: () => router.push(`/seller/${v.id}`) });
      if (v.status === "DRAFT") {
        buttons.push({ text: "Veröffentlichen", onPress: () => publish(v) });
      }
      if (v.status === "PUBLISHED") {
        buttons.push({
          text: "Als verkauft markieren",
          onPress: async () => {
            try {
              await updateSellerVehicle(v.id, { status: "SOLD" });
              load(true);
            } catch {
              Alert.alert("Fehler", "Aktion fehlgeschlagen.");
            }
          },
        });
      }
      buttons.push({
        text: "Löschen",
        style: "destructive",
        onPress: () =>
          Alert.alert("Inserat löschen", "Dieses Inserat wirklich löschen?", [
            { text: "Abbrechen", style: "cancel" },
            {
              text: "Löschen",
              style: "destructive",
              onPress: async () => {
                try {
                  await deleteSellerVehicle(v.id);
                  setItems((prev) => prev.filter((x) => x.id !== v.id));
                } catch {
                  Alert.alert("Fehler", "Löschen fehlgeschlagen.");
                }
              },
            },
          ]),
      });
      buttons.push({ text: "Abbrechen", style: "cancel" });

      const title = `${v.make} ${v.model ?? ""}`.trim();
      Alert.alert(title, undefined, buttons);
    },
    [load, publish],
  );

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]} style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.back}>
          <Icon name="chevron.left" size={22} color={C.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: C.foreground }]}>Meine Inserate</Text>
        <Pressable onPress={() => router.push("/seller/new")} hitSlop={8} style={styles.back}>
          <Icon name="plus" size={20} color={C.primary} weight="semibold" />
        </Pressable>
      </SafeAreaView>

      {error ? (
        <ErrorState onRetry={() => load()} />
      ) : loading ? (
        <View style={styles.listPad}>
          {[0, 1, 2].map((k) => (
            <Skeleton key={k} width="100%" height={88} radius={Radius.lg} style={{ marginBottom: Spacing[3] }} />
          ))}
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(v) => v.id}
          contentContainerStyle={styles.listPad}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: Spacing[3] }} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={C.mutedForeground} />}
          renderItem={({ item }) => (
            <OwnedVehicleCard vehicle={item} onPress={() => router.push(`/seller/${item.id}`)} onMenu={() => openMenu(item)} />
          )}
          ListFooterComponent={
            items.length > 0 ? (
              <Button label="Neues Inserat" icon="plus" onPress={() => router.push("/seller/new")} variant="secondary" style={{ marginTop: Spacing[4] }} fullWidth />
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              icon="car"
              title="Noch keine Inserate"
              message="Erstellen Sie Ihr erstes Inserat in wenigen Minuten."
              actionLabel="Neues Inserat"
              onAction={() => router.push("/seller/new")}
            />
          }
        />
      )}
    </View>
  );
}

function createStyles(C: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: C.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: Spacing[4],
      paddingTop: Spacing[2],
      paddingBottom: Spacing[3],
    },
    back: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
    title: { fontFamily: FontFamily.sansBold, fontSize: FontSize.lg, letterSpacing: -0.4 },
    listPad: { paddingHorizontal: Spacing[5], paddingTop: Spacing[2], flexGrow: 1, paddingBottom: Spacing[10] },
  });
}
