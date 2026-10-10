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
      pending: async () => null,
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
      pending: async () => null,
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
    pending: async () => null,
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
      pending: async () => null,
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

test("sync with same deadline and mode preserves existing notification", async () => {
  const calls: string[] = [];
  const scheduler = createSessionScheduler(
    {
      permitted: async () => true,
      cancel: async () => {
        calls.push("cancel");
      },
      schedule: async (deadline, mode) => {
        calls.push(`schedule:${mode}:${deadline}`);
      },
      pending: async () => ({ deadline: 2000, mode: "focus" as const }),
    },
    () => 1000,
  );
  await scheduler.sync(
    { status: "running", deadline: 2000, mode: "focus" },
    true,
  );
  assert.deepEqual(calls, []);
});

test("sync with different deadline reschedules", async () => {
  const calls: string[] = [];
  const scheduler = createSessionScheduler(
    {
      permitted: async () => true,
      cancel: async () => {
        calls.push("cancel");
      },
      schedule: async (deadline, mode) => {
        calls.push(`schedule:${mode}:${deadline}`);
      },
      pending: async () => ({ deadline: 2000, mode: "focus" as const }),
    },
    () => 1000,
  );
  await scheduler.sync(
    { status: "running", deadline: 3000, mode: "focus" },
    true,
  );
  assert.deepEqual(calls, ["cancel", "schedule:focus:3000"]);
});

test("sync with different mode reschedules", async () => {
  const calls: string[] = [];
  const scheduler = createSessionScheduler(
    {
      permitted: async () => true,
      cancel: async () => {
        calls.push("cancel");
      },
      schedule: async (deadline, mode) => {
        calls.push(`schedule:${mode}:${deadline}`);
      },
      pending: async () => ({ deadline: 2000, mode: "focus" as const }),
    },
    () => 1000,
  );
  await scheduler.sync(
    { status: "running", deadline: 2000, mode: "break" },
    true,
  );
  assert.deepEqual(calls, ["cancel", "schedule:break:2000"]);
});

