import assert from "node:assert/strict";
import test from "node:test";

import {
  defaultPreferences,
  parsePreferences,
} from "../src/domain/preferences.ts";
import { parseSavedPrototype } from "../src/domain/savedPrototype.ts";
import { initialTimer } from "../src/timer.ts";

test("legacy saves keep timer, history and preferences when onboarding is introduced", () => {
  const timer = {
    ...initialTimer,
    sessions: [{ id: "existing", endedAt: 1000, seconds: 1500 }],
  };
  const preferences = { ...defaultPreferences, theme: 2 };
  const restored = parseSavedPrototype({ timer, preferences });
  assert.deepEqual(restored, { timer, preferences, onboardingComplete: false });
});

test("completed onboarding survives serialization without discarding focus progress", () => {
  const saved = {
    timer: initialTimer,
    preferences: defaultPreferences,
    onboardingComplete: true,
  };
  assert.deepEqual(
    parseSavedPrototype(JSON.parse(JSON.stringify(saved))),
    saved,
  );
});

test("malformed storage cannot enable onboarding completion or unsafe theme indices", () => {
  assert.equal(parseSavedPrototype(null), null);
  assert.equal(parseSavedPrototype({ timer: {} }), null);
  assert.equal(parsePreferences({ ...defaultPreferences, theme: 99 }), null);
  assert.equal(parsePreferences({ ...defaultPreferences, theme: 0.5 }), null);
  assert.equal(parsePreferences({ ...defaultPreferences, focus: -10 }), null);
  const recovered = parseSavedPrototype({
    timer: initialTimer,
    preferences: {},
    onboardingComplete: "true",
  });
  assert.deepEqual(recovered?.preferences, defaultPreferences);
  assert.equal(recovered?.onboardingComplete, false);
});
