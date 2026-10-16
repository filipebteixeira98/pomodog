import assert from "node:assert/strict";
import test from "node:test";

import {
  calendarScope,
  parseFreeBusy,
  queryFreeBusy,
} from "#src/calendar/freeBusy.ts";
import { createCalendarIntegration } from "#src/calendar/integration.ts";
import {
  atMinute,
  CalendarError,
  calendarRange,
  calendarZone,
  defaultCalendarPreferences,
  parseCalendarRecord,
  suggestCalendarFocus,
  validCalendarPreferences,
  type BusyPeriod,
  type CalendarPreferences,
  type CalendarRecord,
  type CalendarSuggestion,
} from "#src/calendar/model.ts";
import { dayKey } from "#src/timer.ts";

const date = (day: number, hour: number, minute = 0) =>
  new Date(2026, 9, day, hour, minute).getTime();
const preferences = (patch: Partial<CalendarPreferences> = {}) => ({
  ...defaultCalendarPreferences,
  weekdays: [1, 2, 3, 4, 5],
  ...patch,
});
const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
};
function fixture() {
  let clock = date(15, 10);
  let stored: string | null = null;
  let authorized = 0;
  let queries = 0;
  let scheduled = 0;
  let pending: CalendarSuggestion | null = null;
  const adapter = {
    read: async () => stored,
    write: async (r: CalendarRecord) => {
      stored = JSON.stringify(r);
    },
    remove: async () => {
      stored = null;
    },
    authorize: async (): Promise<string | null> => {
      authorized++;
      return "calendar-google-id";
    },
    token: async (_id: string) => "test-token-never-persist",
    forget: async () => {},
    query: async (
      _token: string,
      _range: BusyPeriod,
      _signal: AbortSignal,
    ): Promise<BusyPeriod[]> => {
      queries++;
      const tomorrow = new Date(clock);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return [
        {
          start: atMinute(tomorrow, 13 * 60),
          end: atMinute(tomorrow, 14 * 60),
        },
      ];
    },
    notifications: {
      request: async () => true,
      permitted: async () => true,
      cancel: async () => {
        pending = null;
      },
      schedule: async (s: CalendarSuggestion) => {
        pending = s;
        scheduled++;
      },
    },
  };
  const integration = createCalendarIntegration(adapter, () => clock);
  return {
    integration,
    adapter,
    state: integration.getSnapshot,
    setNow: (v: number) => {
      clock = v;
    },
    seed: (r: CalendarRecord) => {
      stored = JSON.stringify(r);
    },
    stored: () => stored,
    authorized: () => authorized,
    queries: () => queries,
    scheduled: () => scheduled,
    pending: () => pending,
  };
}

test("calendar finds a complete focus/rest before tomorrow's conflict with a ten-minute margin", () => {
  const p = preferences();
  const s = suggestCalendarFocus(
    [{ start: date(16, 10), end: date(16, 12) }],
    p,
    25,
    5,
    date(15, 10),
  );
  assert.deepEqual(s, {
    start: date(16, 9),
    end: date(16, 9, 30),
    day: dayKey(date(16, 9)),
    notifyAt: date(16, 8),
  });
  assert.equal(
    suggestCalendarFocus(
      [{ start: date(16, 9, 35), end: date(16, 12) }],
      p,
      25,
      5,
      date(15, 10),
    ),
    null,
  );
});

test("calendar does not invent availability for free days, full-day events or disallowed weekdays", () => {
  const p = preferences();
  const now = date(15, 10);
  for (const busy of [
    [],
    [{ start: date(16, 0), end: date(17, 0) }],
    [{ start: date(16, 19), end: date(16, 20) }],
  ])
    assert.equal(suggestCalendarFocus(busy, p, 25, 5, now), null);
  assert.equal(
    suggestCalendarFocus(
      [{ start: date(16, 12), end: date(16, 13) }],
      preferences({ weekdays: [4] }),
      25,
      5,
      now,
    ),
    null,
  );
});

test("today requires explicit anticipation and respects overlapping busy periods and the current time", () => {
  const busy = [
    { start: date(15, 10), end: date(15, 11) },
    { start: date(15, 10, 30), end: date(15, 12) },
    { start: date(16, 9), end: date(16, 11) },
  ];
  assert.equal(
    suggestCalendarFocus(busy, preferences(), 25, 5, date(15, 10)),
    null,
  );
  const s = suggestCalendarFocus(
    busy,
    preferences({ anticipate: true }),
    25,
    5,
    date(15, 10),
  );
  assert.equal(s?.start, date(15, 12));
  assert.equal(s?.end, date(15, 12, 30));
  assert.equal(s?.day, dayKey(date(15, 12)));
  assert.equal(
    suggestCalendarFocus(
      busy,
      preferences({ anticipate: true }),
      25,
      5,
      date(15, 18),
    ),
    null,
  );
});

