import { useMemo } from "react";
import { View, Text, StyleSheet, Pressable, Alert, Dimensions } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { FontFamily, FontSize, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { imageUrl } from "@/lib/image";
import { Icon } from "@/components/ui/icon";

export type FormImage =
  | { kind: "remote"; key: string }
  | { kind: "local"; uri: string; name: string; mime: string };

export function imageDisplayUri(img: FormImage): string {
  return img.kind === "remote" ? imageUrl(img.key) ?? "" : img.uri;
}

const MAX_IMAGES = 25;
const MIN_IMAGES = 5;
const GAP = Spacing[2];
const COLS = 3;

export function ImageGrid({
  images,
  onChange,
}: {
  images: FormImage[];
  onChange: (next: FormImage[]) => void;
}) {
  const C = useTheme();
  const tileSize = useMemo(() => {
    const screen = Dimensions.get("window").width - Spacing[5] * 2;
    return (screen - GAP * (COLS - 1)) / COLS;
  }, []);

  const pick = async () => {
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) return;

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Zugriff erforderlich", "Bitte erlauben Sie den Zugriff auf Ihre Fotos in den Einstellungen.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.8,
    });
    if (result.canceled) return;

    const picked: FormImage[] = result.assets.map((a, i) => ({
      kind: "local",
      uri: a.uri,
      name: a.fileName ?? `image_${Date.now()}_${i}.jpg`,
      mime: a.mimeType ?? "image/jpeg",
    }));
    onChange([...images, ...picked].slice(0, MAX_IMAGES));
  };

  const remove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const tooFew = images.length < MIN_IMAGES;

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={[styles.label, { color: C.mutedForeground }]}>Fotos *</Text>
        <Text style={[styles.count, { color: tooFew ? C.destructive : C.mutedForeground }]}>
          {images.length}/{MAX_IMAGES} {tooFew ? `· min. ${MIN_IMAGES}` : ""}
        </Text>
      </View>

      <View style={styles.grid}>
        {images.map((img, i) => (
          <View key={i} style={{ width: tileSize, height: tileSize }}>
            <Image source={{ uri: imageDisplayUri(img) }} style={styles.thumb} contentFit="cover" />
            {i === 0 && (
              <View style={[styles.coverBadge, { backgroundColor: C.primary }]}>
                <Text style={[styles.coverText, { color: C.primaryForeground }]}>Titel</Text>
              </View>
            )}
            <Pressable style={styles.removeBtn} onPress={() => remove(i)} hitSlop={6}>
              <Icon name="xmark.circle.fill" size={22} color="#fff" />
            </Pressable>
          </View>
        ))}

        {images.length < MAX_IMAGES && (
          <Pressable
            style={[styles.addTile, { width: tileSize, height: tileSize, backgroundColor: C.secondary, borderColor: C.border }]}
            onPress={pick}
          >
            <Icon name="plus" size={24} color={C.mutedForeground} />
            <Text style={[styles.addText, { color: C.mutedForeground }]}>Hinzufügen</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing[3] },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  label: { fontFamily: FontFamily.sansMedium, fontSize: FontSize.sm },
  count: { fontFamily: FontFamily.sansMedium, fontSize: FontSize.xs },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: GAP },
  thumb: { width: "100%", height: "100%", borderRadius: Radius.md },
  coverBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  coverText: { fontFamily: FontFamily.sansSemiBold, fontSize: 10 },
  removeBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
  },
  addTile: {
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  addText: { fontFamily: FontFamily.sansMedium, fontSize: FontSize.xs },
});
