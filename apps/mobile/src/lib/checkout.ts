import * as WebBrowser from "expo-web-browser";

// Opens a Stripe Checkout / Billing Portal URL in an in-app browser and
// resolves when the user closes it, so callers can refresh state afterwards.
// Reuses the existing web payment backend — no native IAP.
export async function openCheckout(url: string | null | undefined): Promise<void> {
  if (!url) return;
  try {
    await WebBrowser.openBrowserAsync(url, {
      dismissButtonStyle: "close",
      // Match the app chrome on iOS.
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
    });
  } catch {
    // user cancelled or browser unavailable
  }
}
