import assert from "node:assert/strict";
import test from "node:test";

import { serializeExport } from "#src/domain/exportData.ts";
import { defaultPreferences } from "#src/domain/preferences.ts";
import {
  createPrototypeStore,
  MAX_STORAGE_LENGTH,
  STORAGE_KEY,
} from "#src/storage/prototypeStore.ts";
import { initialTimer, parseTimer, timerReducer } from "#src/timer.ts";

const saved = {
  timer: initialTimer,
  preferences: defaultPreferences,
  onboardingComplete: true,
};
function memoryStorage(raw: string | null = null) {
  const values = new Map<string, string>([["unrelated-setting", "keep"]]);
  if (raw !== null) values.set(STORAGE_KEY, raw);
  return {
    values,
    adapter: {
      getItem: async (key: string) => values.get(key) ?? null,
      setItem: async (key: string, value: string) => {
        values.set(key, value);
      },
      removeItem: async (key: string) => {
        values.delete(key);
      },
    },
  };
}

test("unreadable data is preserved until explicit deletion, then saving can resume", async () => {
  const { values, adapter } = memoryStorage("{corrupted");
  const store = createPrototypeStore(adapter);
  await assert.rejects(store.load());
  await assert.rejects(store.save(saved));
  assert.equal(values.get(STORAGE_KEY), "{corrupted");
  await store.erase();
  assert.equal(values.has(STORAGE_KEY), false);
  assert.equal(values.get("unrelated-setting"), "keep");
  await store.save(saved);
  assert.deepEqual(await store.load(), saved);
});

test("oversized and future-version records cannot be replaced by automatic writes", async () => {
  for (const raw of [
    "x".repeat(MAX_STORAGE_LENGTH + 1),
    JSON.stringify({ ...saved, schemaVersion: 99 }),
  ]) {
    const { values, adapter } = memoryStorage(raw);
    const store = createPrototypeStore(adapter);
    await assert.rejects(store.load());
    await assert.rejects(store.save(saved));
    assert.equal(values.get(STORAGE_KEY), raw);
  }
});

test("deletion waits for an in-flight write so old data does not reappear", async () => {
  const { values, adapter } = memoryStorage();
  let release!: () => void;
  let announce!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const started = new Promise<void>((resolve) => {
    announce = resolve;
  });
  const store = createPrototypeStore({
    ...adapter,
    setItem: async (key, value) => {
      announce();
      await gate;
      values.set(key, value);
    },
  });
  const writing = store.save(saved);
  const deleting = store.erase();
  await started;
  release();
  await Promise.all([writing, deleting]);
  assert.equal(values.has(STORAGE_KEY), false);
});

test("export excludes unknown fields, invalid timestamps and duplicate sessions", () => {
  const session = {
    id: "one",
    endedAt: 1000,
    seconds: 1500,
    privateExtra: "discard",
  };
  const timer = {
    ...initialTimer,
    unknownSecret: "discard",
    sessions: [session, session, { id: "invalid", endedAt: 1e30, seconds: 10 }],
  };
  const result = JSON.parse(serializeExport({ ...saved, timer }, 1000));
  assert.equal(result.exportVersion, 1);
  assert.equal(result.data.timer.unknownSecret, undefined);
  assert.deepEqual(result.data.timer.sessions, [
    { id: "one", endedAt: 1000, seconds: 1500 },
  ]);
});

test("inconsistent completed timers and invalid configured durations are rejected", () => {
  assert.equal(
    parseTimer({ ...initialTimer, status: "completed", remaining: 100 }),
    null,
  );
  assert.equal(
    timerReducer(initialTimer, {
      type: "configure",
      mode: "focus",
      seconds: Infinity,
    }),
    initialTimer,
  );
});
