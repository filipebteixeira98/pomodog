import assert from "node:assert/strict";
import { test } from "node:test";

import { initialTimer, timerReducer } from "#src/timer.ts";
import {
  connectProgressWidget,
  widgetPayload,
  type ProgressWidgetNative,
} from "#src/widgets/progressWidget.ts";

test("widget projects only bounded focus times and durations, without session or account identity", () => {
  const timer = {
    ...initialTimer,
    sessions: [{ id: "private-identifier", endedAt: 1000, seconds: 1500 }],
  };
  assert.deepEqual(JSON.parse(widgetPayload(timer)), [[1000, 1500]]);
  assert.equal(widgetPayload(timer).includes("private"), false);
});

test("pending focus follows pause/resume/reset without double counting after completion", () => {
  const running = timerReducer(initialTimer, { type: "start", now: 1000 });
  assert.deepEqual(JSON.parse(widgetPayload(running)), [[1_501_000, 1500]]);
  const paused = timerReducer(running, { type: "pause", now: 11_000 });
  assert.deepEqual(JSON.parse(widgetPayload(paused)), []);
  const resumed = timerReducer(paused, { type: "start", now: 21_000 });
  assert.deepEqual(JSON.parse(widgetPayload(resumed)), [[1_511_000, 1500]]);
  assert.deepEqual(
    JSON.parse(widgetPayload(timerReducer(resumed, { type: "reset" }))),
    [],
  );
  const completed = timerReducer(resumed, { type: "tick", now: 1_511_000 });
  assert.deepEqual(JSON.parse(widgetPayload(completed)), [[1_511_000, 1500]]);
});

test("breaks do not credit focus and a pending focus keeps all 1000 completed sessions until its deadline", () => {
  const running = timerReducer(initialTimer, { type: "start", now: 1000 });
  assert.deepEqual(
    JSON.parse(widgetPayload({ ...running, mode: "break" })),
    [],
  );
  const sessions = Array.from({ length: 1002 }, (_, i) => ({
    id: String(i),
    endedAt: i,
    seconds: 1500,
  }));
  const payload = JSON.parse(widgetPayload({ ...running, sessions }));
  assert.equal(payload.length, 1001);
  assert.deepEqual(payload[0], [2, 1500]);
  assert.deepEqual(payload.at(-1), [1_501_000, 1500]);
});

test("closing a connection during native initialization prevents late publication", async () => {
  let release!: (token: string) => void;
  const calls: string[] = [];
  const native: ProgressWidgetNative = {
    begin: () =>
      new Promise((resolve) => {
        release = resolve;
      }),
    update: async () => {
      calls.push("update");
    },
    end: async (token) => {
      calls.push(`end:${token}`);
    },
    clear: async () => {},
    updateForOwner: async () => {},
  };
  const scope = connectProgressWidget(native, "guest");
  const update = scope.update(initialTimer);
  const close = scope.close();
  release("old");
  await Promise.all([update, close]);
  assert.deepEqual(calls, ["end:old"]);
});

test("a previous connection cleanup cannot erase the new owner's snapshot", async () => {
  let current = "";
  let payload = "";
  let serial = 0;
  const native: ProgressWidgetNative = {
    begin: async () => {
      current = String(++serial);
      payload = "";
      return current;
    },
    update: async (token, value) => {
      if (token === current) payload = value;
    },
    end: async (token) => {
      if (token === current) payload = "";
    },
    clear: async () => {
      current = "";
      payload = "";
    },
    updateForOwner: async () => {},
  };
  const old = connectProgressWidget(native, "uid:old");
  await old.update(initialTimer);
  const next = connectProgressWidget(native, "uid:new");
  await next.update({
    ...initialTimer,
    sessions: [{ id: "new", endedAt: 10, seconds: 60 }],
  });
  await old.close();
  await old.update(initialTimer);
  assert.deepEqual(JSON.parse(payload), [[10, 60]]);
});
