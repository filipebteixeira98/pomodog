import { dayKey, type Session } from "#src/timer.ts";

export function summarizeDay(sessions: Session[], date = Date.now()) {
  const completed = sessions.filter(
    (session) => dayKey(session.endedAt) === dayKey(date),
  );
  return {
    count: completed.length,
    minutes: Math.round(
      completed.reduce((sum, session) => sum + session.seconds, 0) / 60,
    ),
  };
}

export function summarizeWeek(sessions: Session[], now = Date.now()) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (6 - index));
    return { date, ...summarizeDay(sessions, date.getTime()) };
  });
}

/** Rolling seven local calendar days, including today; round after summing. */
export function summarizeProgress(sessions: Session[], now = Date.now()) {
  const days = summarizeWeek(sessions, now);
  const keys = new Set(days.map(({ date }) => dayKey(date.getTime())));
  const completed = sessions.filter(
    (session) => session.endedAt <= now && keys.has(dayKey(session.endedAt)),
  );
  const seconds = completed.reduce((sum, session) => sum + session.seconds, 0);
  return {
    days: summarizeWeek(completed, now),
    count: completed.length,
    minutes: Math.round(seconds / 60),
    activeDays: new Set(completed.map((session) => dayKey(session.endedAt)))
      .size,
    averageMinutes: completed.length
      ? Math.round(seconds / completed.length / 60)
      : 0,
  };
}

/** A day counts once. Today's unfinished day does not break yesterday's streak. */
export function summarizeStreak(sessions: Session[], now = Date.now()) {
  const completed = sessions.filter((session) => session.endedAt <= now);
  const activeDates = new Set(
    completed.map((session) => dayKey(session.endedAt)),
  );
  const cursor = new Date(now);
  cursor.setHours(12, 0, 0, 0);
  if (!activeDates.has(dayKey(now))) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (activeDates.has(dayKey(cursor.getTime()))) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return {
    count,
    days: summarizeWeek(completed, now).map(({ date, count }) => ({
      date,
      completed: count > 0,
      today: dayKey(date.getTime()) === dayKey(now),
    })),
  };
}
