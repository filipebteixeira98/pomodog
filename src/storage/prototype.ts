import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  parseSavedPrototype,
  type SavedPrototype,
} from "../domain/savedPrototype";

// Keep the existing key so the first prototype's history survives the refactor.
const STORAGE_KEY = "pomodog.prototype.v1";

export async function loadPrototype(): Promise<SavedPrototype | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const saved = parseSavedPrototype(JSON.parse(raw));
  if (!saved) throw new Error("Invalid saved prototype");
  return saved;
}

export async function savePrototype(value: SavedPrototype) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}
