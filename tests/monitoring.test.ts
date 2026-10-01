import assert from "node:assert/strict";
import test from "node:test";

import { createReportingConsent } from "#src/monitoring/consent.ts";
import { sanitizeErrorEvent } from "#src/monitoring/privacy.ts";

function fixture(saved: string | null = null) {
  let stored = saved;
  let initialized = 0;
  const consent = createReportingConsent({
    read: async () => stored,
    write: async (value) => {
      stored = value;
    },
    initialize: () => {
      initialized++;
    },
  });
  return { consent, stored: () => stored, initialized: () => initialized };
}
test("diagnostic reporting defaults off and never initializes without consent", async () => {
  const f = fixture();
  await f.consent.restore();
  assert.equal(f.consent.enabled(), false);
  assert.equal(f.initialized(), 0);
  assert.equal(f.consent.ready(), true);
});
test("reporting consent persists, restores and revokes", async () => {
  const f = fixture();
  await f.consent.set(true);
  assert.equal(f.consent.enabled(), true);
  assert.equal(f.stored(), "enabled");
  const restored = fixture(f.stored());
  await restored.consent.restore();
  assert.equal(restored.consent.enabled(), true);
  const stopping = f.consent.set(false);
  assert.equal(f.consent.enabled(), false);
  await stopping;
  assert.equal(f.stored(), "disabled");
});
test("late opt-in cannot override a newer opt-out", async () => {
  const f = fixture();
  const enabling = f.consent.set(true);
  const disabling = f.consent.set(false);
  await Promise.all([enabling, disabling]);
  assert.equal(f.consent.enabled(), false);
  assert.equal(f.initialized(), 0);
  assert.equal(f.stored(), "disabled");
});
test("superseded activation never reaches a native consent writer", async () => {
  const values: string[] = [];
  const consent = createReportingConsent({
    read: async () => null,
    write: async (value) => {
      values.push(value);
    },
    initialize: () => assert.fail("cancelled activation must not initialize"),
  });
  await Promise.all([consent.set(true), consent.set(false)]);
  assert.deepEqual(values, ["disabled"]);
  assert.equal(consent.enabled(), false);
});
test("failed storage cannot enable reporting", async () => {
  const consent = createReportingConsent({
    read: async () => {
      throw Error("read failed");
    },
    write: async () => {
      throw Error("write failed");
    },
    initialize: () => assert.fail(),
  });
  await consent.restore();
  assert.equal(consent.enabled(), false);
  await assert.rejects(consent.set(true));
  assert.equal(consent.enabled(), false);
});
test("late restored opt-in cannot reverse immediate revocation", async () => {
  let resolve!: (value: string) => void;
  const consent = createReportingConsent({
    read: () =>
      new Promise((done) => {
        resolve = done;
      }),
    write: async () => {},
    initialize: () => assert.fail(),
  });
  const restoring = consent.restore();
  await consent.set(false);
  resolve("enabled");
  await restoring;
  assert.equal(consent.enabled(), false);
});
test("error sanitization removes identity, payloads, network, logs and original messages", () => {
  const clean = sanitizeErrorEvent({
    type: undefined,
    event_id: "a",
    user: { id: "uid", email: "private@example.com" },
    request: { url: "https://secret.invalid/?token=private" },
    extra: { timer: { sessions: [1] } },
    contexts: { auth: { token: "secret" } },
    breadcrumbs: [{ message: "private" }],
    tags: { uid: "uid", operation: "account.save" },
    exception: {
      values: [
        {
          type: "private",
          value: "private@example.com secret",
          stacktrace: {
            frames: [
              {
                filename: "/home/private/index.js?token=secret",
                lineno: 12,
                colno: 3,
                vars: { token: "secret" },
                context_line: "private",
                function: "save",
              },
            ],
          },
        },
      ],
    },
  });
  assert.ok(clean);
  assert.equal(
    clean.exception?.values?.[0].value,
    "Account persistence failed",
  );
  assert.deepEqual(clean.tags, { operation: "account.save" });
  assert.deepEqual(clean.user, { ip_address: "0.0.0.0" });
  const serialized = JSON.stringify(clean);
  assert.ok(!/private|secret|token|sessions|uid/.test(serialized));
  assert.equal(
    clean.exception?.values?.[0].stacktrace?.frames?.[0].filename,
    "index.js",
  );
});
test("unhandled messages and events without exceptions cannot leak arbitrary data", () => {
  const clean = sanitizeErrorEvent({
    type: undefined,
    exception: { values: [{ value: "sensitive arbitrary text" }] },
  });
  assert.equal(
    clean?.exception?.values?.[0].value,
    "Application error (message omitted for privacy)",
  );
  assert.equal(
    sanitizeErrorEvent({ type: undefined, message: "private" }),
    null,
  );
});

test("source-map identifiers survive sanitization without file paths", () => {
  const clean = sanitizeErrorEvent({
    type: undefined,
    debug_meta: {
      images: [
        {
          type: "sourcemap",
          debug_id: "00000000-0000-0000-0000-000000000000",
          code_file: "https://private.invalid/index.js?token=secret",
        },
      ],
    },
    exception: { values: [{ value: "secret" }] },
  });
  assert.equal(
    clean?.debug_meta?.images?.[0].debug_id,
    "00000000-0000-0000-0000-000000000000",
  );
  assert.equal(clean?.debug_meta?.images?.[0].code_file, "index.js");
});
