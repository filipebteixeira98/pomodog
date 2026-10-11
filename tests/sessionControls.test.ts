import assert from "node:assert/strict";
import test from "node:test";

import { defaultPreferences } from "#src/domain/preferences.ts";
import type { SavedPrototype } from "#src/domain/savedPrototype.ts";
import {
  applySessionControl,
  createSessionControls,
  parseSessionControl,
  sessionOwner,
  type SessionControl,
} from "#src/notifications/sessionControls.ts";
import { createSessionScheduler } from "#src/notifications/sessionScheduler.ts";
import { initialTimer, timerReducer } from "#src/timer.ts";

const token = "12345678-1234-1234-1234-123456789abc";
const snapshot = (mode: "focus" | "break" = "focus"): SavedPrototype => ({
  timer: {
    ...initialTimer,
    mode,
    duration: 60,
    remaining: 60,
    status: "running",
    deadline: 61000,
    sessions: [],
  },
  preferences: { ...defaultPreferences, sessionNotifications: true },
  onboardingComplete: true,
});
const pause: SessionControl = {
  token,
  owner: "guest",
  kind: "pause",
  mode: "focus",
  deadline: 61000,
  remaining: 60,
  at: 11250,
};
const resume = (remaining: number): SessionControl => ({
  ...pause,
  kind: "resume",
  deadline: 0,
  remaining,
  at: 30000,
});

function fixture() {
  let saved = snapshot();
  let permitted = true;
  let current = true;
  let writes = 0;
  const synced: SavedPrototype[] = [];
  const controller = createSessionControls(
    {
      authorized: async () => permitted,
      current: async () => current,
      load: async () => saved,
      save: async (_, next) => {
        saved = next;
        writes++;
      },
      sync: async (_, next) => {
        synced.push(next);
      },
    },
    () => 31000,
  );
  return {
    controller,
    get: () => saved,
    writes: () => writes,
    synced,
    revoke: () => {
      permitted = false;
    },
    expire: () => {
      current = false;
    },
  };
}

test("notification pause freezes fractional remaining time and resume excludes paused time in both modes", () => {
  for (const mode of ["focus", "break"] as const) {
    const saved = snapshot(mode);
    const paused = applySessionControl(saved, { ...pause, mode }, 14000)!.saved;
    assert.equal(paused.timer.status, "paused");
    assert.equal(paused.timer.remaining, 49.75);
    assert.equal(paused.timer.deadline, null);
    const resumed = applySessionControl(
      paused,
      { ...resume(49.75), mode },
      32000,
    )!.saved;
    assert.equal(resumed.timer.deadline, 81750);
    assert.equal(resumed.timer.remaining, 49.75);
    assert.equal(resumed.onboardingComplete, true);
    assert.deepEqual(resumed.preferences, saved.preferences);
    assert.deepEqual(resumed.timer.sessions, []);
  }
});

test("stale, expired, disabled and mismatched controls cannot change a session", () => {
  const saved = snapshot();
  for (const control of [
    { ...pause, deadline: 60000 },
    { ...pause, mode: "break" as const },
    { ...pause, at: 61000 },
    { ...pause, at: 33000 },
  ]) {
    assert.equal(applySessionControl(saved, control, 31000), null);
  }
  assert.equal(
    applySessionControl(
      {
        ...saved,
        preferences: { ...saved.preferences, sessionNotifications: false },
      },
      pause,
      31000,
    ),
    null,
  );
  assert.equal(applySessionControl(saved, resume(60), 31000), null);
  const paused = applySessionControl(saved, pause, 31000)!.saved;
  assert.equal(applySessionControl(paused, resume(50), 31000), null);
});

test("malformed control payloads are rejected and unrelated fields are discarded", () => {
  assert.equal(sessionOwner(null), "guest");
  assert.equal(sessionOwner("guest"), "uid:guest");
  assert.deepEqual(parseSessionControl({ ...pause, email: "private" }), pause);
  for (const patch of [
    { token: "invalid" },
    { owner: "../other" },
    { owner: "" },
    { kind: "reset" },
    { mode: "other" },
    { at: NaN },
    { remaining: Infinity },
    { remaining: -1 },
    { deadline: "61000" },
  ]) {
    assert.equal(parseSessionControl({ ...pause, ...patch }), null);
  }
});

test("background actions save locally and duplicate taps cannot resume or pause twice", async () => {
  const f = fixture();
  assert.equal(await f.controller.run(pause), true);
  assert.equal(f.get().timer.remaining, 49.75);
  assert.equal(await f.controller.run(pause), false);
  assert.equal(await f.controller.run(resume(49.75)), true);
  assert.equal(await f.controller.run(resume(49.75)), false);
  assert.equal(f.writes(), 2);
  assert.equal(f.synced.length, 2);
});

