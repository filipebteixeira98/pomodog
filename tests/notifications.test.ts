import assert from "node:assert/strict";
import test from "node:test";

import {
  defaultPreferences,
  parsePreferences,
} from "#src/domain/preferences.ts";
import {
  describeNativeError,
  notificationErrorMessage,
  NotificationFailure,
  notificationOperation,
} from "#src/notifications/diagnostics.ts";
import { createSessionScheduler } from "#src/notifications/sessionScheduler.ts";

test("notifications are opt-in for old records and malformed flags", () => {
  const { sessionNotifications: _, ...old } = defaultPreferences;
  assert.equal(parsePreferences(old)?.sessionNotifications, false);
  assert.equal(
    parsePreferences({ ...old, sessionNotifications: "true" })
      ?.sessionNotifications,
    false,
  );
  assert.equal(
    parsePreferences({ ...old, sessionNotifications: true })
      ?.sessionNotifications,
    true,
  );
});

test("scheduler replaces the alarm on resume and cancels on pause/reset/disable", async () => {
  const calls: string[] = [];
  const scheduler = createSessionScheduler(
    {
      permitted: async () => true,
      cancel: async () => {
        calls.push("cancel");
      },
      schedule: async (deadline, mode) => {
        calls.push(`${mode}:${deadline}`);
      },
    },
    () => 1000,
  );
  await scheduler.sync(
    { status: "running", deadline: 2000, mode: "focus" },
    true,
  );
  await scheduler.sync(
    { status: "paused", deadline: null, mode: "focus" },
    true,
  );
  await scheduler.sync(
    { status: "running", deadline: 3000, mode: "focus" },
    true,
  );
  await scheduler.sync({ status: "idle", deadline: null, mode: "focus" }, true);
  await scheduler.sync(
    { status: "running", deadline: 4000, mode: "break" },
    true,
  );
  await scheduler.sync(
    { status: "running", deadline: 4000, mode: "break" },
    false,
  );
  assert.deepEqual(calls, [
    "cancel",
    "focus:2000",
    "cancel",
    "cancel",
    "focus:3000",
    "cancel",
    "cancel",
    "break:4000",
    "cancel",
  ]);
});

test("completion and expired restore do not cancel a due OS notification or repeat it", async () => {
  const scheduler = createSessionScheduler(
    {
      permitted: async () => true,
      cancel: async () => {
        assert.fail("must allow delivery");
      },
      schedule: async () => {
        assert.fail("must not replay");
      },
    },
    () => 1000,
  );
  await scheduler.sync(
    { status: "completed", deadline: null, mode: "focus" },
    true,
  );
  await scheduler.sync(
    { status: "running", deadline: 900, mode: "focus" },
    true,
  );
});

test("permission denial cancels pending alerts, disabled never asks for permission", async () => {
  let canceled = 0;
  let checks = 0;
  const scheduler = createSessionScheduler({
    permitted: async () => {
      checks++;
      return false;
    },
    cancel: async () => {
      canceled++;
    },
    schedule: async () => {
      assert.fail("permission denied");
    },
  });
  await assert.rejects(
    scheduler.sync(
      { status: "running", deadline: Date.now() + 1000, mode: "focus" },
      true,
    ),
    /notification-permission/,
  );
  await scheduler.sync(
    { status: "idle", deadline: null, mode: "focus" },
    false,
  );
  assert.equal(canceled, 2);
  assert.equal(checks, 1);
});

test("late scheduling is serialized before a subsequent cancellation", async () => {
  let finish!: () => void;
  const gate = new Promise<void>((resolve) => {
    finish = resolve;
  });
  let scheduled = false;
  const scheduler = createSessionScheduler(
    {
      permitted: async () => true,
      cancel: async () => {
        scheduled = false;
      },
      schedule: async () => {
        await gate;
        scheduled = true;
      },
    },
    () => 0,
  );
  const start = scheduler.sync(
    { status: "running", deadline: 2000, mode: "focus" },
    true,
  );
  const pause = scheduler.sync(
    { status: "paused", deadline: null, mode: "focus" },
    true,
  );
  finish();
  await Promise.all([start, pause]);
  assert.equal(scheduled, false);
});

test("scheduler recovers its queue after a platform failure", async () => {
  let fail = true;
  let canceled = false;
  const scheduler = createSessionScheduler({
    permitted: async () => true,
    cancel: async () => {
      if (fail) throw new Error("native");
      canceled = true;
    },
    schedule: async () => {},
  });
  await assert.rejects(
    scheduler.sync({ status: "idle", deadline: null, mode: "focus" }, false),
  );
  fail = false;
  await scheduler.sync(
    { status: "idle", deadline: null, mode: "focus" },
    false,
  );
  assert.equal(canceled, true);
});

test("notification failures preserve native cause and identify the failed operation", async () => {
  const cause = Object.assign(new Error("Native channel failure"), {
    code: "ERR_CHANNEL",
  });
  await assert.rejects(
    notificationOperation("channel", async () => {
      throw cause;
    }),
    (error) => {
      assert.ok(error instanceof NotificationFailure);
      assert.equal(error.cause, cause);
      assert.equal(error.stage, "channel");
      assert.match(notificationErrorMessage(error), /preparar o canal/);
      return true;
    },
  );
  assert.equal(await notificationOperation("request", async () => true), true);
});

test("native diagnostics include non-enumerable messages and nested causes without cycles", () => {
  const native = Object.assign(new Error("Native details"), {
    code: "ERR_NATIVE",
  });
  const outer = new Error("Call rejected", { cause: native });
  native.cause = outer;
  const detail = describeNativeError(outer);
  assert.match(detail, /Call rejected/);
  assert.match(detail, /ERR_NATIVE/);
  assert.match(detail, /Native details/);
  assert.equal(detail.split("Call rejected").length, 2);
});
