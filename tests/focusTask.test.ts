import assert from "node:assert/strict";
import test from "node:test";

import { eventPayload, timerEvent } from "#src/analytics/events.ts";
import { normalizeTask } from "#src/domain/focusTask.ts";
import { defaultPreferences } from "#src/domain/preferences.ts";
import { summarizeTasks } from "#src/domain/progress.ts";
import { sharedProgress } from "#src/features/sharing/progressShare.ts";
import { mergeAccountData } from "#src/firebase/merge.ts";
import { applySessionControl } from "#src/notifications/sessionControls.ts";
import {
  initialTimer,
  parseTimer,
  timerReducer,
  type Session,
} from "#src/timer.ts";

test("task names are short, optional, trimmed and stripped of control characters", () => {
  assert.equal(normalizeTask("  Estudar \n inglês\u202e  "), "Estudar inglês");
  assert.equal(normalizeTask("a".repeat(60)), "a".repeat(60));
  for (const value of ["a".repeat(61), null, 123, " \n\t "])
    assert.equal(normalizeTask(value), undefined);
});

test("task attribution survives pause, resume and background completion, without changing old cycles", () => {
  const selected = timerReducer(initialTimer, { type: "setTask", task: "Ler" });
  const running = timerReducer(selected, { type: "start", now: 1000 });
  assert.equal(
    timerReducer(running, { type: "setTask", task: "Escrever" }),
    running,
  );
  const paused = timerReducer(running, { type: "pause", now: 2000 });
  assert.equal(timerReducer(paused, { type: "setTask", task: "" }), paused);
  const resumed = timerReducer(paused, { type: "start", now: 3000 });
  const restored = parseTimer(JSON.parse(JSON.stringify(resumed)))!;
  const done = timerReducer(initialTimer, {
    type: "restore",
    value: restored,
    now: 2000000,
  });
  assert.equal(done.sessions[0].task, "Ler");
  assert.equal(done.sessions.length, 1);
  const edited = timerReducer(done, { type: "setTask", task: "Escrever" });
  assert.equal(edited.sessions[0].task, "Ler");
  const rest = timerReducer(edited, { type: "start", now: 3000000 });
  const afterRest = timerReducer(rest, { type: "tick", now: 5000000 });
  assert.equal(afterRest.sessions.length, 1);
  assert.equal(afterRest.task, "Escrever");
  const cleared = timerReducer(afterRest, { type: "setTask", task: "" });
  assert.equal(Object.hasOwn(cleared, "task"), false);
  assert.equal(cleared.sessions[0].task, "Ler");
});

test("legacy sessions stay unassigned and invalid task metadata does not discard valid focus history", () => {
  const legacy = { id: "old", endedAt: 1, seconds: 1500 };
  const parsed = parseTimer({
    ...initialTimer,
    task: "a".repeat(61),
    sessions: [
      legacy,
      { ...legacy, id: "bad", task: { private: true } },
      { ...legacy, id: "named", task: "  Ler  " },
    ],
  })!;
  assert.equal(parsed.task, undefined);
  assert.deepEqual(parsed.sessions.slice(0, 2), [
    legacy,
    { ...legacy, id: "bad" },
  ]);
  assert.equal(parsed.sessions[2].task, "Ler");
  assert.deepEqual(parseTimer(initialTimer), initialTimer);
});

test("task chart ranks cycles rather than duration and excludes future completions", () => {
  const sessions: Session[] = [
    { id: "1", endedAt: 1, seconds: 900, task: "Ler" },
    { id: "2", endedAt: 2, seconds: 900, task: "ler" },
    { id: "3", endedAt: 3, seconds: 7200, task: "Escrever" },
    { id: "4", endedAt: 4, seconds: 1500 },
    { id: "5", endedAt: 100, seconds: 1500, task: "Futuro" },
  ];
  assert.deepEqual(summarizeTasks(sessions, 10), [
    { id: "task:ler", label: "Ler", count: 2 },
    { id: "task:escrever", label: "Escrever", count: 1 },
    { id: "unassigned", label: "Sem tarefa", count: 1 },
  ]);
  assert.deepEqual(summarizeTasks([], 10), []);
});

test("chart bounds its legend without losing cycles or confusing category names with tasks", () => {
  const sessions: Session[] = [
    "Sem tarefa",
    "Outras tarefas",
    "A",
    "B",
    "C",
    "D",
    "E",
  ].map((task, index) => ({
    id: String(index),
    task,
    endedAt: 1,
    seconds: 1500,
  }));
  sessions.push({ id: "unassigned", endedAt: 1, seconds: 1500 });
  const groups = summarizeTasks(sessions, 10);
  assert.equal(groups.length, 7);
  assert.equal(
    groups.reduce((sum, group) => sum + group.count, 0),
    8,
  );
  assert.equal(new Set(groups.map((group) => group.id)).size, 7);
  assert.equal(summarizeTasks([sessions[0]], 10)[0].count, 1);
});

test("account merge preserves guest task selection and each session's original task", () => {
  const guest = {
    timer: {
      ...initialTimer,
      task: "Ler",
      sessions: [{ id: "guest", endedAt: 1, seconds: 900, task: "Ler" }],
    },
    preferences: defaultPreferences,
    onboardingComplete: true,
  };
  const imported = mergeAccountData(null, null, guest);
  assert.equal(imported.timer.task, "Ler");
  const cloud = {
    ...guest,
    timer: {
      ...initialTimer,
      sessions: [{ id: "cloud", endedAt: 2, seconds: 900, task: "Estudar" }],
    },
  };
  const merged = mergeAccountData(imported, cloud, null);
  assert.deepEqual(
    merged.timer.sessions.map((session) => session.task),
    ["Ler", "Estudar"],
  );
  const legacy = {
    ...guest,
    timer: {
      ...initialTimer,
      sessions: [{ id: "cloud", endedAt: 2, seconds: 900 }],
    },
  };
  assert.equal(
    mergeAccountData(legacy, cloud, null).timer.sessions[0].task,
    "Estudar",
  );
});

test("notification controls preserve tasks while usage and share payloads exclude free text", () => {
  const running = timerReducer(
    { ...initialTimer, task: "Nome privado" },
    { type: "start", now: 1000 },
  );
  const saved = {
    timer: running,
    preferences: { ...defaultPreferences, sessionNotifications: true },
    onboardingComplete: true,
  };
  const paused = applySessionControl(
    saved,
    {
      kind: "pause",
      owner: "guest",
      token: "12345678-1234-1234-1234-123456789abc",
      mode: "focus",
      deadline: running.deadline!,
      remaining: running.remaining,
      at: 2000,
    },
    2000,
  )!;
  assert.equal(paused.saved.timer.task, "Nome privado");
  const event = timerEvent(initialTimer, running, {
    type: "start",
    now: 1000,
  })!;
  assert.deepEqual(eventPayload(event), {
    session_mode: "focus",
    duration_seconds: 1500,
  });
  const done = timerReducer(running, { type: "tick", now: 2000000 });
  assert.equal(
    JSON.stringify(sharedProgress(done.sessions, 2000000)).includes(
      "Nome privado",
    ),
    false,
  );
});
