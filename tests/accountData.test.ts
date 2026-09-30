import assert from "node:assert/strict";
import test from "node:test";

import { defaultPreferences } from "#src/domain/preferences.ts";
import { mergeAccountData } from "#src/firebase/merge.ts";
import { initialTimer } from "#src/timer.ts";

function saved(ids: string[], focus: number) {
  return {
    timer: {
      ...initialTimer,
      sessions: ids.map((id, index) => ({
        id,
        endedAt: 1000 + index,
        seconds: 900,
      })),
    },
    preferences: { ...defaultPreferences, focus },
    onboardingComplete: true,
  };
}

test("account import keeps remote focus history and adds guest sessions once", () => {
  const result = mergeAccountData(
    null,
    saved(["old", "shared"], 50),
    saved(["shared", "new"], 15),
  );
  assert.deepEqual(
    result.timer.sessions.map((session) => session.id),
    ["old", "shared", "new"],
  );
  assert.equal(result.preferences.focus, 50);
});

test("account device settings take precedence over remote and guest settings", () => {
  const result = mergeAccountData(
    saved(["account"], 25),
    saved(["remote"], 50),
    saved(["guest"], 15),
  );
  assert.equal(result.preferences.focus, 25);
  assert.equal(result.timer.sessions.length, 3);
});
