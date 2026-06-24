import { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useStatusBarStyle } from "@/hooks/use-status-bar-style";
import { FontFamily, FontSize, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useFavorites } from "@/lib/favorites";
import {
  fetchVehicle,
  fetchSimilarVehicles,
  type VehicleDetail,
  type VehicleListItem,
} from "@/lib/api";
import {
  formatPrice,
  formatKm,
  formatPower,
  formatRegistration,
  formatNumber,
  formatConsumption,
  formatDate,
} from "@/lib/format";
import {
  labelMake,
  labelModel,
  labelFuel,
  labelCondition,
  labelTransmission,
  labelDrive,
  labelColor,
  labelType,
  labelEmission,
  labelEquipment,
  labelExtra,
  labelWarranty,
} from "@/lib/labels";
import { Icon, type IconName } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/states";
import { Skeleton } from "@/components/ui/skeleton";
import { VehicleCard } from "@/components/ui/vehicle-card";
import { SpecTile } from "@/components/ui/spec-tile";
import { SectionHeader } from "@/components/ui/section-header";
import { callPhone, openWhatsApp, sendEmail } from "@/lib/contact";
import { imageUrl, imageUrls } from "@/lib/image";

const { width: SCREEN_W } = Dimensions.get("window");
const SIMILAR_W = Math.min(280, SCREEN_W * 0.7);

function equipmentList(eq: VehicleDetail["equipment"]): string[] {
  if (!eq) return [];
  if (Array.isArray(eq)) return eq;
  return Object.entries(eq)
    .filter(([, v]) => v)
    .map(([k]) => k);
}