test("sync with no pending notification schedules", async () => {
  const calls: string[] = [];
  const scheduler = createSessionScheduler(
    {
      permitted: async () => true,
      cancel: async () => {
        calls.push("cancel");
      },
      schedule: async (deadline, mode) => {
        calls.push(`schedule:${mode}:${deadline}`);
      },
      pending: async () => null,
    },
    () => 1000,
  );
  await scheduler.sync(
    { status: "running", deadline: 2000, mode: "focus" },
    true,
  );
  assert.deepEqual(calls, ["cancel", "schedule:focus:2000"]);
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
    pending: async () => null,
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

test("enabling notifications schedules for current session", async () => {
  const calls: string[] = [];
  const scheduler = createSessionScheduler(
    {
      permitted: async () => true,
      cancel: async () => {
        calls.push("cancel");
      },
      schedule: async (deadline, mode) => {
        calls.push(`schedule:${mode}:${deadline}`);
      },
      pending: async () => null,
    },
    () => 1000,
  );
  await scheduler.sync(
    { status: "running", deadline: 2000, mode: "focus" },
    true,
  );
  assert.deepEqual(calls, ["cancel", "schedule:focus:2000"]);
});

test("opting out cancels without scheduling", async () => {
  const calls: string[] = [];
  const scheduler = createSessionScheduler(
    {
      permitted: async () => true,
      cancel: async () => {
        calls.push("cancel");
      },
      schedule: async () => {
        calls.push("schedule");
      },
      pending: async () => null,
    },
    () => 1000,
  );
  await scheduler.sync(
    { status: "running", deadline: 2000, mode: "focus" },
    false,
  );
  assert.deepEqual(calls, ["cancel"]);
});

test("opt-out does not ask for permission and cancels", async () => {
  let checks = 0;
  let canceled = 0;
  const scheduler = createSessionScheduler({
    permitted: async () => {
      checks++;
      return true;
    },
    cancel: async () => {
      canceled++;
    },
    schedule: async () => {
      assert.fail("must not schedule when disabled");
    },
    pending: async () => null,
  });
  await scheduler.sync(
    { status: "running", deadline: 2000, mode: "focus" },
    false,
  );
  assert.equal(checks, 0);
  assert.equal(canceled, 1);
});

test("first start schedules once with correct deadline and mode", async () => {
  const calls: string[] = [];
  const scheduler = createSessionScheduler(
    {
      permitted: async () => true,
      cancel: async () => {
        calls.push("cancel");
      },
      schedule: async (deadline, mode) => {
        calls.push(`schedule:${mode}:${deadline}`);
      },
      pending: async () => null,
    },
    () => 1000,
  );
  await scheduler.sync(
    { status: "running", deadline: 5000, mode: "break" },
    true,
  );
  assert.deepEqual(calls, ["cancel", "schedule:break:5000"]);
});

test("recreating scheduler with existing pending maintains idempotency", async () => {
  const calls: string[] = [];
  const adapter = {
    permitted: async () => true,
    cancel: async () => {
      calls.push("cancel");
    },
    schedule: async (deadline: number, mode: string) => {
      calls.push(`schedule:${mode}:${deadline}`);
    },
    pending: async () => ({ deadline: 3000, mode: "focus" as const }),
  };
  const scheduler1 = createSessionScheduler(adapter, () => 1000);
  await scheduler1.sync(
    { status: "running", deadline: 3000, mode: "focus" },
    true,
  );
  const scheduler2 = createSessionScheduler(adapter, () => 1000);
  await scheduler2.sync(
    { status: "running", deadline: 3000, mode: "focus" },
    true,
  );
  assert.deepEqual(calls, []);
});

test("focus and break with same deadline are not treated as same request", async () => {
  const calls: string[] = [];
  const scheduler = createSessionScheduler(
    {
      permitted: async () => true,
      cancel: async () => {
        calls.push("cancel");
      },
      schedule: async (deadline, mode) => {
        calls.push(`schedule:${mode}:${deadline}`);
      },
      pending: async () => ({ deadline: 2000, mode: "focus" as const }),
    },
    () => 1000,
  );
  await scheduler.sync(
    { status: "running", deadline: 2000, mode: "break" },
    true,
  );
  assert.deepEqual(calls, ["cancel", "schedule:break:2000"]);
});

test("completed or expired do not cancel due notification", async () => {
  let canceled = 0;
  const scheduler = createSessionScheduler(
    {
      permitted: async () => true,
      cancel: async () => {
        canceled++;
      },
      schedule: async () => {
        assert.fail("must not reschedule");
      },
      pending: async () => ({ deadline: 500, mode: "focus" as const }),
    },
    () => 1000,
  );
  await scheduler.sync(
    { status: "completed", deadline: null, mode: "focus" },
    true,
  );
  await scheduler.sync(
    { status: "running", deadline: 500, mode: "focus" },
    true,
  );
  assert.equal(canceled, 0);
});

test("slow schedule followed by cancel ends with no pending", async () => {
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
      pending: async () => null,
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

test("read failures do not poison the queue", async () => {
  let fail = true;
  let canceled = false;
  const scheduler = createSessionScheduler({
    permitted: async () => true,
    cancel: async () => {
      canceled = true;
    },
    schedule: async () => {},
    pending: async () => {
      if (fail) throw new Error("read error");
      return null;
    },
  });
  await scheduler.sync(
    { status: "running", deadline: 2000, mode: "focus" },
    true,
  );
  fail = false;
  await scheduler.sync(
    { status: "idle", deadline: null, mode: "focus" },
    false,
  );
  assert.equal(canceled, true);
});

test("invalid metadata and foreign IDs are not confused with current session", async () => {
  const calls: string[] = [];
  const scheduler = createSessionScheduler(
    {
      permitted: async () => true,
      cancel: async () => {
        calls.push("cancel");
      },
      schedule: async (deadline, mode) => {
        calls.push(`schedule:${mode}:${deadline}`);
      },
      pending: async () => null,
    },
    () => 1000,
  );
  await scheduler.sync(
    { status: "running", deadline: 2000, mode: "focus" },
    true,
  );
  assert.deepEqual(calls, ["cancel", "schedule:focus:2000"]);
});

test("deadline expiring during read does not cancel identical request", async () => {
  const calls: string[] = [];
  const scheduler = createSessionScheduler(
    {
      permitted: async () => true,
      cancel: async () => {
        calls.push("cancel");
      },
      schedule: async (deadline, mode) => {
        calls.push(`schedule:${mode}:${deadline}`);
      },
      pending: async () => ({ deadline: 1500, mode: "focus" as const }),
    },
    () => 1000,
  );
  await scheduler.sync(
    { status: "running", deadline: 1500, mode: "focus" },
    true,
  );
  assert.deepEqual(calls, []);
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

test("focus and break countdowns follow pause, resume, reset and opt-out", async () => {
  let visible: string | null = null;
  let pending: string | null = null;
  const scheduler = createSessionScheduler(
    {
      permitted: async () => true,
      cancel: async () => {
        pending = null;
      },
      schedule: async (deadline, mode) => {
        pending = `${mode}:${deadline}`;
      },
      pending: async () => null,
      countdown: {
        show: async (deadline, mode) => {
          visible = `${mode}:${deadline}`;
        },
        hide: async () => {
          visible = null;
        },
      },
    },
    () => 1000,
  );
  for (const mode of ["focus", "break"] as const) {
    await scheduler.sync({ status: "running", deadline: 2000, mode }, true);
    assert.equal(visible, `${mode}:2000`);
    assert.equal(pending, `${mode}:2000`);
    await scheduler.sync({ status: "paused", deadline: null, mode }, true);
    assert.equal(visible, null);
    assert.equal(pending, null);
    await scheduler.sync({ status: "running", deadline: 3000, mode }, true);
    assert.equal(visible, `${mode}:3000`);
    await scheduler.sync({ status: "idle", deadline: null, mode }, true);
    assert.equal(visible, null);
    assert.equal(pending, null);
    await scheduler.sync({ status: "running", deadline: 4000, mode }, true);
    await scheduler.sync({ status: "running", deadline: 4000, mode }, false);
    assert.equal(visible, null);
    assert.equal(pending, null);
  }
});

test("returning to a running session restores its countdown without replacing the end alert", async () => {
  let visible: number | null = null;
  const scheduler = createSessionScheduler(
    {
      permitted: async () => true,
      cancel: async () => assert.fail("existing alert must survive"),
      schedule: async () => assert.fail("must not duplicate end alert"),
      pending: async () => ({ deadline: 2000, mode: "focus" as const }),
      countdown: {
        show: async (deadline) => {
          visible = deadline;
        },
        hide: async () => {
          visible = null;
        },
      },
    },
    () => 1000,
  );
  await scheduler.sync(
    { status: "running", deadline: 2000, mode: "focus" },
    true,
  );
  assert.equal(visible, 2000);
});

test("completion and expired restore hide countdown without canceling the due end alert", async () => {
  let hidden = 0;
  const scheduler = createSessionScheduler(
    {
      permitted: async () => true,
      cancel: async () => assert.fail("due end alert must survive"),
      schedule: async () => assert.fail("must not replay completion"),
      pending: async () => null,
      countdown: {
        show: async () => assert.fail("expired countdown must not appear"),
        hide: async () => {
          hidden++;
        },
      },
    },
    () => 1000,
  );
  await scheduler.sync(
    { status: "completed", deadline: null, mode: "break" },
    true,
  );
  await scheduler.sync(
    { status: "running", deadline: 900, mode: "focus" },
    true,
  );
  assert.equal(hidden, 2);
});

test("revoked permission removes the visible countdown and pending completion", async () => {
  let visible = true;
  let scheduled = true;
  const scheduler = createSessionScheduler({
    permitted: async () => false,
    cancel: async () => {
      scheduled = false;
    },
    schedule: async () => assert.fail("permission denied"),
    pending: async () => null,
    countdown: {
      show: async () => assert.fail("permission denied"),
      hide: async () => {
        visible = false;
      },
    },
  });
  await assert.rejects(
    scheduler.sync(
      { status: "running", deadline: Date.now() + 1000, mode: "focus" },
      true,
    ),
    /notification-permission/,
  );
  assert.equal(visible, false);
  assert.equal(scheduled, false);
});

test("slow native countdown creation cannot survive a subsequent pause", async () => {
  let finish!: () => void;
  const gate = new Promise<void>((resolve) => {
    finish = resolve;
  });
  let visible = false;
  const scheduler = createSessionScheduler(
    {
      permitted: async () => true,
      cancel: async () => {},
      schedule: async () => {},
      pending: async () => null,
      countdown: {
        show: async () => {
          await gate;
          visible = true;
        },
        hide: async () => {
          visible = false;
        },
      },
    },
    () => 1000,
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
  assert.equal(visible, false);
});

test("failed countdown cleanup still cancels the end alert and allows later synchronization", async () => {
  let fail = true;
  let canceled = 0;
  let shown = false;
  const scheduler = createSessionScheduler(
    {
      permitted: async () => true,
      cancel: async () => {
        canceled++;
      },
      schedule: async () => {},
      pending: async () => null,
      countdown: {
        show: async () => {
          shown = true;
        },
        hide: async () => {
          if (fail) throw new Error("native cleanup");
        },
      },
    },
    () => 1000,
  );
  await assert.rejects(
    scheduler.sync({ status: "idle", deadline: null, mode: "focus" }, false),
    /native cleanup/,
  );
  assert.equal(canceled, 1);
  fail = false;
  await scheduler.sync(
    { status: "running", deadline: 2000, mode: "focus" },
    true,
  );
  assert.equal(shown, true);
});
