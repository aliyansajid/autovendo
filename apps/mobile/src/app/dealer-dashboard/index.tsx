import { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, Alert, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { FontFamily, FontSize, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import {
  fetchDealerVehicles,
  fetchDealerSubscription,
  updateDealerVehicle,
  deleteDealerVehicle,
  createDealerCheckout,
  createDealerBillingPortal,
  type OwnedVehicle,
  type DealerSubscriptionInfo,
} from "@/lib/account";
import { openCheckout } from "@/lib/checkout";
import { formatPrice } from "@/lib/format";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { OwnedVehicleCard } from "@/components/ui/owned-vehicle-card";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";

const ACTIVE = ["active", "trialing"];

export default function DealerDashboard() {
  const C = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);

  const [sub, setSub] = useState<DealerSubscriptionInfo | null>(null);
  const [items, setItems] = useState<OwnedVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(false);
    try {
      const [s, v] = await Promise.all([
        fetchDealerSubscription(),
        fetchDealerVehicles({ pageSize: 50, sort: "created-desc" }),
      ]);
      setSub(s);
      setItems(v.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const activeSub = sub?.subscriptions.find((s) => ACTIVE.includes(s.status)) ?? null;
  const activePlan = activeSub ? sub?.plans.find((p) => p.name.toLowerCase() === activeSub.plan.toLowerCase()) : null;
  const limit = Number(activePlan?.limits?.vehicles ?? 0);
  const used = sub?.vehicleCount ?? 0;

  const subscribe = useCallback(() => {
    if (!sub) return;
    const buttons = sub.plans.map((p) => ({
      text: `${p.name} – ${formatPrice(p.price)}`,
      onPress: async () => {
        try {
          const url = await createDealerCheckout(p.id);
          await openCheckout(url);
          load(true);
        } catch {
          Alert.alert("Fehler", "Abo konnte nicht gestartet werden.");
        }
      },
    }));
    Alert.alert("Abo wählen", "Wählen Sie einen Tarif", [...buttons, { text: "Abbrechen", style: "cancel" as const }]);
  }, [sub, load]);

  const manageBilling = useCallback(async () => {
    try {
      const url = await createDealerBillingPortal();
      await openCheckout(url);
      load(true);
    } catch {
      Alert.alert("Fehler", "Abrechnungsportal nicht verfügbar.");
    }
  }, [load]);

  const setStatus = useCallback(
    async (v: OwnedVehicle, status: string) => {
      try {
        await updateDealerVehicle(v.id, { status });
        load(true);
      } catch (e: unknown) {
        const msg = (e as { status?: number })?.status === 403
          ? "Aktion nicht möglich – prüfen Sie Ihr Abo und Kontingent."
          : "Aktion fehlgeschlagen.";
        Alert.alert("Fehler", msg);
      }
    },
    [load],
  );

  const openMenu = useCallback(
    (v: OwnedVehicle) => {
      const buttons: { text: string; style?: "cancel" | "destructive"; onPress?: () => void }[] = [];
      if (v.status !== "PUBLISHED") buttons.push({ text: "Veröffentlichen", onPress: () => setStatus(v, "PUBLISHED") });
      if (v.status === "PUBLISHED") {
        buttons.push({ text: "Pausieren", onPress: () => setStatus(v, "PAUSED") });
        buttons.push({ text: "Als verkauft markieren", onPress: () => setStatus(v, "SOLD") });
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
                  await deleteDealerVehicle(v.id);
                  setItems((prev) => prev.filter((x) => x.id !== v.id));
                } catch {
                  Alert.alert("Fehler", "Löschen fehlgeschlagen.");
                }
              },
            },
          ]),
      });
      buttons.push({ text: "Abbrechen", style: "cancel" });
      Alert.alert(`${v.make} ${v.model ?? ""}`.trim(), undefined, buttons);
    },
    [setStatus],
  );

  const header = (
    <View>
      {/* Subscription card */}
      <View style={[styles.subCard, { backgroundColor: C.card, borderColor: C.border }]}>
        {activeSub ? (
          <>
            <View style={styles.subTop}>
              <View>
                <Text style={[styles.subPlan, { color: C.foreground }]}>{activePlan?.name ?? activeSub.plan}</Text>
                <Text style={[styles.subStatus, { color: C.primary }]}>Aktiv</Text>
              </View>
              <Pressable onPress={manageBilling} hitSlop={6}>
                <Text style={[styles.manage, { color: C.primary }]}>Verwalten</Text>
              </Pressable>
            </View>
            <View style={styles.quotaRow}>
              <Text style={[styles.quotaLabel, { color: C.mutedForeground }]}>Veröffentlichte Inserate</Text>
              <Text style={[styles.quotaValue, { color: C.foreground }]}>
                {used} / {limit || "∞"}
              </Text>
            </View>
            <View style={[styles.quotaBar, { backgroundColor: C.secondary }]}>
              <View
                style={[
                  styles.quotaFill,
                  { backgroundColor: C.primary, width: `${limit ? Math.min(100, (used / limit) * 100) : 0}%` },
                ]}
              />
            </View>
          </>
        ) : (
          <>
            <Text style={[styles.subPlan, { color: C.foreground }]}>Kein aktives Abo</Text>
            <Text style={[styles.subSub, { color: C.mutedForeground }]}>
              Schliessen Sie ein Abo ab, um Inserate zu veröffentlichen.
            </Text>
            <Button label="Abo abschliessen" onPress={subscribe} style={{ marginTop: Spacing[3] }} fullWidth />
          </>
        )}
      </View>

      <View style={styles.listHeaderRow}>
        <Text style={[styles.sectionTitle, { color: C.foreground }]}>Inserate</Text>
        <Pressable onPress={() => router.push("/dealer-dashboard/new")} hitSlop={8}>
          <Icon name="plus" size={20} color={C.primary} weight="semibold" />
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]} style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.back}>
          <Icon name="chevron.left" size={22} color={C.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: C.foreground }]}>Händler-Dashboard</Text>
        <View style={styles.back} />
      </SafeAreaView>

      {error ? (
        <ErrorState onRetry={() => load()} />
      ) : loading ? (
        <View style={styles.listPad}>
          <Skeleton width="100%" height={120} radius={Radius.lg} style={{ marginBottom: Spacing[4] }} />
          {[0, 1].map((k) => (
            <Skeleton key={k} width="100%" height={88} radius={Radius.lg} style={{ marginBottom: Spacing[3] }} />
          ))}
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(v) => v.id}
          contentContainerStyle={styles.listPad}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={header}
          ItemSeparatorComponent={() => <View style={{ height: Spacing[3] }} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={C.mutedForeground} />}
          renderItem={({ item }) => (
            <OwnedVehicleCard vehicle={item} onPress={() => openMenu(item)} onMenu={() => openMenu(item)} />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="car"
              title="Noch keine Inserate"
              message="Fügen Sie Ihr erstes Fahrzeug hinzu."
              actionLabel="Neues Inserat"
              onAction={() => router.push("/dealer-dashboard/new")}
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
    topBar: {
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
    subCard: { borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth * 2, padding: Spacing[4], marginBottom: Spacing[5] },
    subTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
    subPlan: { fontFamily: FontFamily.sansBold, fontSize: FontSize.md, letterSpacing: -0.3 },
    subStatus: { fontFamily: FontFamily.sansSemiBold, fontSize: FontSize.sm, marginTop: 2 },
    subSub: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, marginTop: 2, lineHeight: FontSize.sm * 1.4 },
    manage: { fontFamily: FontFamily.sansMedium, fontSize: FontSize.sm },
    quotaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: Spacing[4], marginBottom: Spacing[2] },
    quotaLabel: { fontFamily: FontFamily.sans, fontSize: FontSize.sm },
    quotaValue: { fontFamily: FontFamily.sansBold, fontSize: FontSize.sm },
    quotaBar: { height: 8, borderRadius: 4, overflow: "hidden" },
    quotaFill: { height: "100%", borderRadius: 4 },
    listHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: Spacing[3] },
    sectionTitle: { fontFamily: FontFamily.sansBold, fontSize: FontSize.lg, letterSpacing: -0.3 },
  });
}
