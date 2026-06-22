import { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { FontFamily, FontSize, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { formatPrice, formatDate } from "@/lib/format";
import { openCheckout } from "@/lib/checkout";
import { openUrl } from "@/lib/contact";
import {
  fetchMe, isDealer,
  fetchSellerBilling, createSellerBillingPortal,
  fetchDealerSubscription, upgradeDealerSubscription, createDealerBillingPortal,
  cancelDealerSubscription, restoreDealerSubscription,
  type BillingInfo, type DealerSubscriptionInfo, type Invoice, type DealerSubscriptionRecord,
} from "@/lib/account";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { ErrorState, Skeleton } from "@/components/ui/states";
import { cardShadow } from "@/components/ui/skeleton";

// Same set the web page treats as an existing subscription — past_due/unpaid/
// incomplete must still resolve to the active sub so we manage it (and pass its
// id on switch) instead of starting a duplicate that double-bills.
const ACTIVE_STATUSES = ["active", "trialing", "past_due", "unpaid", "incomplete"];

const fmtDate = (iso: string | null) => (iso ? formatDate(iso) : "");

// Mirrors the web getStatusInfo() — including the canceling state.
function statusInfo(sub: DealerSubscriptionRecord, C: ReturnType<typeof useTheme>) {
  if (sub.cancelAtPeriodEnd || sub.cancelAt) return { label: "Wird gekündigt", color: C.destructive };
  switch (sub.status) {
    case "trialing":
      return { label: "Testphase", color: "#3b82f6" };
    case "past_due":
    case "unpaid":
      return { label: "Zahlung überfällig", color: C.destructive };
    case "incomplete":
      return { label: "Unvollständig", color: "#eab308" };
    default:
      return { label: "Aktiv", color: C.primary };
  }
}

// Mirrors the web invoice status badge colors.
function invoiceBadge(status: string | null) {
  switch (status) {
    case "paid":
      return { label: "Bezahlt", color: "#22c55e" };
    case "open":
      return { label: "Offen", color: "#eab308" };
    case "draft":
      return { label: "Entwurf", color: "#6b7280" };
    default:
      return { label: status ?? "—", color: "#ef4444" };
  }
}

export default function BillingScreen() {
  const C = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const [dealer, setDealer] = useState(false);
  const [seller, setSeller] = useState<BillingInfo | null>(null);
  const [sub, setSub] = useState<DealerSubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const me = await fetchMe();
      const isD = isDealer(me);
      setDealer(isD);
      if (isD) setSub(await fetchDealerSubscription());
      else setSeller(await fetchSellerBilling());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Guard every action so a double-tap can't fire two requests (web uses isPending).
  const run = useCallback(
    async (fn: () => Promise<void>) => {
      if (busy) return;
      setBusy(true);
      try {
        await fn();
      } finally {
        setBusy(false);
      }
    },
    [busy],
  );

  const paymentMethod = dealer ? sub?.paymentMethod : seller?.paymentMethod;
  const invoices: Invoice[] = (dealer ? sub?.invoices : seller?.invoices) ?? [];
  // Drop phantom incomplete subs (no Stripe id), then resolve the active one —
  // matches getDealerSubscriptionPageData on web.
  const subs = (sub?.subscriptions ?? []).filter(
    (s) => !(s.status === "incomplete" && !s.stripeSubscriptionId),
  );
  const activeSub = subs.find((s) => ACTIVE_STATUSES.includes(s.status)) ?? null;
  const activePlan = activeSub ? sub?.plans.find((p) => p.name.toLowerCase() === activeSub.plan.toLowerCase()) : null;
  const limit = Number(activePlan?.limits?.vehicles ?? 0);
  const status = activeSub ? statusInfo(activeSub, C) : null;
  const isCanceling = !!(activeSub?.cancelAtPeriodEnd || activeSub?.cancelAt);

  const portal = () =>
    run(async () => {
      try {
        const url = dealer ? await createDealerBillingPortal() : await createSellerBillingPortal();
        await openCheckout(url);
        load();
      } catch {
        Alert.alert("Fehler", "Abrechnungsportal ist nicht verfügbar.");
      }
    });

  // Subscribe to a plan, or switch plans when one is already active. Passing the
  // current subscriptionId makes Stripe modify the existing sub (no duplicate).
  const subscribe = () => {
    if (!sub || busy) return;
    const buttons = sub.plans
      .filter((p) => p.name.toLowerCase() !== activeSub?.plan.toLowerCase())
      .map((p) => ({
        text: `${p.name} – ${formatPrice(p.price)}`,
        onPress: () =>
          run(async () => {
            try {
              const url = await upgradeDealerSubscription({
                plan: p.name,
                subscriptionId: activeSub?.stripeSubscriptionId,
              });
              await openCheckout(url);
              load();
            } catch {
              Alert.alert("Fehler", "Abo konnte nicht gestartet werden.");
            }
          }),
      }));
    Alert.alert(
      activeSub ? "Tarif wechseln" : "Abo wählen",
      "Wählen Sie einen Tarif",
      [...buttons, { text: "Abbrechen", style: "cancel" as const }],
    );
  };

  const cancel = () => {
    const id = activeSub?.stripeSubscriptionId;
    if (!id || busy) return;
    Alert.alert("Abo kündigen", "Ihr Abo bleibt bis zum Ende der laufenden Periode aktiv.", [
      { text: "Zurück", style: "cancel" as const },
      {
        text: "Kündigen",
        style: "destructive" as const,
        onPress: () =>
          run(async () => {
            try {
              const url = await cancelDealerSubscription(id);
              if (url) await openCheckout(url);
              load();
            } catch {
              Alert.alert("Fehler", "Kündigung fehlgeschlagen.");
            }
          }),
      },
    ]);
  };

  const restore = () => {
    const id = activeSub?.stripeSubscriptionId;
    if (!id) return;
    run(async () => {
      try {
        await restoreDealerSubscription(id);
        load();
      } catch {
        Alert.alert("Fehler", "Reaktivierung fehlgeschlagen.");
      }
    });
  };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]} style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.back}>
          <Icon name="chevron.left" size={22} color={C.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: C.foreground }]}>{dealer ? "Abo & Abrechnung" : "Abrechnung"}</Text>
        <View style={styles.back} />
      </SafeAreaView>

      {error ? (
        <ErrorState onRetry={load} />
      ) : loading ? (
        <View style={styles.body}>
          <Skeleton width="100%" height={120} radius={18} style={{ marginBottom: Spacing[4] }} />
          <Skeleton width="100%" height={80} radius={18} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {/* Dealer subscription */}
          {dealer && (
            <View style={[styles.card, { backgroundColor: C.card }, cardShadow]}>
              {activeSub ? (
                <>
                  {/* Status banners — mirror the web warnings */}
                  {(activeSub.status === "past_due" || activeSub.status === "unpaid") && (
                    <View style={[styles.banner, { backgroundColor: C.destructive }]}>
                      <Text style={styles.bannerText}>Ihre letzte Zahlung ist fehlgeschlagen. Bitte aktualisieren Sie Ihr Zahlungsmittel.</Text>
                    </View>
                  )}
                  {activeSub.status === "trialing" && activeSub.trialEnd && (
                    <View style={[styles.banner, { backgroundColor: "#3b82f6" }]}>
                      <Text style={styles.bannerText}>Testphase endet am {fmtDate(activeSub.trialEnd)}</Text>
                    </View>
                  )}
                  {isCanceling && (
                    <View style={[styles.banner, { backgroundColor: C.destructive }]}>
                      <Text style={styles.bannerText}>
                        Wird gekündigt am {fmtDate(activeSub.cancelAt || activeSub.periodEnd)}
                      </Text>
                    </View>
                  )}

                  <View style={styles.subTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cardTitle, { color: C.foreground }]}>{activePlan?.name ?? activeSub.plan}</Text>
                      <Text style={[styles.activeText, { color: status?.color }]}>{status?.label}</Text>
                      <Text style={[styles.muted, { color: C.mutedForeground, marginTop: 2 }]}>
                        {formatPrice(activePlan?.price ?? 0)} / {activeSub.billingInterval || "Monat"}
                        {activeSub.periodEnd ? ` · Nächste Abrechnung: ${fmtDate(activeSub.periodEnd)}` : ""}
                      </Text>
                    </View>
                    <Pressable onPress={portal} hitSlop={6} disabled={busy}>
                      <Text style={[styles.manage, { color: C.primary, opacity: busy ? 0.4 : 1 }]}>Verwalten</Text>
                    </Pressable>
                  </View>
                  <View style={styles.quotaRow}>
                    <Text style={[styles.muted, { color: C.mutedForeground }]}>Veröffentlichte Inserate</Text>
                    <Text style={[styles.quotaVal, { color: C.foreground }]}>{sub?.vehicleCount ?? 0} / {limit || "∞"}</Text>
                  </View>
                  <View style={styles.actions}>
                    <Pressable onPress={subscribe} hitSlop={6} disabled={busy}>
                      <Text style={[styles.action, { color: C.primary, opacity: busy ? 0.4 : 1 }]}>Tarif wechseln</Text>
                    </Pressable>
                    {isCanceling ? (
                      <Pressable onPress={restore} hitSlop={6} disabled={busy}>
                        <Text style={[styles.action, { color: C.primary, opacity: busy ? 0.4 : 1 }]}>Reaktivieren</Text>
                      </Pressable>
                    ) : (
                      <Pressable onPress={cancel} hitSlop={6} disabled={busy}>
                        <Text style={[styles.action, { color: C.destructive, opacity: busy ? 0.4 : 1 }]}>Kündigen</Text>
                      </Pressable>
                    )}
                  </View>
                </>
              ) : (
                <>
                  <Text style={[styles.cardTitle, { color: C.foreground }]}>Kein aktives Abo</Text>
                  <Text style={[styles.muted, { color: C.mutedForeground, marginTop: 2 }]}>Schliessen Sie ein Abo ab, um Inserate zu veröffentlichen.</Text>
                  <Button label="Abo abschliessen" onPress={subscribe} loading={busy} disabled={busy} style={{ marginTop: Spacing[3] }} fullWidth />
                </>
              )}
            </View>
          )}

          {/* Payment method */}
          <Text style={[styles.section, { color: C.foreground }]}>Zahlungsmittel</Text>
          <View style={[styles.card, { backgroundColor: C.card }, cardShadow]}>
            {paymentMethod ? (
              <View style={styles.pmRow}>
                <Icon name="creditcard.fill" size={22} color={C.foreground} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.pmBrand, { color: C.foreground }]}>
                    {paymentMethod.brand.toUpperCase()} •••• {paymentMethod.last4}
                  </Text>
                  <Text style={[styles.muted, { color: C.mutedForeground }]}>
                    Gültig bis {String(paymentMethod.expMonth).padStart(2, "0")}/{paymentMethod.expYear}
                  </Text>
                </View>
                <Pressable onPress={portal} hitSlop={6} disabled={busy}>
                  <Text style={[styles.manage, { color: C.primary, opacity: busy ? 0.4 : 1 }]}>Ändern</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.pmRow}>
                <Icon name="creditcard" size={22} color={C.mutedForeground} />
                <Text style={[styles.muted, { color: C.mutedForeground, flex: 1 }]}>Kein Zahlungsmittel hinterlegt</Text>
                <Pressable onPress={portal} hitSlop={6} disabled={busy}>
                  <Text style={[styles.manage, { color: C.primary, opacity: busy ? 0.4 : 1 }]}>Verwalten</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Invoices */}
          <Text style={[styles.section, { color: C.foreground }]}>Rechnungen</Text>
          {invoices.length === 0 ? (
            <View style={[styles.card, { backgroundColor: C.card }, cardShadow]}>
              <Text style={[styles.muted, { color: C.mutedForeground }]}>Noch keine Rechnungen.</Text>
            </View>
          ) : (
            <View style={[styles.card, { backgroundColor: C.card, padding: 0 }, cardShadow]}>
              {invoices.map((inv, i) => {
                const badge = invoiceBadge(inv.status);
                return (
                  <Pressable
                    key={inv.id}
                    style={[styles.invRow, i < invoices.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border }]}
                    onPress={() => inv.hostedUrl && openUrl(inv.hostedUrl)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.invNum, { color: C.foreground }]}>{inv.number ?? "Rechnung"}</Text>
                      <Text style={[styles.muted, { color: C.mutedForeground }]}>{formatDate(new Date(inv.date * 1000).toISOString())}</Text>
                    </View>
                    <View style={[styles.invBadge, { backgroundColor: badge.color }]}>
                      <Text style={styles.invBadgeText}>{badge.label}</Text>
                    </View>
                    <Text style={[styles.invAmount, { color: C.foreground }]}>{formatPrice(inv.amount / 100)}</Text>
                    <Icon name="chevron.right" size={14} color={C.mutedForeground} />
                  </Pressable>
                );
              })}
            </View>
          )}
        </ScrollView>
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
    body: { paddingHorizontal: Spacing[5], paddingTop: Spacing[3], paddingBottom: Spacing[10] },
    section: { fontFamily: FontFamily.sansBold, fontSize: FontSize.base, marginTop: Spacing[6], marginBottom: Spacing[3] },
    card: { borderRadius: 18, padding: Spacing[4], overflow: "hidden" },
    banner: {
      marginHorizontal: -Spacing[4],
      marginTop: -Spacing[4],
      marginBottom: Spacing[4],
      paddingHorizontal: Spacing[4],
      paddingVertical: Spacing[3],
    },
    bannerText: { fontFamily: FontFamily.sansMedium, fontSize: FontSize.sm, color: "#ffffff" },
    cardTitle: { fontFamily: FontFamily.sansBold, fontSize: FontSize.md, letterSpacing: -0.3 },
    subTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: Spacing[3] },
    activeText: { fontFamily: FontFamily.sansSemiBold, fontSize: FontSize.sm, marginTop: 2 },
    manage: { fontFamily: FontFamily.sansMedium, fontSize: FontSize.sm },
    quotaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: Spacing[4] },
    quotaVal: { fontFamily: FontFamily.sansBold, fontSize: FontSize.sm },
    actions: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: Spacing[4],
      paddingTop: Spacing[3],
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: C.border,
    },
    action: { fontFamily: FontFamily.sansSemiBold, fontSize: FontSize.sm },
    muted: { fontFamily: FontFamily.sans, fontSize: FontSize.sm },
    pmRow: { flexDirection: "row", alignItems: "center", gap: Spacing[3] },
    pmBrand: { fontFamily: FontFamily.sansSemiBold, fontSize: FontSize.base },
    invRow: { flexDirection: "row", alignItems: "center", gap: Spacing[3], padding: Spacing[4] },
    invNum: { fontFamily: FontFamily.sansMedium, fontSize: FontSize.base },
    invAmount: { fontFamily: FontFamily.sansBold, fontSize: FontSize.base },
    invBadge: { paddingHorizontal: Spacing[2], paddingVertical: 2, borderRadius: Radius.sm },
    invBadgeText: { fontFamily: FontFamily.sansSemiBold, fontSize: FontSize.xs, color: "#ffffff" },
  });
}
