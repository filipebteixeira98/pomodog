import { defaultPreferences } from "#src/domain/preferences.ts";
import {
  parseSavedPrototype,
  type SavedPrototype,
} from "#src/domain/savedPrototype.ts";
import { initialTimer, type Session } from "#src/timer.ts";

export const emptySaved: SavedPrototype = {
  timer: initialTimer,
  preferences: defaultPreferences,
  onboardingComplete: false,
};

/** Keep account settings, then remote settings, then guest settings. Union focus history. */
export function mergeAccountData(
  account: SavedPrototype | null,
  remote: SavedPrototype | null,
  guest: SavedPrototype | null,
): SavedPrototype {
  const base = account ?? remote ?? guest ?? emptySaved;
  const sessions = new Map<string, Session>();
  for (const source of [remote, account, guest]) {
    for (const session of source?.timer.sessions ?? []) {
      const previous = sessions.get(session.id);
      sessions.set(
        session.id,
        !session.task && previous?.task
          ? { ...session, task: previous.task }
          : session,
      );
    }
  }
  const sorted = [...sessions.values()]
    .sort((a, b) => a.endedAt - b.endedAt)
    .slice(-1000);
  const parsed = parseSavedPrototype({
    ...base,
    timer: { ...base.timer, sessions: sorted },
    onboardingComplete:
      account?.onboardingComplete ||
      remote?.onboardingComplete ||
      guest?.onboardingComplete ||
      false,
  });
  if (!parsed) throw new Error("Invalid merged account data");
  return parsed;
}