export default function VehicleDetailScreen() {
  const C = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isFavorite, toggle } = useFavorites();

  // Dark image gallery header ⇒ light icons while focused.
  useStatusBarStyle("light");

  const [vehicle, setVehicle] = useState<VehicleDetail | null>(null);
  const [similar, setSimilar] = useState<VehicleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(false);
    try {
      const v = await fetchVehicle(id);
      setVehicle(v);
      fetchSimilarVehicles(id).then(setSimilar).catch(() => {});
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
      <View style={styles.root}>
        <FloatingBack />
        {/* Gallery band */}
        <Skeleton width={SCREEN_W} height={SCREEN_W * 0.75} radius={0} />
        <View style={styles.body}>
          {/* Title + price */}
          <Skeleton width="60%" height={24} radius={8} />
          <Skeleton width="40%" height={16} radius={6} style={{ marginTop: Spacing[3] }} />
          <Skeleton width="45%" height={28} radius={8} style={{ marginTop: Spacing[4] }} />
          {/* Info chips */}
          <View style={{ flexDirection: "row", gap: Spacing[2], marginTop: Spacing[5] }}>
            <Skeleton width={110} height={30} radius={999} />
            <Skeleton width={90} height={30} radius={999} />
          </View>
          {/* Spec tiles 2×3 */}
          <View style={{ gap: Spacing[2], marginTop: Spacing[5] }}>
            {[0, 1].map((r) => (
              <View key={r} style={{ flexDirection: "row", gap: Spacing[2] }}>
                {[0, 1, 2].map((c) => (
                  <Skeleton key={c} width={undefined} height={92} radius={Radius.lg} style={{ flex: 1 }} />
                ))}
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  if (error || !vehicle) {
    return (
      <View style={styles.root}>
        <FloatingBack />
        <SafeAreaView style={styles.center}>
          <ErrorState onRetry={load} />
        </SafeAreaView>
      </View>
    );
  }

  const title = `${labelMake(vehicle.make)} ${labelModel(vehicle.model)}`.trim();
  const dealer = vehicle.dealer;
  const seller = vehicle.seller;
  const phone = dealer?.phoneNumber ?? seller?.phoneNumber ?? null;
  const images = imageUrls(vehicle.images);
  const equipment = equipmentList(vehicle.equipment);
  const extras = equipmentList(vehicle.extras);
  const fav = isFavorite(vehicle.id);

  const keySpecs: { icon: IconName; label: string; value: string }[] = [
    { icon: "fuelpump.fill", label: "Treibstoff", value: labelFuel(vehicle.fuelType) || "–" },
    { icon: "bolt.fill", label: "Leistung", value: formatPower(vehicle.hp, vehicle.kw) },
    { icon: "gearshape.fill", label: "Getriebe", value: labelTransmission(vehicle.transmissionType) || "–" },
    { icon: "gauge.medium", label: "Kilometer", value: formatKm(vehicle.kilometer) },
    { icon: "calendar", label: "Jahrgang", value: formatRegistration(vehicle.registrationMonth, vehicle.registrationYear) },
    { icon: "checkmark.seal.fill", label: "Zustand", value: labelCondition(vehicle.vehicleCondition) || "–" },
  ];

  const infoChips: { icon: IconName; label: string }[] = [];
  if (vehicle.inspectionPassed) infoChips.push({ icon: "checkmark.seal.fill", label: "MFK geprüft" });
  if (vehicle.warranty) infoChips.push({ icon: "shield.fill", label: "Garantie" });
  if (dealer?.user?.emailVerified) infoChips.push({ icon: "checkmark.circle.fill", label: "Verifizierter Händler" });

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Gallery */}
        <View style={styles.gallery}>
          {images.length > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) =>
                setActiveImage(Math.round(e.nativeEvent.contentOffset.x / SCREEN_W))
              }
            >
              {images.map((uri, i) => (
                <Image key={i} source={{ uri }} style={styles.galleryImg} contentFit="cover" transition={150} />
              ))}
            </ScrollView>
          ) : (
            <View style={[styles.galleryImg, styles.galleryPlaceholder, { backgroundColor: C.secondary }]}>
              <Icon name="car.side.fill" size={64} color={C.mutedForeground} />
            </View>
          )}

          {images.length > 1 && (
            <View style={styles.counter}>
              <Text style={styles.counterText}>
                {activeImage + 1} / {images.length}
              </Text>
            </View>
          )}

          <FloatingBack />
          <SafeAreaView edges={["top"]} style={styles.favWrap}>
            <Pressable style={styles.circleBtn} onPress={() => toggle(vehicle.id)} hitSlop={8}>
              <Icon name={fav ? "heart.fill" : "heart"} size={20} color={fav ? "#ff4d6d" : "#fff"} />
            </Pressable>
          </SafeAreaView>
        </View>

        <View style={styles.body}>
          {/* Title + price */}
          <Text style={[styles.title, { color: C.foreground }]}>{title}</Text>
          {vehicle.version ? <Text style={[styles.version, { color: C.mutedForeground }]}>{vehicle.version}</Text> : null}
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: C.foreground }]}>{formatPrice(vehicle.price)}</Text>
            {vehicle.newPrice != null && vehicle.newPrice > vehicle.price && (
              <Text style={[styles.oldPrice, { color: C.mutedForeground }]}>{formatPrice(vehicle.newPrice)}</Text>
            )}
          </View>

          {/* Info chips */}
          {infoChips.length > 0 && (
            <View style={styles.infoChips}>
              {infoChips.map((c) => (
                <View key={c.label} style={[styles.infoChip, { backgroundColor: C.secondary }]}>
                  <Icon name={c.icon} size={13} color={C.primary} />
                  <Text style={[styles.infoChipText, { color: C.secondaryForeground }]}>{c.label}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Key specs */}
          <View style={styles.specGrid}>
            {[keySpecs.slice(0, 3), keySpecs.slice(3, 6)].map((row, ri) => (
              <View key={ri} style={styles.specRow}>
                {row.map((s) => (
                  <SpecTile key={s.label} icon={s.icon} label={s.label} value={s.value} />
                ))}
              </View>
            ))}
          </View>

          {/* Description */}
          {vehicle.vehicleDescription ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: C.foreground }]}>Beschreibung</Text>
              <Text
                numberOfLines={descExpanded ? undefined : 5}
                style={[styles.description, { color: C.secondaryForeground }]}
              >
                {vehicle.vehicleDescription}
              </Text>
              <Pressable onPress={() => setDescExpanded((e) => !e)} hitSlop={6}>
                <Text style={[styles.more, { color: C.primary }]}>
                  {descExpanded ? "Weniger anzeigen" : "Mehr anzeigen"}
                </Text>
              </Pressable>
            </View>
          ) : null}

          {/* Technical data */}
          <SpecSection
            title="Technische Daten"
            rows={[
              ["Fahrzeugtyp", labelType(vehicle.vehicleType)],
              ["Karosserie", labelType(vehicle.bodyType)],
              ["Antrieb", labelDrive(vehicle.driveType)],
              ["Türen", vehicle.doors != null ? String(vehicle.doors) : ""],
              ["Sitze", vehicle.seats != null ? String(vehicle.seats) : ""],
              ["Farbe", labelColor(vehicle.color)],
              ["Innenfarbe", labelColor(vehicle.interiorColor)],
              ["Hubraum", vehicle.cubicCapacity != null ? `${formatNumber(vehicle.cubicCapacity)} cm³` : ""],
              ["Zylinder", vehicle.cylinders != null ? String(vehicle.cylinders) : ""],
              ["Gänge", vehicle.numberOfGears != null ? String(vehicle.numberOfGears) : ""],
            ]}
          />

          {/* Consumption & emissions */}
          <SpecSection
            title="Verbrauch & Emissionen"
            rows={[
              ["Verbrauch gesamt", formatConsumptionOrEmpty(vehicle.consumptionTotal)],
              ["Verbrauch Stadt", formatConsumptionOrEmpty(vehicle.consumptionCity)],
              ["Verbrauch Land", formatConsumptionOrEmpty(vehicle.consumptionCountry)],
              ["CO₂-Emission", vehicle.co2Emission != null ? `${vehicle.co2Emission} g/km` : ""],
              ["Energieeffizienz", vehicle.energyLabel ?? ""],
              ["Abgasnorm", labelEmission(vehicle.emissionStandard)],
            ]}
          />

          {/* Electric */}
          {(vehicle.range != null || vehicle.batteryCapacity != null || vehicle.chargingPower != null) && (
            <SpecSection
              title="Elektro & Laden"
              rows={[
                ["Reichweite", vehicle.range != null ? `${formatNumber(vehicle.range)} km` : ""],
                ["Batteriekapazität", vehicle.batteryCapacity != null ? `${vehicle.batteryCapacity} kWh` : ""],
                ["Ladeleistung", vehicle.chargingPower != null ? `${vehicle.chargingPower} kW` : ""],
                ["Stromverbrauch", vehicle.powerConsumption != null ? `${vehicle.powerConsumption} kWh/100 km` : ""],
              ]}
            />
          )}

          {/* Dimensions */}
          {(vehicle.length != null || vehicle.emptyWeight != null) && (
            <SpecSection
              title="Masse & Gewicht"
              rows={[
                ["Länge", vehicle.length != null ? `${formatNumber(vehicle.length)} mm` : ""],
                ["Breite", vehicle.width != null ? `${formatNumber(vehicle.width)} mm` : ""],
                ["Höhe", vehicle.height != null ? `${formatNumber(vehicle.height)} mm` : ""],
                ["Radstand", vehicle.wheelbase != null ? `${formatNumber(vehicle.wheelbase)} mm` : ""],
                ["Leergewicht", vehicle.emptyWeight != null ? `${formatNumber(vehicle.emptyWeight)} kg` : ""],
                ["Anhängelast", vehicle.towingCapacityBraked != null ? `${formatNumber(vehicle.towingCapacityBraked)} kg` : ""],
              ]}
            />
          )}

          {/* Inspection & warranty */}
          {(vehicle.inspectionPassed || vehicle.warranty) && (
            <SpecSection
              title="Prüfung & Garantie"
              rows={[
                ["Letzte Prüfung (MFK)", vehicle.lastInspectionDate ? formatDate(vehicle.lastInspectionDate) : ""],
                ["MFK geprüft", vehicle.inspectionPassed ? "Ja" : ""],
                ["Garantie", labelWarranty(vehicle.warranty)],
                ["Garantiedauer", vehicle.duration != null ? `${vehicle.duration} Monate` : ""],
              ]}
            />
          )}

          {/* Equipment */}
          {equipment.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: C.foreground }]}>Ausstattung</Text>
              <View style={styles.equipGrid}>
                {equipment.map((e) => (
                  <View key={e} style={styles.equipItem}>
                    <Icon name="checkmark" size={13} color={C.primary} />
                    <Text style={[styles.equipText, { color: C.secondaryForeground }]}>{labelEquipment(e)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Extras */}
          {extras.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: C.foreground }]}>Besonderheiten</Text>
              <View style={styles.equipGrid}>
                {extras.map((e) => (
                  <View key={e} style={styles.equipItem}>
                    <Icon name="star.fill" size={12} color={C.rating} />
                    <Text style={[styles.equipText, { color: C.secondaryForeground }]}>{labelExtra(e)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Seller / dealer */}
          {dealer ? (
            <Pressable
              style={[styles.sellerCard, { backgroundColor: C.card, borderColor: C.border }]}
              onPress={() => router.push(`/dealer/${dealer.id}`)}
            >
              <View style={[styles.sellerLogo, { backgroundColor: C.secondary }]}>
                {imageUrl(dealer.logo) ? (
                  <Image source={{ uri: imageUrl(dealer.logo)! }} style={styles.sellerLogoImg} contentFit="contain" />
                ) : (
                  <Icon name="building.2.fill" size={22} color={C.mutedForeground} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={[styles.sellerName, { color: C.foreground }]}>{dealer.companyName}</Text>
                <Text numberOfLines={1} style={[styles.sellerMeta, { color: C.mutedForeground }]}>
                  {[dealer.zipCode, dealer.city].filter(Boolean).join(" ")}
                </Text>
                {dealer.googleRating != null && (
                  <View style={styles.ratingRow}>
                    <Icon name="star.fill" size={12} color={C.rating} />
                    <Text style={[styles.ratingText, { color: C.foreground }]}>
                      {dealer.googleRating.toFixed(1)}
                      {dealer.googleReviewCount != null ? ` (${dealer.googleReviewCount})` : ""}
                    </Text>
                  </View>
                )}
              </View>
              <Icon name="chevron.right" size={16} color={C.mutedForeground} />
            </Pressable>
          ) : seller ? (
            <View style={[styles.sellerCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <View style={[styles.sellerLogo, { backgroundColor: C.secondary }]}>
                <Icon name="person.fill" size={22} color={C.mutedForeground} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sellerName, { color: C.foreground }]}>Privatverkäufer</Text>
                <Text style={[styles.sellerMeta, { color: C.mutedForeground }]}>
                  {[seller.zipCode, seller.city].filter(Boolean).join(" ")}
                </Text>
              </View>
            </View>
          ) : null}

          {/* Similar */}
          {similar.length > 0 && (
            <View style={[styles.section, { marginTop: Spacing[8] }]}>
              <SectionHeader title="Ähnliche Fahrzeuge" />
            </View>
          )}
        </View>

        {similar.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.similarList}>
            {similar.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                width={SIMILAR_W}
                favorite={isFavorite(v.id)}
                onToggleFavorite={() => toggle(v.id)}
                onPress={() => router.push(`/vehicle/${v.id}`)}
              />
            ))}
          </ScrollView>
        )}
      </ScrollView>

      {/* Sticky contact bar */}
      <SafeAreaView edges={["bottom"]} style={[styles.contactBar, { backgroundColor: C.background, borderTopColor: C.border }]}>
        <View style={styles.contactInner}>
          {phone && (
            <Pressable
              style={[styles.darkSquare, { backgroundColor: C.foreground }]}
              onPress={() => openWhatsApp(phone, `Hallo, ich interessiere mich für ${title}.`)}
            >
              <Icon name="message.fill" size={20} color={C.background} />
            </Pressable>
          )}
          {phone ? (
            <Button
              size="lg"
              icon="phone.fill"
              label="Anrufen"
              onPress={() => callPhone(phone)}
              style={{ flex: 1 }}
            />
          ) : dealer?.businessEmail ? (
            <Button
              size="lg"
              icon="envelope.fill"
              label="Nachricht senden"
              onPress={() => sendEmail(dealer.businessEmail!, `Anfrage: ${title}`)}
              style={{ flex: 1 }}
            />
          ) : null}
        </View>
      </SafeAreaView>
    </View>
  );
}

