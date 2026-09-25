import AsyncStorage from "@react-native-async-storage/async-storage";
import { parseTimer, type Timer } from "../timer";
import {
  defaultPreferences,
  parsePreferences,
  type Preferences,
} from "../domain/preferences";

// Keep the existing key so the first prototype's history survives the refactor.
const STORAGE_KEY = "pomodog.prototype.v1";
export type SavedPrototype = { timer: Timer; preferences: Preferences };

export async function loadPrototype(): Promise<SavedPrototype | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const saved = JSON.parse(raw);
  const timer = parseTimer(saved?.timer);
  if (!timer) throw new Error("Invalid saved timer");
  return {
    timer,
    preferences: parsePreferences(saved.preferences) ?? defaultPreferences,
  };
}

export async function savePrototype(value: SavedPrototype) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}