test("calendar ranges use local calendar boundaries across 23/25-hour DST days", () => {
  const previous = process.env.TZ;
  process.env.TZ = "America/New_York";
  try {
    for (const [month, day, hours] of [
      [2, 7, 23],
      [9, 31, 25],
    ]) {
      const now = new Date(2026, month, day, 12).getTime();
      const range = calendarRange(now, false);
      assert.equal((range.end - range.start) / 3_600_000, hours);
      assert.equal(new Date(range.start).getHours(), 0);
      assert.equal(new Date(range.end).getHours(), 0);
    }
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
});

test("calendar validates clocks, days, quiet hours and independent optional reminders", () => {
  assert.equal(validCalendarPreferences(preferences()), true);
  for (const patch of [
    { weekdays: [] },
    { weekdays: [1, 1] },
    { start: 1200, end: 1000 },
    { start: NaN },
    { reminders: true, reminder: 6 * 60 },
    { reminders: true, reminder: 9 * 60 },
  ])
    assert.equal(validCalendarPreferences(preferences(patch)), false);
  assert.equal(
    validCalendarPreferences(preferences({ start: 6 * 60, reminders: false })),
    true,
  );
});

test("FreeBusy reads only primary availability, clamps intervals and rejects partial errors", () => {
  const range = { start: date(16, 0), end: date(17, 0) };
  const response = {
    calendars: {
      primary: {
        busy: [
          {
            start: new Date(date(15, 23)).toISOString(),
            end: new Date(date(16, 1)).toISOString(),
          },
        ],
      },
    },
  };
  assert.deepEqual(parseFreeBusy(response, range), [
    { start: range.start, end: date(16, 1) },
  ]);
  assert.deepEqual(
    parseFreeBusy(
      { calendars: { "calendar@example.test": response.calendars.primary } },
      range,
    ),
    [{ start: range.start, end: date(16, 1) }],
  );
  assert.throws(
    () =>
      parseFreeBusy(
        { calendars: { primary: { busy: [] }, other: { busy: [] } } },
        range,
      ),
    CalendarError,
  );
  for (const value of [
    null,
    {},
    { calendars: { primary: { errors: [{ reason: "notFound" }], busy: [] } } },
    { calendars: { primary: { busy: [{ start: "bad", end: "bad" }] } } },
    { calendars: { primary: { busy: Array(4097).fill({}) } } },
  ])
    assert.throws(() => parseFreeBusy(value, range), CalendarError);
  assert.equal(
    calendarScope,
    "https://www.googleapis.com/auth/calendar.freebusy",
  );
});

test("Calendar HTTP sends the token only in the header with a minimal FreeBusy body", async () => {
  const range = { start: date(16, 0), end: date(17, 0) };
  const transport: typeof fetch = async (url, options) => {
    assert.equal(url, "https://www.googleapis.com/calendar/v3/freeBusy");
    assert.equal(options?.redirect, "error");
    assert.equal(
      (options?.headers as Record<string, string>).Authorization,
      "Bearer secret-test",
    );
    assert.deepEqual(JSON.parse(options?.body as string), {
      timeMin: new Date(range.start).toISOString(),
      timeMax: new Date(range.end).toISOString(),
      calendarExpansionMax: 1,
      items: [{ id: "primary" }],
    });
    return new Response(
      JSON.stringify({ calendars: { primary: { busy: [] } } }),
    );
  };
  assert.deepEqual(
    await queryFreeBusy(
      "secret-test",
      range,
      new AbortController().signal,
      transport,
    ),
    [],
  );
});

test("Calendar HTTP handles revoked scopes, disabled APIs, malformed bodies and cancellation without exposing payloads", async () => {
  const range = { start: date(16, 0), end: date(17, 0) };
  for (const [status, body, code] of [
    [401, "token-secret", "authorization"],
    [403, "SERVICE_DISABLED", "configuration"],
    [403, "insufficient scopes", "authorization"],
    [403, "userRateLimitExceeded", "network"],
    [429, "user-data", "network"],
    [200, "not json", "network"],
    [200, "x".repeat(512_001), "network"],
  ] as const) {
    await assert.rejects(
      queryFreeBusy(
        "token",
        range,
        new AbortController().signal,
        async () => new Response(body, { status }),
      ),
      (error) =>
        error instanceof CalendarError &&
        error.code === code &&
        !error.message.includes(body),
    );
  }
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    queryFreeBusy("token", range, controller.signal, async () =>
      assert.fail("pre-cancelled request must not run"),
    ),
  );
  const waitForAbort: typeof fetch = async (_url, options) =>
    new Promise((_resolve, reject) => {
      options?.signal?.addEventListener(
        "abort",
        () => reject(new Error("cancelled")),
        { once: true },
      );
    });
  await assert.rejects(
    queryFreeBusy(
      "token",
      range,
      new AbortController().signal,
      waitForAbort,
      5,
    ),
    CalendarError,
  );
});

