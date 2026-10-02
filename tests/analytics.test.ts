import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { createAnalytics } from "#src/analytics/controller.ts";
import {
  eventPayload,
  timerEvent,
  type UsageEvent,
} from "#src/analytics/events.ts";
import { initialTimer, timerReducer } from "#src/timer.ts";

const flush = () => new Promise<void>((resolve) => setImmediate(resolve));
function fixture(saved: string | null = null, supported = true) {
  let stored = saved;
  const changes: boolean[] = [];
  const events: { name: string; payload: Record<string, string | number> }[] =
    [];
  const analytics = createAnalytics({
    supported,
    read: async () => stored,
    write: async (value) => {
      stored = value;
    },
    configure: async (value) => {
      changes.push(value);
    },
    log: (name, payload) => {
      events.push({ name, payload });
    },
  });
  return { analytics, events, changes, stored: () => stored };
}
test("usage collection starts disabled, requires its own grant, and does not backfill events", async () => {
  const f = fixture();
  f.analytics.track({ name: "onboarding_complete" });
  await f.analytics.restore();
  f.analytics.track({ name: "onboarding_complete" });
  await f.analytics.set(true);
  f.analytics.track({ name: "screen_view", screen: "settings" });
  await flush();
  assert.deepEqual(f.events, [
    {
      name: "screen_view",
      payload: { screen_name: "settings", screen_class: "settings" },
    },
  ]);
  assert.equal(f.stored(), "enabled");
  assert.deepEqual(f.changes, [false, true]);
});
test("revocation closes the gate immediately and drops queued events from the previous grant", async () => {
  const f = fixture("enabled");
  await f.analytics.restore();
  f.analytics.track({ name: "onboarding_complete" });
  const revoke = f.analytics.set(false);
  assert.equal(f.analytics.enabled(), false);
  f.analytics.track({ name: "screen_view", screen: "focus" });
  await revoke;
  await f.analytics.set(true);
  await flush();
  assert.deepEqual(f.events, []);
  assert.deepEqual(f.changes, [true, false, true]);
});
test("late restore and cancelled activation cannot override a newer refusal", async () => {
  let resolve!: (value: string) => void;
  const changes: boolean[] = [];
  const analytics = createAnalytics({
    supported: true,
    read: () =>
      new Promise((done) => {
        resolve = done;
      }),
    write: async () => {},
    configure: async (value) => {
      changes.push(value);
    },
    log: () => assert.fail(),
  });
  const restore = analytics.restore();
  await flush();
  const enable = analytics.set(true);
  const disable = analytics.set(false);
  resolve("enabled");
  await Promise.all([restore, enable, disable]);
  assert.equal(analytics.enabled(), false);
  assert.deepEqual(changes, [false]);
});
test("failed activation resets its persisted grant and remains off", async () => {
  let stored: string | null = null;
  const analytics = createAnalytics({
    supported: true,
    read: async () => stored,
    write: async (value) => {
      stored = value;
    },
    configure: async (value) => {
      if (value) throw Error("native failure");
    },
    log: () => assert.fail(),
  });
  await analytics.restore();
  await assert.rejects(analytics.set(true));
  assert.equal(analytics.enabled(), false);
  assert.equal(stored, "disabled");
});
test("read/write failure and unsupported platforms never enable or measure usage", async () => {
  const analytics = createAnalytics({
    supported: true,
    read: async () => {
      throw Error("unreadable");
    },
    write: async () => {
      throw Error("unwritable");
    },
    configure: async (value) => assert.equal(value, false),
    log: () => assert.fail(),
  });
  await analytics.restore();
  await assert.rejects(analytics.set(true));
  assert.equal(analytics.enabled(), false);
  const f = fixture("enabled", false);
  await f.analytics.restore();
  await f.analytics.set(true);
  f.analytics.track({ name: "onboarding_complete" });
  await flush();
  assert.deepEqual(f.changes, []);
  assert.deepEqual(f.events, []);
  assert.equal(f.analytics.enabled(), false);
});
test("payload allowlist removes identity, arbitrary text and history", () => {
  const event = {
    name: "session_complete",
    mode: "focus",
    duration: 1500,
    email: "private",
    uid: "secret",
    sessions: [1],
    text: "personal",
  } as UsageEvent;
  assert.deepEqual(eventPayload(event), {
    session_mode: "focus",
    duration_seconds: 1500,
  });
  assert.equal(
    eventPayload({
      name: "screen_view",
      screen: "private",
    } as unknown as UsageEvent),
    null,
  );
  assert.equal(
    eventPayload({ name: "unknown" } as unknown as UsageEvent),
    null,
  );
  assert.equal(
    eventPayload({ name: "session_start", mode: "focus", duration: NaN }),
    null,
  );
});
test("timer telemetry follows successful transitions and reports previous mode once on completion", () => {
  const start = { type: "start", now: 1000 } as const;
  const running = timerReducer(initialTimer, start);
  assert.equal(timerEvent(initialTimer, running, start)?.name, "session_start");
  assert.equal(timerEvent(running, timerReducer(running, start), start), null);
  const pause = { type: "pause", now: 2000 } as const;
  const paused = timerReducer(running, pause);
  assert.equal(timerEvent(running, paused, pause)?.name, "session_pause");
  const resumed = timerReducer(paused, start);
  assert.equal(timerEvent(paused, resumed, start)?.name, "session_resume");
  const tick = {
    type: "tick",
    now: running.deadline!,
    nextDuration: 300,
  } as const;
  const completed = timerReducer(running, tick);
  assert.equal(completed.mode, "break");
  assert.deepEqual(timerEvent(running, completed, tick), {
    name: "session_complete",
    mode: "focus",
    duration: 1500,
  });
  assert.equal(
    timerEvent(completed, timerReducer(completed, tick), tick),
    null,
  );
  const breakRunning = timerReducer(completed, start);
  const breakTick = {
    type: "tick",
    now: breakRunning.deadline!,
    nextDuration: 1500,
  } as const;
  assert.deepEqual(
    timerEvent(breakRunning, timerReducer(breakRunning, breakTick), breakTick),
    { name: "session_complete", mode: "break", duration: 300 },
  );
  const restore = {
    type: "restore",
    value: running,
    now: tick.now,
    nextDuration: 300,
  } as const;
  assert.equal(
    timerEvent(restore.value, timerReducer(initialTimer, restore), restore)
      ?.name,
    "session_complete",
  );
});
test("native defaults deny collection and advertising before JavaScript consent restoration", () => {
  const config = JSON.parse(
    readFileSync(new URL("../firebase.json", import.meta.url), "utf8"),
  )["react-native"];
  for (const key of [
    "analytics_auto_collection_enabled",
    "analytics_default_allow_analytics_storage",
    "analytics_default_allow_ad_storage",
    "analytics_default_allow_ad_user_data",
    "analytics_default_allow_ad_personalization_signals",
    "google_analytics_automatic_screen_reporting_enabled",
    "google_analytics_adid_collection_enabled",
  ])
    assert.equal(config[key], false);
  const app = JSON.parse(
    readFileSync(new URL("../app.json", import.meta.url), "utf8"),
  ).expo;
  assert.ok(
    app.android.blockedPermissions.includes(
      "com.google.android.gms.permission.AD_ID",
    ),
  );
});
