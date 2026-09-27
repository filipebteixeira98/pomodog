import assert from "node:assert/strict";
import test from "node:test";

import { choosePetResponse, parsePetCare } from "#src/domain/petCare.ts";
import { defaultPreferences } from "#src/domain/preferences.ts";
import { parseSavedPrototype } from "#src/domain/savedPrototype.ts";
import { initialTimer } from "#src/timer.ts";

test("feeding alternates encouragement without changing the timer", () => {
  const timer = {
    ...initialTimer,
    status: "running" as const,
    deadline: 200000,
  };
  const before = structuredClone(timer);
  const first = choosePetResponse(timer, undefined, 1000);
  const second = choosePetResponse(timer, first.care, 2000);
  assert.notEqual(first.message, second.message);
  assert.equal(first.care.lastMessageId, "running:0");
  assert.deepEqual(timer, before);
});

test("feeding responds to rest, completion, streaks and returning users", () => {
  const now = new Date(2026, 8, 27, 12).getTime();
  const response = (timer: typeof initialTimer) =>
    choosePetResponse(timer, undefined, now).care.lastMessageId;
  assert.equal(response(initialTimer), "start:0");
  assert.equal(
    response({ ...initialTimer, mode: "break", status: "running" }),
    "rest:0",
  );
  assert.equal(
    response({ ...initialTimer, status: "completed", remaining: 0 }),
    "completed:0",
  );
  assert.equal(
    response({
      ...initialTimer,
      sessions: [{ id: "today", endedAt: now, seconds: 900 }],
    }),
    "streak:0",
  );
  assert.equal(
    response({
      ...initialTimer,
      sessions: [{ id: "past", endedAt: 1000, seconds: 900 }],
    }),
    "welcome:0",
  );
});

test("care persists with existing history, and invalid optional care is discarded", () => {
  const saved = {
    timer: initialTimer,
    preferences: defaultPreferences,
    onboardingComplete: true,
  };
  const care = choosePetResponse(initialTimer, undefined, 1000).care;
  assert.deepEqual(
    parseSavedPrototype({ ...saved, petCare: care })?.petCare,
    care,
  );
  assert.deepEqual(
    parseSavedPrototype({
      ...saved,
      petCare: { lastFedAt: -1, lastMessageId: "start:0" },
    }),
    saved,
  );
  assert.equal(
    parsePetCare({ lastFedAt: 1, lastMessageId: "unknown" }),
    undefined,
  );
  assert.equal(
    parsePetCare({ lastFedAt: Infinity, lastMessageId: "start:0" }),
    undefined,
  );
});