test("calendar stays disconnected until explicit authorization and persists no tokens or raw busy ranges", async () => {
  const f = fixture();
  await f.integration.activate("guest");
  assert.equal(await f.integration.refresh(), false);
  assert.equal(f.authorized(), 0);
  assert.equal(f.queries(), 0);
  assert.equal(
    await f.integration.save(preferences({ reminders: true })),
    true,
  );
  assert.equal(f.authorized(), 1);
  assert.equal(f.queries(), 1);
  assert.ok(f.pending());
  const saved = JSON.parse(f.stored()!);
  assert.deepEqual(
    Object.keys(saved).sort(),
    [
      "owner",
      "googleId",
      "zone",
      "cycleMinutes",
      "preferences",
      "lastAttempt",
      "lastScheduledAt",
      "dismissedDay",
      "suggestion",
    ].sort(),
  );
  assert.equal(f.stored()!.includes("test-token"), false);
  assert.equal(f.stored()!.includes('"busy"'), false);
  assert.equal(saved.owner, "guest");
  assert.equal(parseCalendarRecord(saved)?.googleId, "calendar-google-id");
});

test("calendar auto-refresh is limited to thirty minutes across restarts and tolerates clock rollback", async () => {
  const f = fixture();
  await f.integration.activate("guest");
  await f.integration.save(preferences({ reminders: true }));
  assert.equal(await f.integration.refresh(), false);
  await f.integration.stop();
  await f.integration.activate("guest");
  assert.ok(f.pending());
  assert.equal(await f.integration.refresh(), false);
  assert.equal(f.queries(), 1);
  f.setNow(date(15, 10, 30));
  assert.equal(await f.integration.refresh(), true);
  assert.equal(f.queries(), 2);
  f.setNow(date(15, 9));
  assert.equal(await f.integration.refresh(), true);
  assert.equal(f.queries(), 3);
});

test("calendar failures cancel stale reminders and back off instead of querying on every resume", async () => {
  const f = fixture();
  await f.integration.activate("guest");
  await f.integration.save(preferences({ reminders: true }));
  assert.ok(f.pending());
  let attempts = 0;
  f.adapter.query = async () => {
    attempts++;
    throw new Error("private token / calendar details");
  };
  f.setNow(date(15, 10, 31));
  assert.equal(await f.integration.refresh(), false);
  assert.equal(f.pending(), null);
  assert.equal(f.state().record?.suggestion, null);
  assert.equal(f.state().notice.includes("private"), false);
  await f.integration.refresh();
  assert.equal(attempts, 1);
});

test("revoked access removes the local connection and requires explicit reconnection", async () => {
  const f = fixture();
  await f.integration.activate("guest");
  await f.integration.save(preferences({ reminders: true }));
  f.adapter.token = async () => {
    throw new CalendarError("authorization");
  };
  f.setNow(date(15, 10, 31));
  await f.integration.refresh();
  assert.equal(f.stored(), null);
  assert.equal(f.state().record, null);
  assert.equal(f.pending(), null);
  assert.equal(await f.integration.refresh(), false);
});

test("a late calendar response cannot restore data or reminders after disconnect", async () => {
  const f = fixture();
  await f.integration.activate("guest");
  await f.integration.save(preferences({ reminders: true }));
  const started = deferred<AbortSignal>();
  const result = deferred<BusyPeriod[]>();
  f.adapter.query = async (_token, _range, signal) => {
    started.resolve(signal);
    return result.promise;
  };
  const refresh = f.integration.refresh(true);
  const signal = await started.promise;
  const disconnect = f.integration.disconnect();
  assert.equal(signal.aborted, true);
  result.resolve([{ start: date(16, 13), end: date(16, 14) }]);
  await Promise.all([refresh, disconnect]);
  assert.equal(f.stored(), null);
  assert.equal(f.state().record, null);
  assert.equal(f.pending(), null);
});

test("owner changes discard the previous calendar without silently authorizing another account", async () => {
  const f = fixture();
  await f.integration.activate("user-a");
  await f.integration.save(preferences({ reminders: true }));
  const started = deferred<AbortSignal>();
  const result = deferred<BusyPeriod[]>();
  f.adapter.query = async (_token, _range, signal) => {
    started.resolve(signal);
    return result.promise;
  };
  const refresh = f.integration.refresh(true);
  await started.promise;
  const activate = f.integration.activate("user-b");
  result.resolve([]);
  await Promise.all([refresh, activate]);
  assert.equal(f.stored(), null);
  assert.equal(f.state().record, null);
  assert.equal(f.pending(), null);
  assert.equal(f.authorized(), 1);
});

