import assert from "node:assert/strict";
import test from "node:test";

import {
  summarizeDay,
  summarizeProgress,
  summarizeWeek,
} from "#src/domain/progress.ts";

test("daily progress follows local calendar dates across a month boundary", () => {
  const now = new Date(2026, 9, 1, 12).getTime();
  const sessions = [
    {
      id: "last-month",
      endedAt: new Date(2026, 8, 30, 23, 59).getTime(),
      seconds: 1500,
    },
    {
      id: "today",
      endedAt: new Date(2026, 9, 1, 0, 1).getTime(),
      seconds: 900,
    },
  ];
  assert.deepEqual(summarizeDay(sessions, now), { count: 1, minutes: 15 });
  const week = summarizeWeek(sessions, now);
  assert.equal(week.length, 7);
  assert.equal(week[5].minutes, 25);
  assert.equal(week[6].minutes, 15);
});

test("weekly dashboard uses local dates, excludes future and older sessions", () => {
  const now = new Date(2026, 0, 3, 12).getTime();
  const session = (id: string, endedAt: number, seconds: number) => ({
    id,
    endedAt,
    seconds,
  });
  const result = summarizeProgress(
    [
      session("boundary", new Date(2025, 11, 28, 0).getTime(), 900),
      session("older", new Date(2025, 11, 27, 23, 59).getTime(), 3000),
      session("today-one", new Date(2026, 0, 3, 9).getTime(), 1500),
      session("today-two", now, 3000),
      session("future-today", now + 1000, 3000),
    ],
    now,
  );
  assert.equal(result.minutes, 90);
  assert.equal(result.count, 3);
  assert.equal(result.activeDays, 2);
  assert.equal(result.averageMinutes, 30);
  assert.equal(result.days[0].minutes, 15);
  assert.equal(result.days[6].minutes, 75);
});

test("weekly dashboard handles an empty history without a misleading average", () => {
  const result = summarizeProgress([], new Date(2026, 8, 27, 12).getTime());
  assert.equal(result.minutes, 0);
  assert.equal(result.count, 0);
  assert.equal(result.activeDays, 0);
  assert.equal(result.averageMinutes, 0);
  assert.equal(result.days.length, 7);
});

test("weekly totals round summed seconds rather than daily rounded minutes", () => {
  const now = new Date(2026, 8, 27, 12).getTime();
  const result = summarizeProgress(
    [
      { id: "a", endedAt: now, seconds: 89 },
      { id: "b", endedAt: new Date(2026, 8, 26, 12).getTime(), seconds: 89 },
    ],
    now,
  );
  assert.equal(result.minutes, 3);
  assert.equal(result.averageMinutes, 1);
});