test("foreground actions use the live timer and persist the same state shown by the app", async () => {
  const f = fixture();
  let live = snapshot();
  live.timer = { ...live.timer, remaining: 45 };
  f.controller.connect({
    owner: "guest",
    read: () => live,
    blocked: () => false,
    apply: (action, now) => {
      live = {
        ...live,
        timer: timerReducer(timerReducer(live.timer, action), {
          type: "tick",
          now,
        }),
      };
    },
  });
  assert.equal(await f.controller.run(pause), true);
  assert.equal(live.timer.status, "paused");
  assert.deepEqual(f.get(), live);
});

test("revocation, stale notification tokens, account switches and deletion locks reject actions", async () => {
  const revoked = fixture();
  revoked.revoke();
  assert.equal(await revoked.controller.run(pause), false);
  assert.equal(revoked.writes(), 0);
  const expired = fixture();
  expired.expire();
  assert.equal(await expired.controller.run(pause), false);
  assert.equal(expired.writes(), 0);
  for (const binding of [
    { owner: "other-user", blocked: () => false, read: () => snapshot() },
    { owner: "guest", blocked: () => true, read: () => snapshot() },
    { owner: "guest", blocked: () => false, read: () => null },
  ]) {
    const f = fixture();
    f.controller.connect({
      ...binding,
      apply: () => assert.fail("must not mutate UI"),
    });
    assert.equal(await f.controller.run(pause), false);
    assert.equal(f.writes(), 0);
  }
});

test("reset while native validation is pending prevents the old action from reviving the timer", async () => {
  let finish!: () => void;
  const gate = new Promise<void>((resolve) => {
    finish = resolve;
  });
  let live = snapshot();
  let writes = 0;
  const controller = createSessionControls(
    {
      authorized: async () => true,
      current: async () => {
        await gate;
        return true;
      },
      load: async () => live,
      save: async () => {
        writes++;
      },
      sync: async () => {},
    },
    () => 31000,
  );
  controller.connect({
    owner: "guest",
    read: () => live,
    blocked: () => false,
    apply: () => assert.fail("reset session"),
  });
  const task = controller.run(pause);
  await new Promise<void>((resolve) => setImmediate(resolve));
  live = { ...live, timer: timerReducer(live.timer, { type: "reset" }) };
  finish();
  assert.equal(await task, false);
  assert.equal(writes, 0);
});

test("authorization revoked during native validation prevents any storage write", async () => {
  let authorized = true;
  let writes = 0;
  const controller = createSessionControls(
    {
      authorized: async () => authorized,
      current: async () => {
        authorized = false;
        return true;
      },
      load: async () => snapshot(),
      save: async () => {
        writes++;
      },
      sync: async () => {},
    },
    () => 31000,
  );
  assert.equal(await controller.run(pause), false);
  assert.equal(writes, 0);
});

test("hydration and notification actions share a queue and recover after a failed write", async () => {
  let live: SavedPrototype | null = null;
  let fail = true;
  const controller = createSessionControls(
    {
      authorized: async () => true,
      current: async () => true,
      load: async () => snapshot(),
      save: async () => {
        if (fail) throw new Error("storage failure");
      },
      sync: async () => {},
    },
    () => 31000,
  );
  controller.connect({
    owner: "guest",
    read: () => live,
    blocked: () => !live,
    apply: (action) => {
      live = { ...live!, timer: timerReducer(live!.timer, action) };
    },
  });
  const hydration = controller.hydrate(
    async () => snapshot(),
    (saved) => {
      live = saved;
    },
  );
  const control = controller.run(pause);
  await hydration;
  await assert.rejects(control, /storage failure/);
  assert.equal(live!.timer.status, "paused");
  fail = false;
  assert.equal(await controller.run(resume(49.75)), true);
});

test("paused notification cancels the completion alarm, renders resume and forwards account scope", async () => {
  const events: string[] = [];
  const scheduler = createSessionScheduler(
    {
      permitted: async () => true,
      pending: async () => null,
      cancel: async () => {
        events.push("cancel-end");
      },
      schedule: async () => {
        events.push("schedule-end");
      },
      countdown: {
        hide: async () => {
          events.push("hide");
        },
        show: async (_, mode, owner) => {
          events.push(`run:${mode}:${owner}`);
        },
        showPaused: async (remaining, mode, owner) => {
          events.push(`paused:${remaining}:${mode}:${owner}`);
        },
      },
    },
    () => 1000,
  );
  await scheduler.sync(
    { status: "paused", deadline: null, mode: "focus", remaining: 49.75 },
    true,
    "owner-a",
  );
  assert.deepEqual(events, ["cancel-end", "paused:49.75:focus:owner-a"]);
  events.length = 0;
  await scheduler.sync(
    { status: "running", deadline: 2000, mode: "focus", remaining: 1 },
    true,
    "owner-a",
  );
  assert.deepEqual(events, [
    "hide",
    "cancel-end",
    "schedule-end",
    "run:focus:owner-a",
  ]);
});
