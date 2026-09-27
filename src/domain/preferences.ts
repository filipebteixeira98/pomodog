export const themes = [
  { name: "Sálvia", color: "#4E6B55" },
  { name: "Terracota", color: "#9A5945" },
  { name: "Lavanda", color: "#71608B" },
] as const;

export const focusDurations = [15, 25, 50];
export const breakDurations = [5, 10, 15];
export type Preferences = {
  focus: number;
  rest: number;
  theme: number;
  reduceMotion: boolean;
  sessionNotifications: boolean;
};
export const defaultPreferences: Preferences = {
  focus: 25,
  rest: 5,
  theme: 0,
  reduceMotion: false,
  sessionNotifications: false,
};

export function parsePreferences(value: unknown): Preferences | null {
  if (!value || typeof value !== "object") return null;
  const p = value as Preferences;
  if (
    !focusDurations.includes(p.focus) ||
    !breakDurations.includes(p.rest) ||
    !Number.isInteger(p.theme) ||
    p.theme < 0 ||
    p.theme >= themes.length ||
    typeof p.reduceMotion !== "boolean"
  )
    return null;
  return {
    focus: p.focus,
    rest: p.rest,
    theme: p.theme,
    reduceMotion: p.reduceMotion,
    sessionNotifications: p.sessionNotifications === true,
  };
}
