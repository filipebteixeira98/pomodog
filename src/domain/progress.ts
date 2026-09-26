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
