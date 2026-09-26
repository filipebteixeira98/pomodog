import assert from "node:assert/strict";
import test from "node:test";

import { summarizeDay, summarizeWeek } from "#src/domain/progress.ts";

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
