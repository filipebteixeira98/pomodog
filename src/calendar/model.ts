import { dayKey } from "#src/timer.ts";

export type BusyPeriod = { start: number; end: number };
export type CalendarPreferences = {
  start: number;
  end: number;
  reminder: number;
  weekdays: number[];
  anticipate: boolean;
  reminders: boolean;
};
export type CalendarSuggestion = BusyPeriod & {
  day: string;
  notifyAt: number;
};
export type CalendarRecord = {
  owner: string;
  googleId: string;
  zone: string;
  cycleMinutes: number;
  preferences: CalendarPreferences;
  lastAttempt: number | null;
  lastScheduledAt: number | null;
  dismissedDay: string | null;
  suggestion: CalendarSuggestion | null;
};
export const defaultCalendarPreferences: CalendarPreferences = {
  start: 9 * 60,
  end: 18 * 60,
  reminder: 8 * 60,
  weekdays: [1, 2, 3, 4, 5],
  anticipate: false,
  reminders: false,
};
export const calendarZone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone;
export class CalendarError extends Error {
  readonly code:
    "authorization" | "configuration" | "network" | "invalid" | "permission";
  constructor(code: CalendarError["code"]) {
    super(`calendar-${code}`);
    this.code = code;
  }
}

export function validCalendarPreferences(
  value: unknown,
): value is CalendarPreferences {
  if (!value || typeof value !== "object") return false;
  const p = value as CalendarPreferences;
  return (
    Number.isInteger(p.start) &&
    p.start >= 0 &&
    Number.isInteger(p.end) &&
    p.end <= 24 * 60 &&
    p.start < p.end &&
    Number.isInteger(p.reminder) &&
    p.reminder >= 0 &&
    p.reminder < 24 * 60 &&
    (!p.reminders ||
      (p.reminder >= 7 * 60 &&
        p.reminder <= 21 * 60 &&
        p.reminder < p.start)) &&
    Array.isArray(p.weekdays) &&
    p.weekdays.length > 0 &&
    p.weekdays.length <= 7 &&
    new Set(p.weekdays).size === p.weekdays.length &&
    p.weekdays.every((day) => Number.isInteger(day) && day >= 0 && day <= 6) &&
    typeof p.anticipate === "boolean" &&
    typeof p.reminders === "boolean"
  );
}

export function atMinute(date: Date, minutes: number) {
  const result = new Date(date);
  result.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return result.getTime();
}

export function calendarRange(now: number, anticipate: boolean) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (!anticipate) start.setDate(start.getDate() + 1);
  const end = new Date(now);
  end.setHours(0, 0, 0, 0);
  end.setDate(end.getDate() + 2);
  return { start: start.getTime(), end: end.getTime() };
}

export function suggestCalendarFocus(
  busy: BusyPeriod[],
  preferences: CalendarPreferences,
  focusMinutes: number,
  restMinutes: number,
  now: number,
): CalendarSuggestion | null {
  if (
    !validCalendarPreferences(preferences) ||
    focusMinutes <= 0 ||
    restMinutes < 0
  )
    return null;
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (!preferences.weekdays.includes(tomorrow.getDay())) return null;
  const routineStart = atMinute(tomorrow, preferences.start);
  const routineEnd = atMinute(tomorrow, preferences.end);
  const periods = busy
    .filter((p) => p.end > p.start)
    .sort((a, b) => a.start - b.start);
  const conflict = periods.find(
    (p) => p.end > routineStart && p.start < routineEnd,
  );
  if (!conflict) return null;
  const day = preferences.anticipate ? new Date(now) : tomorrow;
  if (!preferences.weekdays.includes(day.getDay())) return null;
  let start = Math.max(atMinute(day, preferences.start), now + 15 * 60_000);
  const end = preferences.anticipate
    ? atMinute(day, preferences.end)
    : Math.min(routineEnd, conflict.start - 10 * 60_000);
  const duration = (focusMinutes + restMinutes) * 60_000;
  for (const period of periods) {
    if (period.end <= start) continue;
    if (start + duration <= Math.min(period.start, end)) break;
    start = Math.max(start, period.end);
  }
  if (start + duration > end) return null;
  return {
    start,
    end: start + duration,
    day: dayKey(start),
    notifyAt: atMinute(day, preferences.reminder),
  };
}

export function parseCalendarRecord(value: unknown): CalendarRecord | null {
  if (!value || typeof value !== "object") return null;
  const r = value as CalendarRecord;
  if (
    typeof r.owner !== "string" ||
    r.owner.length > 256 ||
    typeof r.googleId !== "string" ||
    !r.googleId ||
    r.googleId.length > 256 ||
    typeof r.zone !== "string" ||
    !r.zone ||
    r.zone.length > 100 ||
    !Number.isFinite(r.cycleMinutes) ||
    r.cycleMinutes <= 0 ||
    r.cycleMinutes > 24 * 60 ||
    !validCalendarPreferences(r.preferences)
  )
    return null;
  const timestamp = (v: unknown): v is number | null =>
    v === null || (typeof v === "number" && Number.isFinite(v) && v >= 0);
  if (
    !timestamp(r.lastAttempt) ||
    !timestamp(r.lastScheduledAt) ||
    (r.dismissedDay !== null &&
      (typeof r.dismissedDay !== "string" ||
        !/^\d{4}-(?:[0-9]|1[01])-(?:[1-9]|[12]\d|3[01])$/.test(r.dismissedDay)))
  )
    return null;
  const s = r.suggestion;
  if (
    s !== null &&
    (!s ||
      !timestamp(s.start) ||
      !s.start ||
      !timestamp(s.end) ||
      !s.end ||
      !timestamp(s.notifyAt) ||
      !s.notifyAt ||
      s.end <= s.start ||
      (r.preferences.reminders && s.notifyAt >= s.start) ||
      s.day !== dayKey(s.start))
  )
    return null;
  return {
    owner: r.owner,
    googleId: r.googleId,
    zone: r.zone,
    cycleMinutes: r.cycleMinutes,
    preferences: {
      start: r.preferences.start,
      end: r.preferences.end,
      reminder: r.preferences.reminder,
      weekdays: [...r.preferences.weekdays],
      anticipate: r.preferences.anticipate,
      reminders: r.preferences.reminders,
    },
    lastAttempt: r.lastAttempt,
    lastScheduledAt: r.lastScheduledAt,
    dismissedDay: r.dismissedDay,
    suggestion: s
      ? { start: s.start, end: s.end, notifyAt: s.notifyAt, day: s.day }
      : null,
  };
}

export function calendarMessage(error: unknown) {
  if (error instanceof CalendarError) {
    switch (error.code) {
      case "authorization":
        return "Conecte sua agenda novamente para continuar.";
      case "configuration":
        return "A integração com a agenda ainda precisa ser liberada. Tente novamente mais tarde.";
      case "permission":
        return "Permita notificações nos ajustes do dispositivo para receber lembretes.";
      case "invalid":
        return "Confira os horários e selecione ao menos um dia. O aviso deve vir antes do foco.";
    }
  }
  return "Não foi possível consultar sua agenda. Tente novamente mais tarde.";
}