function formatConsumptionOrEmpty(v: number | null): string {
  return v != null ? formatConsumption(v) : "";
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

function SpecSection({ title, rows }: { title: string; rows: [string, string][] }) {
  const C = useTheme();
  const visible = rows.filter(([, v]) => v && v !== "–" && v !== "");
  if (visible.length === 0) return null;
  return (
    <View style={specStyles.section}>
      <Text style={[specStyles.title, { color: C.foreground }]}>{title}</Text>
      <View style={[specStyles.table, { borderColor: C.border }]}>
        {visible.map(([label, value], i) => (
          <View
            key={label}
            style={[
              specStyles.row,
              i < visible.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border },
            ]}
          >
            <Text style={[specStyles.label, { color: C.mutedForeground }]}>{label}</Text>
            <Text style={[specStyles.value, { color: C.foreground }]}>{value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const floating = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: 0,
    left: Spacing[4],
    zIndex: 10,
  },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
});

const specStyles = StyleSheet.create({
  section: {
    marginTop: Spacing[6],
  },
  title: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.md,
    letterSpacing: -0.3,
    marginBottom: Spacing[3],
  },
  table: {
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: Radius.lg,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    gap: Spacing[4],
  },
  label: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    flexShrink: 1,
  },
  value: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.sm,
    textAlign: "right",
    flexShrink: 1,
  },
});

