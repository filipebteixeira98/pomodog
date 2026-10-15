import assert from "node:assert/strict";
import test from "node:test";

import {
  createProgressShareAction,
  progressPng,
} from "#src/features/sharing/imageExport.ts";
import {
  expiredProgressImages,
  sharedProgress,
} from "#src/features/sharing/progressShare.ts";
import type { Session } from "#src/timer.ts";

const png =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=";
const later = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
};

test("shared progress uses completed focus, includes streak beyond seven days and exposes only aggregates", () => {
  const now = new Date(2026, 9, 14, 18).getTime();
  const sessions: Session[] = Array.from({ length: 10 }, (_, index) => ({
    id: `private-session-${index}`,
    endedAt: new Date(2026, 9, 14 - index, 12).getTime(),
    seconds: 1500,
  }));
  sessions.push({ id: "pending", endedAt: now + 1000, seconds: 1500 });
  const snapshot = sharedProgress(sessions, now);
  assert.deepEqual(snapshot, {
    streakDays: 10,
    weekMinutes: 175,
    weekSessions: 7,
  });
  sessions[0].seconds = 3600;
  assert.equal(snapshot.weekMinutes, 175);
  assert.deepEqual(Object.keys(snapshot), [
    "streakDays",
    "weekMinutes",
    "weekSessions",
  ]);
  assert.deepEqual(sharedProgress([], now), {
    streakDays: 0,
    weekMinutes: 0,
    weekSessions: 0,
  });
});

test("SVG export accepts native/web PNG receipts and rejects malformed or non-PNG images", async () => {
  for (const image of [png, `data:image/png;base64,${png}`]) {
    assert.equal(
      await progressPng(
        { toDataURL: (callback) => callback(image) },
        new AbortController().signal,
      ),
      png,
    );
  }
  for (const image of [
    "",
    "data:image/jpeg;base64,test",
    "iVBORw0KGgo!",
    "iVBORw0KGgo" + "a".repeat(5_000_000),
  ]) {
    await assert.rejects(
      progressPng(
        { toDataURL: (callback) => callback(image) },
        new AbortController().signal,
      ),
      /invalid/,
    );
  }
});

test("SVG export timeout and unmount cancellation settle even if native callback never arrives", async () => {
  await assert.rejects(
    progressPng({ toDataURL: () => {} }, new AbortController().signal, 5),
    /timeout/,
  );
  const request = new AbortController();
  let callback!: (value: string) => void;
  const result = progressPng(
    {
      toDataURL: (done) => {
        callback = done;
      },
    },
    request.signal,
  );
  request.abort();
  await assert.rejects(result, /cancelled/);
  callback(png);
  await assert.rejects(
    progressPng(
      {
        toDataURL: () => {
          throw new Error("native failure");
        },
      },
      new AbortController().signal,
    ),
    /unavailable/,
  );
});

test("sharing blocks duplicate actions while rendering or handing off the image", async () => {
  const capture = later<string>();
  const delivery = later<void>();
  let sent = 0;
  const action = createProgressShareAction({
    capture: () => capture.promise,
    deliver: async (image) => {
      assert.equal(image, png);
      sent++;
      await delivery.promise;
    },
  });
  const first = action.run();
  assert.equal(action.busy(), true);
  assert.equal(await action.run(), false);
  capture.resolve(png);
  await Promise.resolve();
  assert.equal(sent, 1);
  assert.equal(await action.run(), false);
  delivery.resolve();
  assert.equal(await first, true);
  assert.equal(action.busy(), false);
});

test("cancelled or failed captures cannot publish a stale image and release the action for retry", async () => {
  const capture = later<string>();
  let sent = 0;
  const action = createProgressShareAction({
    capture: () => capture.promise,
    deliver: async () => {
      sent++;
    },
  });
  const pending = action.run();
  action.cancel();
  capture.resolve(png);
  assert.equal(await pending, false);
  assert.equal(sent, 0);
  assert.equal(action.busy(), false);
  let attempts = 0;
  const retry = createProgressShareAction({
    capture: async () => {
      if (attempts++ === 0) throw new Error("render failed");
      return png;
    },
    deliver: async () => {
      sent++;
    },
  });
  await assert.rejects(retry.run(), /render failed/);
  assert.equal(retry.busy(), false);
  assert.equal(await retry.run(), true);
  assert.equal(sent, 1);
});

test("cache pruning bounds handoffs and age without deleting foreign names or paths", () => {
  const now = 2_000_000_000_000;
  const recent = Array.from(
    { length: 10 },
    (_, index) => `pomodog-${now - index * 1000}-abcdef01.png`,
  );
  const old = `pomodog-${now - 25 * 60 * 60 * 1000}-1234abcd.png`;
  const unrelated = [
    "profile.png",
    "../pomodog-1-abcdef01.png",
    "pomodog-1-not-ours.png",
  ];
  assert.deepEqual(expiredProgressImages([...recent, old, ...unrelated], now), [
    ...recent.slice(8),
    old,
  ]);
});
