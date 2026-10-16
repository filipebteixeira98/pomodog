import {
  CalendarError,
  calendarMessage,
  calendarRange,
  calendarZone,
  parseCalendarRecord,
  suggestCalendarFocus,
  validCalendarPreferences,
  type BusyPeriod,
  type CalendarPreferences,
  type CalendarRecord,
  type CalendarSuggestion,
} from "#src/calendar/model.ts";
import { dayKey } from "#src/timer.ts";

type CalendarAdapter = {
  read: () => Promise<string | null>;
  write: (record: CalendarRecord) => Promise<void>;
  remove: () => Promise<void>;
  authorize: () => Promise<string | null>;
  token: (googleId: string) => Promise<string>;
  forget: () => Promise<unknown>;
  query: (
    token: string,
    range: BusyPeriod,
    signal: AbortSignal,
  ) => Promise<BusyPeriod[]>;
  notifications: {
    request: () => Promise<boolean>;
    permitted: () => Promise<boolean>;
    cancel: () => Promise<void>;
    schedule: (suggestion: CalendarSuggestion) => Promise<void>;
  };
};
export type CalendarSnapshot = {
  ready: boolean;
  busy: boolean;
  record: CalendarRecord | null;
  notice: string;
};
const interval = 30 * 60_000;

/** One owner per device. Serialize persistence/native effects and invalidate late OAuth/HTTP results. */
export function createCalendarIntegration(
  adapter: CalendarAdapter,
  now = Date.now,
) {
  let snapshot: CalendarSnapshot = {
    ready: false,
    busy: false,
    record: null,
    notice: "",
  };
  let owner: string | null = null;
  let generation = 0;
  let queue: Promise<unknown> = Promise.resolve();
  let request: AbortController | null = null;
  let focus = 25;
  let rest = 5;
  const listeners = new Set<() => void>();
  const publish = (patch: Partial<CalendarSnapshot>) => {
    snapshot = { ...snapshot, ...patch };
    listeners.forEach((listener) => listener());
  };
  function enqueue<T>(work: () => Promise<T>): Promise<T> {
    const result = queue.then(work);
    queue = result.catch(() => {});
    return result;
  }
  const current = (version: number) => version === generation && owner !== null;
  async function persist(record: CalendarRecord, version: number) {
    if (!current(version)) return;
    await adapter.write(record);
    if (current(version)) publish({ record });
  }
  async function reminder(record: CalendarRecord, version: number) {
    await adapter.notifications.cancel();
    if (!current(version)) return;
    const s = record.suggestion;
    if (
      !record.preferences.reminders ||
      !s ||
      s.start <= now() ||
      s.notifyAt <= now() ||
      s.day === record.dismissedDay ||
      !(await adapter.notifications.permitted())
    )
      return;
    if (!current(version)) return;
    // A previous reminder may already have been delivered: never add a second on that local day.
    if (
      record.lastScheduledAt !== null &&
      record.lastScheduledAt <= now() &&
      dayKey(record.lastScheduledAt) === dayKey(s.notifyAt)
    )
      return;
    // Record before scheduling; on a crash we prefer a missed reminder over duplicates.
    await persist({ ...record, lastScheduledAt: s.notifyAt }, version);
    if (current(version)) await adapter.notifications.schedule(s);
  }
  async function consult(version: number) {
    const previous = snapshot.record;
    if (!previous || !current(version)) return;
    const record = {
      ...previous,
      zone: calendarZone(),
      cycleMinutes: focus + rest,
      lastAttempt: now(),
      suggestion: null,
    };
    await adapter.notifications.cancel();
    await persist(record, version);
    if (!current(version)) return;
    request = new AbortController();
    const signal = request.signal;
    try {
      const token = await adapter.token(record.googleId);
      if (!current(version) || signal.aborted) return;
      const busy = await adapter.query(
        token,
        calendarRange(now(), record.preferences.anticipate),
        signal,
      );
      if (!current(version) || signal.aborted) return;
      const suggestion = suggestCalendarFocus(
        busy,
        record.preferences,
        focus,
        rest,
        now(),
      );
      const next = {
        ...record,
        cycleMinutes: focus + rest,
        suggestion: suggestion?.day === record.dismissedDay ? null : suggestion,
      };
      await persist(next, version);
      if (current(version)) await reminder(next, version);
    } catch (error) {
      if (!current(version) || signal.aborted) return;
      await adapter.notifications.cancel();
      if (error instanceof CalendarError && error.code === "authorization") {
        await adapter.remove();
        await adapter.forget().catch(() => {});
        if (current(version)) publish({ record: null });
      }
      throw error;
    } finally {
      if (current(version)) request = null;
    }
  }
  function perform(work: (version: number) => Promise<boolean>) {
    if (!snapshot.ready || snapshot.busy || !owner)
      return Promise.resolve(false);
    const version = generation;
    publish({ busy: true, notice: "" });
    return enqueue(async () => {
      if (!current(version)) return false;
      try {
        return await work(version);
      } catch (error) {
        if (typeof __DEV__ !== "undefined" && __DEV__)
          console.warn(
            "[Pomodog agenda]",
            error instanceof CalendarError ? error.code : "operation",
          );
        if (current(version)) publish({ notice: calendarMessage(error) });
        return false;
      } finally {
        if (current(version)) publish({ busy: false });
      }
    });
  }
  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    async activate(nextOwner: string) {
      const version = ++generation;
      owner = nextOwner;
      request?.abort();
      publish({ ready: false, busy: false, record: null, notice: "" });
      await enqueue(async () => {
        try {
          await adapter.notifications.cancel();
          if (!current(version)) return;
          const raw = await adapter.read();
          const record =
            raw && raw.length <= 10_000
              ? parseCalendarRecord(JSON.parse(raw))
              : null;
          if (!current(version)) return;
          if (raw && (!record || record.owner !== nextOwner)) {
            await adapter.remove();
            await adapter.forget().catch(() => {});
          } else if (record) {
            // Only a recent projection can restore a reminder without another API request.
            const sameZone = record.zone === calendarZone();
            const sameDuration = record.cycleMinutes === focus + rest;
            const recent =
              sameZone &&
              sameDuration &&
              record.lastAttempt !== null &&
              record.lastAttempt <= now() &&
              now() - record.lastAttempt < interval;
            const fresh = {
              ...record,
              lastAttempt: sameZone && sameDuration ? record.lastAttempt : null,
              suggestion:
                recent && record.suggestion && record.suggestion.start > now()
                  ? record.suggestion
                  : null,
            };
            await persist(fresh, version);
            if (current(version)) await reminder(fresh, version);
          }
          if (current(version)) publish({ ready: true });
        } catch {
          if (current(version))
            publish({
              ready: true,
              notice:
                "Não foi possível carregar a conexão da agenda. Tente novamente.",
            });
        }
      });
    },
    stop() {
      generation++;
      owner = null;
      request?.abort();
      request = null;
      publish({ ready: false, busy: false, record: null });
      return enqueue(() => adapter.notifications.cancel());
    },
    async disconnect() {
      const version = ++generation;
      request?.abort();
      request = null;
      publish({ ready: false, busy: true, record: null, notice: "" });
      try {
        await enqueue(async () => {
          await adapter.notifications.cancel();
          await adapter.remove();
          await adapter.forget().catch(() => {});
        });
      } finally {
        if (version === generation)
          publish({ ready: owner !== null, busy: false });
      }
    },
    setDurations(nextFocus: number, nextRest: number) {
      focus = nextFocus;
      rest = nextRest;
    },
    save(preferences: CalendarPreferences) {
      return perform(async (version) => {
        if (!validCalendarPreferences(preferences))
          throw new CalendarError("invalid");
        if (preferences.reminders && !(await adapter.notifications.request()))
          throw new CalendarError("permission");
        if (!current(version)) return false;
        const previous = snapshot.record;
        const googleId = previous?.googleId ?? (await adapter.authorize());
        if (!googleId || !current(version)) return false;
        const record: CalendarRecord = {
          owner: owner!,
          googleId,
          zone: calendarZone(),
          cycleMinutes: focus + rest,
          preferences: { ...preferences, weekdays: [...preferences.weekdays] },
          lastAttempt: null,
          lastScheduledAt: previous?.lastScheduledAt ?? null,
          dismissedDay: null,
          suggestion: null,
        };
        await persist(record, version);
        if (!current(version)) return false;
        await consult(version);
        return current(version);
      });
    },
    refresh(force = false) {
      const r = snapshot.record;
      if (
        !r ||
        (!force &&
          r.zone === calendarZone() &&
          r.lastAttempt !== null &&
          r.lastAttempt <= now() &&
          now() - r.lastAttempt < interval)
      )
        return Promise.resolve(false);
      return perform(async (version) => {
        await consult(version);
        return current(version);
      });
    },
    dismiss() {
      return perform(async (version) => {
        const record = snapshot.record;
        if (!record?.suggestion) return false;
        await adapter.notifications.cancel();
        await persist(
          { ...record, dismissedDay: record.suggestion.day, suggestion: null },
          version,
        );
        return current(version);
      });
    },
  };
}
