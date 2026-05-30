import { useMemo, useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Pressable,
  ActivityIndicator,
  Image,
  Dimensions,
  Linking,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { router, useLocalSearchParams } from 'expo-router';
import { FontFamily, FontSize, Spacing, Radius, type ThemeColors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { fetchVehicle, type VehicleDetail } from '@/lib/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(n: number) {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
    maximumFractionDigits: 0,
  }).format(n);
}

function formatKm(n: number) {
  return new Intl.NumberFormat('de-CH').format(n) + ' km';
}

function formatNum(n: number | null | undefined, suffix = ''): string | null {
  if (n == null) return null;
  const s = new Intl.NumberFormat('de-CH').format(n);
  return suffix ? `${s} ${suffix}` : s;
}

function formatFloat(n: number | null | undefined, suffix = ''): string | null {
  if (n == null) return null;
  const s = new Intl.NumberFormat('de-CH', { maximumFractionDigits: 2 }).format(n);
  return suffix ? `${s} ${suffix}` : s;
}

function formatRegistration(month: number | null, year: number): string {
  if (!month) return String(year);
  return `${String(month).padStart(2, '0')}/${year}`;
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('de-CH');
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DataRow({ label, value, styles }: { label: string; value: string | null | undefined; styles: ReturnType<typeof createStyles> }) {
  if (!value) return null;
  return (
    <View style={styles.dataRow}>
      <Text style={styles.dataLabel} numberOfLines={1}>{label}</Text>
      <Text style={styles.dataValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

function SectionCard({
  title,
  children,
  styles,
  C,
}: {
  title: string;
  children: React.ReactNode;
  styles: ReturnType<typeof createStyles>;
  C: ThemeColors;
}) {
  const [open, setOpen] = useState(true);
  return (
    <View style={styles.sectionCard}>
      <Pressable style={styles.sectionHeader} onPress={() => setOpen(v => !v)}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <SymbolView name={open ? 'chevron.up' : 'chevron.down'} size={13} tintColor={C.mutedForeground} />
      </Pressable>
      {open && <View style={styles.sectionBody}>{children}</View>}
    </View>
  );
}

function EquipmentChips({ items, styles, C }: { items: string[]; styles: ReturnType<typeof createStyles>; C: ThemeColors }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? items : items.slice(0, 12);
  return (
    <View style={{ gap: Spacing[3] }}>
      <View style={styles.chipGrid}>
        {visible.map(item => (
          <View key={item} style={styles.equipChip}>
            <SymbolView name="checkmark" size={10} tintColor={C.primary} />
            <Text style={styles.equipChipText}>{item}</Text>
          </View>
        ))}
      </View>
      {items.length > 12 && (
        <Pressable style={styles.showMoreBtn} onPress={() => setShowAll(v => !v)}>
          <Text style={styles.showMoreText}>
            {showAll ? 'Weniger anzeigen' : `Alle ${items.length} anzeigen`}
          </Text>
          <SymbolView name={showAll ? 'chevron.up' : 'chevron.down'} size={12} tintColor={C.primary} />
        </Pressable>
      )}
    </View>
  );
}

const ENERGY_COLORS: Record<string, string> = {
  A: '#00a651', B: '#4db848', C: '#8dc63f',
  D: '#f7ed00', E: '#fbb612', F: '#f37021', G: '#ed1c24',
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function VehicleDetailScreen() {
  const C = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [vehicle, setVehicle] = useState<VehicleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 });
  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) setCurrentImage(viewableItems[0].index ?? 0);
  }, []);

  useEffect(() => {
    if (!id) return;
    fetchVehicle(id)
      .then(setVehicle)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: C.background }]}>
        <ActivityIndicator color={C.primary} size="large" />
      </View>
    );
  }

  if (error || !vehicle) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: C.background }]} edges={['top']}>
        <SymbolView name="exclamationmark.circle" size={48} tintColor={C.mutedForeground} />
        <Text style={styles.errorTitle}>Fahrzeug nicht gefunden</Text>
        <Pressable style={styles.backBtn2} onPress={() => router.back()}>
          <Text style={styles.backBtn2Text}>Zurück</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const v = vehicle;
  const title = [v.make, v.model, v.version].filter(Boolean).join(' ');
  const powerLabel = v.kw != null || v.hp != null
    ? [v.kw != null ? `${v.kw} kW` : null, v.hp != null ? `(${v.hp} PS)` : null].filter(Boolean).join(' ')
    : null;
  const registrationLabel = formatRegistration(v.registrationMonth, v.registrationYear);

  // Equipment items (keys with value === true)
  const equipmentItems = v.equipment
    ? Object.entries(v.equipment).filter(([, val]) => val === true).map(([k]) => k)
    : [];
  const extrasItems = v.extras
    ? Object.entries(v.extras).filter(([, val]) => val === true).map(([k]) => k)
    : [];

  const CONTACT_BAR_HEIGHT = 80;

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: CONTACT_BAR_HEIGHT + insets.bottom }}
      >
        {/* Image Gallery */}
        <View style={[styles.gallery, { width: screenWidth, height: 280 }]}>
          {v.images.length > 0 ? (
            <>
              <FlatList
                data={v.images}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, i) => String(i)}
                viewabilityConfig={viewabilityConfig.current}
                onViewableItemsChanged={onViewableItemsChanged}
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: item }}
                    style={{ width: screenWidth, height: 280 }}
                    resizeMode="cover"
                  />
                )}
              />
              {v.images.length > 1 && (
                <View style={styles.pageDots}>
                  {v.images.map((_, i) => (
                    <View key={i} style={[styles.dot, i === currentImage && styles.dotActive]} />
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={[styles.imagePlaceholder, { width: screenWidth, height: 280 }]}>
              <SymbolView name="car.side.fill" size={56} tintColor={C.mutedForeground} />
            </View>
          )}
          {/* Image count badge */}
          {v.images.length > 1 && (
            <View style={styles.imageBadge}>
              <SymbolView name="photo" size={12} tintColor="#fff" />
              <Text style={styles.imageBadgeText}>{currentImage + 1}/{v.images.length}</Text>
            </View>
          )}
        </View>

        {/* Main content */}
        <View style={styles.content}>
          {/* Title & Price */}
          <View style={styles.titleBlock}>
            <View style={{ flex: 1 }}>
              <Text style={styles.make}>{v.make} {v.model}</Text>
              {v.version && <Text style={styles.version}>{v.version}</Text>}
            </View>
          </View>
          <View style={styles.priceBlock}>
            <Text style={styles.price}>{formatPrice(v.price)}</Text>
            {v.newPrice != null && v.newPrice > 0 && (
              <Text style={styles.newPrice}>Neupreis: {formatPrice(v.newPrice)}</Text>
            )}
          </View>

          {/* Key stats */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsRow}
          >
            <View style={styles.statChip}>
              <SymbolView name="calendar" size={14} tintColor={C.mutedForeground} />
              <Text style={styles.statText}>{registrationLabel}</Text>
            </View>
            <View style={styles.statChip}>
              <SymbolView name="gauge.medium" size={14} tintColor={C.mutedForeground} />
              <Text style={styles.statText}>{formatKm(v.kilometer)}</Text>
            </View>
            {v.fuel && (
              <View style={styles.statChip}>
                <SymbolView name="fuelpump.fill" size={14} tintColor={C.mutedForeground} />
                <Text style={styles.statText}>{v.fuel}</Text>
              </View>
            )}
            {powerLabel && (
              <View style={styles.statChip}>
                <SymbolView name="bolt.fill" size={14} tintColor={C.mutedForeground} />
                <Text style={styles.statText}>{powerLabel}</Text>
              </View>
            )}
            {v.transmission && (
              <View style={styles.statChip}>
                <SymbolView name="gearshape.fill" size={14} tintColor={C.mutedForeground} />
                <Text style={styles.statText}>{v.transmission}</Text>
              </View>
            )}
          </ScrollView>

          {/* Grunddaten */}
          {(v.bodyType || v.condition || v.driveType || v.seats || v.doors) && (
            <SectionCard title="Grunddaten" styles={styles} C={C}>
              <DataRow label="Aufbau" value={v.bodyType} styles={styles} />
              <DataRow label="Zustand" value={v.condition} styles={styles} />
              <DataRow label="Antrieb" value={v.driveType} styles={styles} />
              <DataRow label="Sitze" value={formatNum(v.seats)} styles={styles} />
              <DataRow label="Türen" value={formatNum(v.doors)} styles={styles} />
            </SectionCard>
          )}

          {/* Fahrzeuggeschichte */}
          <SectionCard title="Fahrzeuggeschichte" styles={styles} C={C}>
            <DataRow label="Kilometerstand" value={formatKm(v.kilometer)} styles={styles} />
            <DataRow label="Erstzulassung" value={registrationLabel} styles={styles} />
          </SectionCard>

          {/* Inspektion & Garantie */}
          {(v.lastInspectionDate || v.warranty) && (
            <SectionCard title="Inspektion & Garantie" styles={styles} C={C}>
              <DataRow label="Letzte Inspektion" value={formatDate(v.lastInspectionDate)} styles={styles} />
              {v.lastInspectionDate != null && (
                <DataRow label="MFK bestanden" value={v.inspectionPassed ? 'Ja' : 'Nein'} styles={styles} />
              )}
              <DataRow label="Garantietyp" value={v.warranty} styles={styles} />
              <DataRow label="Garantie ab" value={formatDate(v.warrantyStartDate)} styles={styles} />
              <DataRow label="Garantiedauer" value={v.warrantyDuration != null ? `${v.warrantyDuration} Monate` : null} styles={styles} />
              <DataRow label="Max. Garantie-km" value={formatNum(v.warrantyMaxKm, 'km')} styles={styles} />
            </SectionCard>
          )}

          {/* Technische Daten */}
          {(powerLabel || v.transmission || v.cubicCapacity || v.cylinders || v.numberOfGears ||
            v.emptyWeight || v.loadCapacity || v.wheelbase || v.towingCapacityBraked) && (
            <SectionCard title="Technische Daten" styles={styles} C={C}>
              <DataRow label="Leistung" value={powerLabel} styles={styles} />
              <DataRow label="Getriebe" value={v.transmission} styles={styles} />
              <DataRow label="Hubraum" value={formatNum(v.cubicCapacity, 'ccm')} styles={styles} />
              <DataRow label="Zylinder" value={formatNum(v.cylinders)} styles={styles} />
              <DataRow label="Gänge" value={formatNum(v.numberOfGears)} styles={styles} />
              <DataRow label="Leergewicht" value={formatNum(v.emptyWeight, 'kg')} styles={styles} />
              <DataRow label="Nutzlast" value={formatNum(v.loadCapacity, 'kg')} styles={styles} />
              <DataRow label="Radstand" value={formatNum(v.wheelbase, 'mm')} styles={styles} />
              <DataRow label="Anhängelast gebremst" value={formatNum(v.towingCapacityBraked, 'kg')} styles={styles} />
            </SectionCard>
          )}

          {/* Energie & Emissionen */}
          {(v.fuel || v.consumptionTotal || v.co2Emission || v.emissionStandard || v.energyLabel ||
            v.range || v.batteryCapacity || v.powerConsumption || v.chargingPower) && (
            <SectionCard title="Energie & Emissionen" styles={styles} C={C}>
              <DataRow label="Treibstoff" value={v.fuel} styles={styles} />
              <DataRow label="Verbrauch (Stadt)" value={formatFloat(v.consumptionCity, 'l/100km')} styles={styles} />
              <DataRow label="Verbrauch (Landstrasse)" value={formatFloat(v.consumptionCountry, 'l/100km')} styles={styles} />
              <DataRow label="Verbrauch (kombiniert)" value={formatFloat(v.consumptionTotal, 'l/100km')} styles={styles} />
              <DataRow label="CO₂-Emissionen" value={formatNum(v.co2Emission, 'g/km')} styles={styles} />
              <DataRow label="Euro-Norm" value={v.emissionStandard} styles={styles} />
              {/* Energy label badge */}
              {v.energyLabel && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Energieetikette</Text>
                  <View style={[styles.energyBadge, { backgroundColor: ENERGY_COLORS[v.energyLabel] ?? '#888' }]}>
                    <Text style={styles.energyBadgeText}>{v.energyLabel}</Text>
                  </View>
                </View>
              )}
              <DataRow label="Reichweite (elektrisch)" value={formatNum(v.range, 'km')} styles={styles} />
              <DataRow label="Batteriekapazität" value={formatFloat(v.batteryCapacity, 'kWh')} styles={styles} />
              <DataRow label="Stromverbrauch" value={formatFloat(v.powerConsumption, 'kWh/100km')} styles={styles} />
              <DataRow label="Ladeleistung" value={formatFloat(v.chargingPower, 'kW')} styles={styles} />
            </SectionCard>
          )}

          {/* Erscheinungsbild */}
          {(v.color || v.interiorColor || v.metallic != null) && (
            <SectionCard title="Erscheinungsbild" styles={styles} C={C}>
              <DataRow label="Aussenfarbe" value={v.color} styles={styles} />
              <DataRow label="Innenfarbe" value={v.interiorColor} styles={styles} />
              {v.metallic != null && (
                <DataRow label="Lackierung" value={v.metallic ? 'Metallic' : 'Uni'} styles={styles} />
              )}
            </SectionCard>
          )}

          {/* Identifikatoren */}
          {(v.vin || v.serialNumber || v.typeApproval) && (
            <SectionCard title="Identifikatoren" styles={styles} C={C}>
              <DataRow label="FIN / VIN" value={v.vin} styles={styles} />
              <DataRow label="Seriennummer" value={v.serialNumber} styles={styles} />
              <DataRow label="Typengenehmigung" value={v.typeApproval} styles={styles} />
            </SectionCard>
          )}

          {/* Ausstattung */}
          {equipmentItems.length > 0 && (
            <SectionCard title="Ausstattung" styles={styles} C={C}>
              <EquipmentChips items={equipmentItems} styles={styles} C={C} />
            </SectionCard>
          )}

          {/* Extras */}
          {extrasItems.length > 0 && (
            <SectionCard title="Extras" styles={styles} C={C}>
              <EquipmentChips items={extrasItems} styles={styles} C={C} />
            </SectionCard>
          )}

          {/* Beschreibung */}
          {v.description && (
            <SectionCard title="Beschreibung" styles={styles} C={C}>
              <Text style={styles.description}>{v.description}</Text>
            </SectionCard>
          )}

          {/* Händler */}
          {v.dealer && (
            <SectionCard title="Händler" styles={styles} C={C}>
              <View style={styles.dealerRow}>
                {v.dealer.logo && (
                  <Image source={{ uri: v.dealer.logo }} style={styles.dealerLogo} resizeMode="contain" />
                )}
                <View style={{ flex: 1 }}>
                  {v.dealer.name && <Text style={styles.dealerName}>{v.dealer.name}</Text>}
                  {v.dealer.address && (
                    <View style={styles.dealerMeta}>
                      <SymbolView name="mappin" size={12} tintColor={C.mutedForeground} />
                      <Text style={styles.dealerMetaText} numberOfLines={2}>{v.dealer.address}</Text>
                    </View>
                  )}
                  {v.dealer.phone && (
                    <View style={styles.dealerMeta}>
                      <SymbolView name="phone" size={12} tintColor={C.mutedForeground} />
                      <Text style={styles.dealerMetaText}>{v.dealer.phone}</Text>
                    </View>
                  )}
                </View>
              </View>
              {v.dealer.description && (
                <Text style={styles.dealerDescription} numberOfLines={4}>{v.dealer.description}</Text>
              )}
              <View style={styles.dealerActions}>
                {v.dealer.phone && (
                  <Pressable
                    style={styles.dealerActionBtn}
                    onPress={() => Linking.openURL(`tel:${v.dealer!.phone}`)}>
                    <SymbolView name="phone.fill" size={15} tintColor="#fff" />
                    <Text style={styles.dealerActionText}>Anrufen</Text>
                  </Pressable>
                )}
                {v.dealer.email && (
                  <Pressable
                    style={[styles.dealerActionBtn, styles.dealerActionBtnOutline]}
                    onPress={() => Linking.openURL(`mailto:${v.dealer!.email}`)}>
                    <SymbolView name="envelope" size={15} tintColor={C.primary} />
                    <Text style={[styles.dealerActionText, { color: C.primary }]}>E-Mail</Text>
                  </Pressable>
                )}
              </View>
            </SectionCard>
          )}
        </View>
      </ScrollView>

      {/* Floating back button */}
      <View style={[styles.floatingBack, { top: insets.top + Spacing[2] }]}>
        <Pressable style={styles.floatingBackBtn} onPress={() => router.back()}>
          <SymbolView name="chevron.left" size={18} tintColor={C.foreground} />
        </Pressable>
      </View>

      {/* Sticky contact bar */}
      {v.dealer?.phone && (
        <View style={[styles.contactBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.contactBarPrice}>
            <Text style={styles.contactBarPriceLabel}>Preis</Text>
            <Text style={styles.contactBarPriceValue}>{formatPrice(v.price)}</Text>
          </View>
          <Pressable
            style={styles.callBtn}
            onPress={() => Linking.openURL(`tel:${v.dealer!.phone}`)}>
            <SymbolView name="phone.fill" size={18} tintColor="#fff" />
            <Text style={styles.callBtnText}>Händler anrufen</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function createStyles(C: ThemeColors) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: C.background },

    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing[3],
      padding: Spacing[8],
    },
    errorTitle: {
      fontFamily: FontFamily.sansSemiBold,
      fontSize: FontSize.lg,
      color: C.foreground,
      textAlign: 'center',
    },
    backBtn2: {
      paddingHorizontal: Spacing[5],
      paddingVertical: Spacing[3],
      borderRadius: Radius.full,
      backgroundColor: C.primary,
    },
    backBtn2Text: {
      fontFamily: FontFamily.sansSemiBold,
      fontSize: FontSize.base,
      color: '#fff',
    },

    gallery: {
      backgroundColor: C.secondary,
      position: 'relative',
    },
    imagePlaceholder: {
      backgroundColor: C.secondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pageDots: {
      position: 'absolute',
      bottom: Spacing[3],
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 5,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: 'rgba(255,255,255,0.5)',
    },
    dotActive: {
      backgroundColor: '#fff',
      width: 18,
    },
    imageBadge: {
      position: 'absolute',
      bottom: Spacing[3],
      right: Spacing[3],
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(0,0,0,0.55)',
      paddingHorizontal: Spacing[2],
      paddingVertical: 4,
      borderRadius: Radius.md,
    },
    imageBadgeText: {
      fontFamily: FontFamily.sansMedium,
      fontSize: FontSize.xs,
      color: '#fff',
    },

    floatingBack: {
      position: 'absolute',
      left: Spacing[4],
    },
    floatingBackBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: C.card,
      borderWidth: 1,
      borderColor: C.border,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },

    content: {
      padding: Spacing[4],
      gap: Spacing[3],
    },

    titleBlock: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: Spacing[2],
    },
    make: {
      fontFamily: FontFamily.sansBold,
      fontSize: FontSize.xl,
      color: C.foreground,
      lineHeight: 26,
    },
    version: {
      fontFamily: FontFamily.sans,
      fontSize: FontSize.sm,
      color: C.mutedForeground,
      marginTop: 2,
    },
    priceBlock: {
      gap: 2,
    },
    price: {
      fontFamily: FontFamily.sansBold,
      fontSize: FontSize['2xl'],
      color: C.primary,
    },
    newPrice: {
      fontFamily: FontFamily.sans,
      fontSize: FontSize.sm,
      color: C.mutedForeground,
    },

    statsRow: {
      flexDirection: 'row',
      gap: Spacing[2],
    },
    statChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: Spacing[3],
      paddingVertical: Spacing[2],
      borderRadius: Radius.full,
      backgroundColor: C.secondary,
      borderWidth: 1,
      borderColor: C.border,
    },
    statText: {
      fontFamily: FontFamily.sansMedium,
      fontSize: FontSize.sm,
      color: C.mutedForeground,
    },

    // Section cards
    sectionCard: {
      backgroundColor: C.card,
      borderRadius: Radius.xl,
      borderWidth: 1,
      borderColor: C.border,
      overflow: 'hidden',
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: Spacing[4],
    },
    sectionTitle: {
      fontFamily: FontFamily.sansSemiBold,
      fontSize: FontSize.base,
      color: C.foreground,
    },
    sectionBody: {
      paddingHorizontal: Spacing[4],
      paddingBottom: Spacing[4],
      gap: Spacing[2],
    },

    // Data rows
    dataRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingVertical: Spacing[1],
      gap: Spacing[4],
    },
    dataLabel: {
      fontFamily: FontFamily.sans,
      fontSize: FontSize.sm,
      color: C.mutedForeground,
      flex: 1,
    },
    dataValue: {
      fontFamily: FontFamily.sansMedium,
      fontSize: FontSize.sm,
      color: C.foreground,
      flex: 1,
      textAlign: 'right',
    },

    // Energy label badge
    energyBadge: {
      paddingHorizontal: Spacing[3],
      paddingVertical: 4,
      borderRadius: Radius.md,
      minWidth: 36,
      alignItems: 'center',
    },
    energyBadgeText: {
      fontFamily: FontFamily.sansBold,
      fontSize: FontSize.base,
      color: '#fff',
    },

    // Equipment chips
    chipGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing[2],
    },
    equipChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: Spacing[3],
      paddingVertical: Spacing[1],
      borderRadius: Radius.full,
      backgroundColor: C.secondary,
      borderWidth: 1,
      borderColor: C.border,
    },
    equipChipText: {
      fontFamily: FontFamily.sans,
      fontSize: FontSize.xs,
      color: C.foreground,
    },
    showMoreBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    },
    showMoreText: {
      fontFamily: FontFamily.sansMedium,
      fontSize: FontSize.sm,
      color: C.primary,
    },

    // Description
    description: {
      fontFamily: FontFamily.sans,
      fontSize: FontSize.base,
      color: C.mutedForeground,
      lineHeight: 22,
    },

    // Dealer
    dealerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: Spacing[3],
    },
    dealerLogo: {
      width: 52,
      height: 52,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: C.border,
      backgroundColor: C.secondary,
    },
    dealerName: {
      fontFamily: FontFamily.sansBold,
      fontSize: FontSize.base,
      color: C.foreground,
      marginBottom: 4,
    },
    dealerMeta: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 5,
      marginBottom: 3,
    },
    dealerMetaText: {
      fontFamily: FontFamily.sans,
      fontSize: FontSize.sm,
      color: C.mutedForeground,
      flex: 1,
    },
    dealerDescription: {
      fontFamily: FontFamily.sans,
      fontSize: FontSize.sm,
      color: C.mutedForeground,
      lineHeight: 20,
      marginTop: Spacing[2],
    },
    dealerActions: {
      flexDirection: 'row',
      gap: Spacing[2],
      marginTop: Spacing[3],
    },
    dealerActionBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing[2],
      height: 44,
      borderRadius: Radius.xl,
      backgroundColor: C.primary,
    },
    dealerActionBtnOutline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: C.primary,
    },
    dealerActionText: {
      fontFamily: FontFamily.sansSemiBold,
      fontSize: FontSize.sm,
      color: '#fff',
    },

    // Contact bar
    contactBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing[4],
      paddingTop: Spacing[3],
      backgroundColor: C.card,
      borderTopWidth: 1,
      borderTopColor: C.border,
      gap: Spacing[3],
    },
    contactBarPrice: {
      flex: 1,
    },
    contactBarPriceLabel: {
      fontFamily: FontFamily.sans,
      fontSize: FontSize.xs,
      color: C.mutedForeground,
    },
    contactBarPriceValue: {
      fontFamily: FontFamily.sansBold,
      fontSize: FontSize.lg,
      color: C.foreground,
    },
    callBtn: {
      flex: 2,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing[2],
      height: 48,
      borderRadius: Radius.xl,
      backgroundColor: C.primary,
    },
    callBtnText: {
      fontFamily: FontFamily.sansBold,
      fontSize: FontSize.base,
      color: '#fff',
    },
  });
}
