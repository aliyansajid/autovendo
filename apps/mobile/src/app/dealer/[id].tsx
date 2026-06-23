import { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useStatusBarStyle } from "@/hooks/use-status-bar-style";
import { FontFamily, FontSize, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useFavorites } from "@/lib/favorites";
import {
  fetchDealer,
  fetchDealerVehicles,
  type DealerDetail,
  type VehicleListItem,
  type DealerOpeningHour,
} from "@/lib/api";
import { Icon, type IconName } from "@/components/ui/icon";
import { ErrorState } from "@/components/ui/states";
import { VehicleCard } from "@/components/ui/vehicle-card";
import { SectionHeader } from "@/components/ui/section-header";
import { callPhone, openWhatsApp, sendEmail, openUrl, openMaps } from "@/lib/contact";
import { imageUrl } from "@/lib/image";

const { width: SCREEN_W } = Dimensions.get("window");

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Montag",
  TUESDAY: "Dienstag",
  WEDNESDAY: "Mittwoch",
  THURSDAY: "Donnerstag",
  FRIDAY: "Freitag",
  SATURDAY: "Samstag",
  SUNDAY: "Sonntag",
};
const DAY_ORDER = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

function timeStr(t: string | null): string {
  if (!t) return "";
  // API returns time as ISO-ish; take HH:MM.
  const m = t.match(/(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : t;
}

export default function DealerDetailScreen() {
  const C = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isFavorite, toggle } = useFavorites();

  // Dark cover header ⇒ light icons while focused.
  useStatusBarStyle("light");

  const [dealer, setDealer] = useState<DealerDetail | null>(null);
  const [vehicles, setVehicles] = useState<VehicleListItem[]>([]);
  const [vehicleTotal, setVehicleTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(false);
    try {
      const d = await fetchDealer(id);
      setDealer(d);
      fetchDealerVehicles(id, { pageSize: 10, sort: "created-desc" })
        .then((res) => {
          setVehicles(res.data);
          setVehicleTotal(res.total);
        })
        .catch(() => {});
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator color={C.mutedForeground} />
      </View>
    );
  }

  if (error || !dealer) {
    return (
      <View style={styles.root}>
        <FloatingBack />
        <SafeAreaView style={styles.center}>
          <ErrorState onRetry={load} />
        </SafeAreaView>
      </View>
    );
  }

  const sortedHours = [...(dealer.openingHours ?? [])].sort(
    (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day),
  );
  const addressLine = [dealer.streetAddress, `${dealer.zipCode} ${dealer.city}`].filter(Boolean).join(", ");

  const actions: { icon: IconName; label: string; onPress: () => void }[] = [];
  actions.push({ icon: "phone.fill", label: "Anrufen", onPress: () => callPhone(dealer.phoneNumber) });
  actions.push({ icon: "message.fill", label: "WhatsApp", onPress: () => openWhatsApp(dealer.phoneNumber) });
  if (dealer.businessEmail) actions.push({ icon: "envelope.fill", label: "E-Mail", onPress: () => sendEmail(dealer.businessEmail) });
  if (dealer.website) actions.push({ icon: "safari.fill", label: "Website", onPress: () => openUrl(dealer.website!) });

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Spacing[10] }}>
        {/* Cover */}
        <View style={styles.cover}>
          {imageUrl(dealer.coverImage) ? (
            <Image source={{ uri: imageUrl(dealer.coverImage)! }} style={styles.coverImg} contentFit="cover" transition={150} />
          ) : (
            <View style={[styles.coverImg, { backgroundColor: C.secondary }]} />
          )}
          <View style={styles.coverScrim} />
          <FloatingBack />
        </View>

        <View style={styles.body}>
          {/* Identity */}
          <View style={styles.identity}>
            <View style={[styles.logo, { backgroundColor: C.card, borderColor: C.border }]}>
              {imageUrl(dealer.logo) ? (
                <Image source={{ uri: imageUrl(dealer.logo)! }} style={styles.logoImg} contentFit="contain" />
              ) : (
                <Icon name="building.2.fill" size={28} color={C.mutedForeground} />
              )}
            </View>
            <View style={styles.identityText}>
              <View style={styles.nameRow}>
                <Text style={[styles.name, { color: C.foreground }]} numberOfLines={2}>
                  {dealer.companyName}
                </Text>
                {dealer.isVerified && <Icon name="checkmark.seal.fill" size={18} color={C.primary} />}
              </View>
              {dealer.googleRating != null && (
                <View style={styles.ratingRow}>
                  <Icon name="star.fill" size={13} color={C.rating} />
                  <Text style={[styles.ratingText, { color: C.foreground }]}>
                    {dealer.googleRating.toFixed(1)}
                  </Text>
                  {dealer.googleReviewCount != null && (
                    <Text style={[styles.ratingCount, { color: C.mutedForeground }]}>
                      ({dealer.googleReviewCount} Bewertungen)
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>

          {/* Quick actions */}
          <View style={styles.actions}>
            {actions.map((a) => (
              <Pressable key={a.label} style={styles.action} onPress={a.onPress}>
                <View style={[styles.actionIcon, { backgroundColor: C.secondary }]}>
                  <Icon name={a.icon} size={19} color={C.primary} />
                </View>
                <Text style={[styles.actionLabel, { color: C.foreground }]}>{a.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Address */}
          <Pressable
            style={[styles.addressCard, { backgroundColor: C.card, borderColor: C.border }]}
            onPress={() => openMaps(`${dealer.companyName} ${addressLine}`)}
          >
            <Icon name="mappin.and.ellipse" size={18} color={C.primary} />
            <Text style={[styles.addressText, { color: C.foreground }]}>{addressLine}</Text>
            <Icon name="arrow.up.right" size={14} color={C.mutedForeground} />
          </Pressable>

          {/* Description */}
          {dealer.description ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: C.foreground }]}>Über uns</Text>
              <Text style={[styles.description, { color: C.secondaryForeground }]}>{dealer.description}</Text>
            </View>
          ) : null}

          {/* Opening hours */}
          {sortedHours.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: C.foreground }]}>Öffnungszeiten</Text>
              <View style={[styles.hoursTable, { borderColor: C.border }]}>
                {sortedHours.map((h: DealerOpeningHour, i) => (
                  <View
                    key={h.id}
                    style={[
                      styles.hoursRow,
                      i < sortedHours.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border },
                    ]}
                  >
                    <Text style={[styles.hoursDay, { color: C.foreground }]}>{DAY_LABELS[h.day] ?? h.day}</Text>
                    <Text style={[styles.hoursTime, { color: h.isOpen ? C.foreground : C.mutedForeground }]}>
                      {h.isOpen && h.openTime && h.closeTime
                        ? `${timeStr(h.openTime)} – ${timeStr(h.closeTime)}`
                        : "Geschlossen"}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Vehicles */}
          {vehicles.length > 0 && (
            <View style={[styles.section, { marginTop: Spacing[8] }]}>
              <SectionHeader
                title={`Fahrzeuge${vehicleTotal ? ` (${vehicleTotal})` : ""}`}
                actionLabel={vehicleTotal > vehicles.length ? "Alle" : undefined}
                onAction={
                  vehicleTotal > vehicles.length
                    ? () => router.push({ pathname: "/(tabs)/search", params: { dealerId: dealer.id } })
                    : undefined
                }
              />
              <View style={{ gap: Spacing[3] }}>
                {vehicles.map((v) => (
                  <VehicleCard
                    key={v.id}
                    vehicle={v}
                    favorite={isFavorite(v.id)}
                    onToggleFavorite={() => toggle(v.id)}
                    onPress={() => router.push(`/vehicle/${v.id}`)}
                  />
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function FloatingBack() {
  return (
    <SafeAreaView edges={["top"]} style={floating.wrap}>
      <Pressable style={floating.btn} onPress={() => router.back()} hitSlop={8}>
        <Icon name="chevron.left" size={20} color="#fff" />
      </Pressable>
    </SafeAreaView>
  );
}

const floating = StyleSheet.create({
  wrap: { position: "absolute", top: 0, left: Spacing[4], zIndex: 10 },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
});

function createStyles(C: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: C.background },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    cover: { width: SCREEN_W, height: SCREEN_W * 0.42 },
    coverImg: { width: "100%", height: "100%" },
    coverScrim: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.12)" },
    body: {
      paddingHorizontal: Spacing[5],
      marginTop: -32,
    },
    identity: {
      flexDirection: "row",
      gap: Spacing[3],
      alignItems: "flex-end",
    },
    logo: {
      width: 72,
      height: 72,
      borderRadius: Radius.lg,
      borderWidth: StyleSheet.hairlineWidth * 2,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    logoImg: { width: "100%", height: "100%" },
    identityText: { flex: 1, paddingBottom: Spacing[1] },
    nameRow: { flexDirection: "row", alignItems: "center", gap: Spacing[2] },
    name: {
      fontFamily: FontFamily.sansBold,
      fontSize: FontSize.lg,
      letterSpacing: -0.4,
      flexShrink: 1,
    },
    ratingRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
    ratingText: { fontFamily: FontFamily.sansSemiBold, fontSize: FontSize.sm },
    ratingCount: { fontFamily: FontFamily.sans, fontSize: FontSize.xs },
    actions: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: Spacing[5],
    },
    action: { alignItems: "center", gap: Spacing[2] },
    actionIcon: {
      width: 52,
      height: 52,
      borderRadius: Radius.lg,
      alignItems: "center",
      justifyContent: "center",
    },
    actionLabel: { fontFamily: FontFamily.sansMedium, fontSize: FontSize.xs },
    addressCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing[3],
      padding: Spacing[4],
      borderRadius: Radius.lg,
      borderWidth: StyleSheet.hairlineWidth * 2,
      marginTop: Spacing[5],
    },
    addressText: { flex: 1, fontFamily: FontFamily.sansMedium, fontSize: FontSize.sm },
    section: { marginTop: Spacing[6] },
    sectionTitle: {
      fontFamily: FontFamily.sansBold,
      fontSize: FontSize.md,
      letterSpacing: -0.3,
      marginBottom: Spacing[3],
    },
    description: {
      fontFamily: FontFamily.sans,
      fontSize: FontSize.base,
      lineHeight: FontSize.base * 1.55,
    },
    hoursTable: {
      borderWidth: StyleSheet.hairlineWidth * 2,
      borderRadius: Radius.lg,
      overflow: "hidden",
    },
    hoursRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: Spacing[4],
      paddingVertical: Spacing[3],
    },
    hoursDay: { fontFamily: FontFamily.sans, fontSize: FontSize.sm },
    hoursTime: { fontFamily: FontFamily.sansMedium, fontSize: FontSize.sm },
  });
}
