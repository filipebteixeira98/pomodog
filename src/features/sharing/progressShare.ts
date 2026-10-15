import { summarizeProgress, summarizeStreak } from "#src/domain/progress.ts";
import type { Session } from "#src/timer.ts";

export type SharedProgress = {
  streakDays: number;
  weekMinutes: number;
  weekSessions: number;
};

// Public card content only: no account, session IDs, dates or activity text.
export function sharedProgress(
  sessions: Session[],
  now = Date.now(),
): SharedProgress {
  const week = summarizeProgress(sessions, now);
  return {
    streakDays: summarizeStreak(sessions, now).count,
    weekMinutes: week.minutes,
    weekSessions: week.count,
  };
}

const cacheLifetime = 24 * 60 * 60 * 1000;
const imageName = /^pomodog-(\d+)-[a-f0-9]{8}\.png$/;

// Keep recent handoffs readable by receiving apps; prune only our own files.
export function expiredProgressImages(names: string[], now = Date.now()) {
  return names
    .map((name) => ({ name, time: Number(imageName.exec(name)?.[1]) }))
    .filter(({ time }) => Number.isFinite(time))
    .sort((a, b) => b.time - a.time)
    .filter(({ time }, index) => now - time > cacheLifetime || index >= 8)
    .map(({ name }) => name);
}
