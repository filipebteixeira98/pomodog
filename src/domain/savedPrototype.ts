import { parseTimer, type Timer } from "../timer.ts";
import {
  defaultPreferences,
  parsePreferences,
  type Preferences,
} from "./preferences.ts";

export type SavedPrototype = {
  timer: Timer;
  preferences: Preferences;
  onboardingComplete: boolean;
};

export function parseSavedPrototype(value: unknown): SavedPrototype | null {
  if (!value || typeof value !== "object") return null;
  const saved = value as Partial<SavedPrototype>;
  const version = (value as { schemaVersion?: unknown }).schemaVersion;
  if (version !== undefined && version !== 1) return null;
  const timer = parseTimer(saved.timer);
  if (!timer) return null;
  return {
    timer,
    preferences: parsePreferences(saved.preferences) ?? defaultPreferences,
    // The original prototype did not have onboarding. Preserve its data on upgrade.
    onboardingComplete: saved.onboardingComplete === true,
  };
}