function createStyles(C: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: C.background },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    gallery: {
      width: SCREEN_W,
      height: SCREEN_W * 0.75,
    },
    galleryImg: {
      width: SCREEN_W,
      height: SCREEN_W * 0.75,
    },
    galleryPlaceholder: {
      alignItems: "center",
      justifyContent: "center",
    },
    counter: {
      position: "absolute",
      bottom: Spacing[3],
      right: Spacing[4],
      backgroundColor: "rgba(0,0,0,0.6)",
      paddingHorizontal: Spacing[3],
      paddingVertical: 4,
      borderRadius: Radius.full,
    },
    counterText: {
      fontFamily: FontFamily.sansMedium,
      fontSize: FontSize.xs,
      color: "#fff",
    },
    favWrap: {
      position: "absolute",
      top: 0,
      right: Spacing[4],
    },
    circleBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(0,0,0,0.45)",
      alignItems: "center",
      justifyContent: "center",
    },
    body: {
      paddingHorizontal: Spacing[5],
      paddingTop: Spacing[5],
    },
    title: {
      fontFamily: FontFamily.sansBold,
      fontSize: FontSize.xl,
      letterSpacing: -0.5,
    },
    version: {
      fontFamily: FontFamily.sans,
      fontSize: FontSize.base,
      marginTop: 2,
    },
    priceRow: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: Spacing[3],
      marginTop: Spacing[3],
    },
    price: {
      fontFamily: FontFamily.sansBold,
      fontSize: FontSize["2xl"],
      letterSpacing: -0.5,
    },
    oldPrice: {
      fontFamily: FontFamily.sans,
      fontSize: FontSize.base,
      textDecorationLine: "line-through",
    },
    infoChips: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: Spacing[2],
      marginTop: Spacing[4],
    },
    infoChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: Spacing[3],
      paddingVertical: 7,
      borderRadius: Radius.full,
    },
    infoChipText: {
      fontFamily: FontFamily.sansMedium,
      fontSize: FontSize.xs,
    },
    specGrid: {
      marginTop: Spacing[5],
      gap: Spacing[2],
    },
    specRow: {
      flexDirection: "row",
      gap: Spacing[2],
    },
    section: {
      marginTop: Spacing[6],
    },
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
    more: {
      fontFamily: FontFamily.sansMedium,
      fontSize: FontSize.sm,
      marginTop: Spacing[2],
    },
    equipGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    equipItem: {
      width: "50%",
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing[2],
      paddingVertical: Spacing[2],
    },
    equipText: {
      fontFamily: FontFamily.sans,
      fontSize: FontSize.sm,
      flexShrink: 1,
    },
    sellerCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing[3],
      padding: Spacing[3],
      borderRadius: Radius.lg,
      borderWidth: StyleSheet.hairlineWidth * 2,
      marginTop: Spacing[6],
    },
    sellerLogo: {
      width: 52,
      height: 52,
      borderRadius: Radius.md,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    sellerLogoImg: {
      width: "100%",
      height: "100%",
    },
    sellerName: {
      fontFamily: FontFamily.sansBold,
      fontSize: FontSize.base,
    },
    sellerMeta: {
      fontFamily: FontFamily.sans,
      fontSize: FontSize.sm,
      marginTop: 1,
    },
    ratingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 3,
    },
    ratingText: {
      fontFamily: FontFamily.sansMedium,
      fontSize: FontSize.xs,
    },
    similarList: {
      paddingHorizontal: Spacing[5],
      gap: Spacing[3],
      paddingTop: Spacing[1],
    },
    contactBar: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      borderTopWidth: StyleSheet.hairlineWidth * 2,
    },
    contactInner: {
      flexDirection: "row",
      gap: Spacing[3],
      paddingHorizontal: Spacing[5],
      paddingTop: Spacing[3],
    },
    darkSquare: {
      width: 54,
      height: 54,
      borderRadius: Radius.lg,
      alignItems: "center",
      justifyContent: "center",
    },
  });
}
