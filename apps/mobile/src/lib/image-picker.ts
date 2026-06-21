import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

export type PickedImage = { uri: string; name: string; mime: string };

// Picks a single image from the library (used for avatar / logo / cover).
// Returns null on cancel or denied permission (alerts the user if denied).
export async function pickSingleImage(): Promise<PickedImage | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    Alert.alert("Zugriff erforderlich", "Bitte erlauben Sie den Zugriff auf Ihre Fotos in den Einstellungen.");
    return null;
  }
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: "images",
    allowsMultipleSelection: false,
    quality: 0.85,
  });
  if (res.canceled) return null;
  const a = res.assets[0];
  return { uri: a.uri, name: a.fileName ?? `image_${Date.now()}.jpg`, mime: a.mimeType ?? "image/jpeg" };
}