test("permission denial and cancelled OAuth do not enable integration or duplicate operations", async () => {
  const f = fixture();
  await f.integration.activate("guest");
  f.adapter.notifications.request = async () => false;
  assert.equal(
    await f.integration.save(preferences({ reminders: true })),
    false,
  );
  assert.equal(f.authorized(), 0);
  assert.equal(f.stored(), null);
  const auth = deferred<string | null>();
  f.adapter.authorize = () => auth.promise;
  const first = f.integration.save(preferences());
  assert.equal(await f.integration.save(preferences()), false);
  auth.resolve(null);
  assert.equal(await first, false);
  assert.equal(f.state().busy, false);
  assert.equal(f.stored(), null);
});

test("dismissing a suggestion persists the choice and cancels only the agenda reminder", async () => {
  const f = fixture();
  await f.integration.activate("guest");
  await f.integration.save(preferences({ reminders: true }));
  assert.ok(f.pending());
  assert.equal(await f.integration.dismiss(), true);
  assert.equal(f.pending(), null);
  assert.equal(f.state().record?.suggestion, null);
  assert.equal(f.state().record?.dismissedDay, dayKey(date(16, 9)));
  await f.integration.stop();
  await f.integration.activate("guest");
  assert.equal(f.state().record?.dismissedDay, dayKey(date(16, 9)));
  await f.integration.refresh(true);
  assert.equal(f.state().record?.suggestion, null);
});

test("calendar will not schedule a second reminder on a day after an earlier one may have been delivered", async () => {
  const f = fixture();
  await f.integration.activate("guest");
  await f.integration.save(
    preferences({ weekdays: [0, 1, 2, 3, 4, 5, 6], reminders: true }),
  );
  assert.equal(f.scheduled(), 1);
  f.setNow(date(16, 8, 30));
  await f.integration.save(
    preferences({
      weekdays: [0, 1, 2, 3, 4, 5, 6],
      anticipate: true,
      reminders: true,
      start: 10 * 60,
      reminder: 9 * 60,
    }),
  );
  assert.ok(f.state().record?.suggestion);
  assert.equal(f.pending(), null);
  assert.equal(f.scheduled(), 1);
});

test("turning off calendar reminders preserves suggestions without another OAuth prompt", async () => {
  const f = fixture();
  await f.integration.activate("guest");
  await f.integration.save(preferences({ reminders: true }));
  await f.integration.save(preferences({ reminders: false }));
  assert.ok(f.state().record?.suggestion);
  assert.equal(f.pending(), null);
  assert.equal(f.authorized(), 1);
});

test("calendar invalidates suggestions from another timezone before refreshing", async () => {
  const f = fixture();
  await f.integration.activate("guest");
  await f.integration.save(preferences({ reminders: true }));
  const record = JSON.parse(f.stored()!);
  record.zone = calendarZone() === "UTC" ? "America/Sao_Paulo" : "UTC";
  f.seed(record);
  await f.integration.activate("guest");
  assert.equal(f.state().record?.suggestion, null);
  assert.equal(f.state().record?.lastAttempt, null);
  assert.equal(f.pending(), null);
  await f.integration.refresh();
  assert.equal(f.queries(), 2);
});

test("calendar validates persisted state and strips unknown identity or API fields", async () => {
  const f = fixture();
  await f.integration.activate("guest");
  await f.integration.save(preferences());
  const r = JSON.parse(f.stored()!);
  assert.equal(
    parseCalendarRecord({
      ...r,
      preferences: { ...r.preferences, weekdays: [] },
    }),
    null,
  );
  assert.equal(
    parseCalendarRecord({ ...r, suggestion: { ...r.suggestion, end: -1 } }),
    null,
  );
  const clean = parseCalendarRecord({
    ...r,
    token: "secret",
    email: "private@example.test",
    busy: [{ start: 1, end: 2 }],
  });
  assert.equal(JSON.stringify(clean).includes("secret"), false);
  assert.equal(JSON.stringify(clean).includes("private@example"), false);
});

test("calendar does not restore a short cached slot after focus/rest durations change", async () => {
  const f = fixture();
  await f.integration.activate("guest");
  await f.integration.save(preferences({ reminders: true }));
  await f.integration.stop();
  f.integration.setDurations(50, 10);
  await f.integration.activate("guest");
  assert.equal(f.state().record?.suggestion, null);
  assert.equal(f.state().record?.lastAttempt, null);
  assert.equal(f.pending(), null);
  await f.integration.refresh();
  const s = f.state().record?.suggestion;
  assert.ok(s);
  assert.equal(s.end - s.start, 60 * 60_000);
});
