import * as SecureStore from "expo-secure-store";

// Thin JSON wrapper over expo-secure-store. Used for small local state that
// needs to survive restarts without an account (onboarding flag, favorites).
export const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await SecureStore.getItemAsync(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  async set<T>(key: string, value: T): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, JSON.stringify(value));
    } catch {
      // best-effort; ignore write failures
    }
  },
  async remove(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // ignore
    }
  },
};

export const STORAGE_KEYS = {
  onboardingSeen: "av_onboarding_seen",
  favorites: "av_favorites",
} as const;
