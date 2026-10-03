import assert from "node:assert/strict";
import test from "node:test";

import { createSecureAuthStore } from "#src/storage/secureAuthStore.ts";

function memory() {
  const values = new Map<string, string>();
  return {
    values,
    getItem: async (key: string) => values.get(key) ?? null,
    setItem: async (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: async (key: string) => {
      values.delete(key);
    },
  };
}

test("auth migration encrypts the requested Firebase record and preserves unrelated data", async () => {
  const secure = memory();
  const legacy = memory();
  const key = "firebase:authUser:public-key:[DEFAULT]";
  legacy.values.set(key, "serialized-session");
  legacy.values.set("pomodog.prototype.v1", "history");
  const store = createSecureAuthStore(secure, legacy);
  assert.equal(await store.getItem(key), "serialized-session");
  assert.equal(legacy.values.has(key), false);
  assert.equal(legacy.values.get("pomodog.prototype.v1"), "history");
  assert.equal(secure.values.size, 1);
  assert.match([...secure.values.keys()][0], /^[\w.-]+$/);
  assert.equal(
    await createSecureAuthStore(secure, legacy).getItem(key),
    "serialized-session",
  );
});

test("a failed secure migration preserves the original but never returns plaintext", async () => {
  const secure = memory();
  const legacy = memory();
  legacy.values.set("firebase:key", "serialized-session");
  const store = createSecureAuthStore(
    {
      ...secure,
      setItem: async () => {
        throw new Error("secure storage unavailable");
      },
    },
    legacy,
  );
  await assert.rejects(
    store.getItem("firebase:key"),
    /secure storage unavailable/,
  );
  assert.equal(legacy.values.get("firebase:key"), "serialized-session");
  assert.equal(secure.values.size, 0);
});

test("secure read failure cannot fall back to a legacy token", async () => {
  const legacy = memory();
  legacy.values.set("firebase:key", "serialized-session");
  const store = createSecureAuthStore(
    {
      ...memory(),
      getItem: async () => {
        throw new Error("locked");
      },
    },
    legacy,
  );
  await assert.rejects(store.getItem("firebase:key"), /locked/);
});

test("logout waits for an in-flight migration and cannot resurrect the session", async () => {
  const secure = memory();
  const legacy = memory();
  legacy.values.set("firebase:key", "serialized-session");
  let release!: () => void;
  let started!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const writing = new Promise<void>((resolve) => {
    started = resolve;
  });
  const store = createSecureAuthStore(
    {
      ...secure,
      setItem: async (key, value) => {
        started();
        await gate;
        await secure.setItem(key, value);
      },
    },
    legacy,
  );
  const migrating = store.getItem("firebase:key");
  const logout = store.removeItem("firebase:key");
  await writing;
  release();
  await Promise.all([migrating, logout]);
  assert.equal(await store.getItem("firebase:key"), null);
  assert.equal(secure.values.size, 0);
  assert.equal(legacy.values.size, 0);
});

test("new sessions never write plaintext and encrypted data replaces stale legacy records", async () => {
  const secure = memory();
  const legacy = memory();
  const store = createSecureAuthStore(secure, legacy);
  for (const key of ["a:b", "a_b", "__sak"]) await store.setItem(key, key);
  assert.equal(secure.values.size, 3);
  assert.equal(legacy.values.size, 0);
  legacy.values.set("a:b", "stale");
  assert.equal(await store.getItem("a:b"), "a:b");
  assert.equal(legacy.values.size, 0);
});
