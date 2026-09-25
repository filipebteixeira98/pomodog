import test from "node:test";
import assert from "node:assert/strict";
import { initialTimer, timerReducer, parseTimer } from "../src/timer.ts";

test("elapsed wall time catches up after backgrounding and only records completion once", () => {
  const running = timerReducer(initialTimer, { type: "start", now: 1000 });
  const finished = timerReducer(running, { type: "tick", now: 2000000 });
  assert.equal(finished.status, "completed");
  assert.equal(finished.sessions.length, 1);
  assert.equal(finished.sessions[0].endedAt, 1501000);
  assert.equal(
    timerReducer(finished, { type: "tick", now: 3000000 }).sessions.length,
    1,
  );
});

test("pause and resume preserve fractional seconds and exclude paused time", () => {
  const running = timerReducer(initialTimer, { type: "start", now: 1000 });
  const paused = timerReducer(running, { type: "pause", now: 2250 });
  assert.equal(paused.remaining, 1498.75);
  const resumed = timerReducer(paused, { type: "start", now: 10000 });
  assert.equal(resumed.deadline, 1508750);
});

test("demo and break sessions do not count as focus progress", () => {
  for (const config of [
    { mode: "break" as const, seconds: 300 },
    { mode: "focus" as const, seconds: 10, demo: true },
  ]) {
    const ready = timerReducer(initialTimer, { type: "configure", ...config });
    const running = timerReducer(ready, { type: "start", now: 0 });
    assert.equal(
      timerReducer(running, { type: "tick", now: 400000 }).sessions.length,
      0,
    );
  }
});

test("restoring an expired session records it once, at its original deadline", () => {
  const running = timerReducer(initialTimer, { type: "start", now: 5000 });
  const restored = timerReducer(initialTimer, {
    type: "restore",
    value: running,
    now: 2000000,
  });
  assert.equal(restored.sessions[0].endedAt, 1505000);
  const again = timerReducer(initialTimer, {
    type: "restore",
    value: restored,
    now: 3000000,
  });
  assert.equal(again.sessions.length, 1);
});

test("corrupt persisted timers are rejected and ongoing sessions cannot be reconfigured", () => {
  assert.equal(parseTimer({ ...initialTimer, remaining: -1 }), null);
  assert.equal(
    parseTimer({ ...initialTimer, status: "running", deadline: null }),
    null,
  );
  const running = timerReducer(initialTimer, { type: "start", now: 0 });
  assert.equal(
    timerReducer(running, { type: "configure", mode: "break", seconds: 300 }),
    running,
  );
});
