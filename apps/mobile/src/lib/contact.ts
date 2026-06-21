import { Linking, Platform } from "react-native";

// Normalize a Swiss phone number to international digits for wa.me / tel.
// "079 123 45 67" → "41791234567"; "+41 79 …" → "41 79 …" digits.
function intlDigits(phone: string): string {
  let p = phone.replace(/[^\d+]/g, "");
  if (p.startsWith("+")) p = p.slice(1);
  else if (p.startsWith("00")) p = p.slice(2);
  else if (p.startsWith("0")) p = `41${p.slice(1)}`;
  return p;
}

export async function callPhone(phone: string) {
  await Linking.openURL(`tel:${phone.replace(/\s+/g, "")}`).catch(() => {});
}

export async function openWhatsApp(phone: string, message?: string) {
  const num = intlDigits(phone);
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  const url = `https://wa.me/${num}${text}`;
  await Linking.openURL(url).catch(() => {});
}

export async function sendEmail(email: string, subject?: string) {
  const q = subject ? `?subject=${encodeURIComponent(subject)}` : "";
  await Linking.openURL(`mailto:${email}${q}`).catch(() => {});
}

export async function openMaps(query: string) {
  const encoded = encodeURIComponent(query);
  const url = Platform.select({
    ios: `http://maps.apple.com/?q=${encoded}`,
    default: `https://www.google.com/maps/search/?api=1&query=${encoded}`,
  });
  await Linking.openURL(url).catch(() => {});
}

export async function openUrl(url: string) {
  const full = url.startsWith("http") ? url : `https://${url}`;
  await Linking.openURL(full).catch(() => {});
}
