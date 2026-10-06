import assert from "node:assert/strict";
import test from "node:test";

import {
  createConsentJournal,
  createConsentSync,
  createRecordedConsent,
} from "#src/privacy/consentJournal.ts";

function fixture() {
  let saved: string | null = null;
  let sequence = 0;
  const adapter = {
    read: async () => saved,
    write: async (value: string) => {
      saved = value;
    },
    id: () => String(++sequence).padStart(20, "0"),
    now: () => 1234,
  };
  const journal = createConsentJournal(adapter, "2026-10-05");
  return {
    journal,
    adapter,
    saved: () => saved,
    corrupt: (value: string) => {
      saved = value;
    },
  };
}
const settle = () => new Promise<void>((resolve) => setImmediate(resolve));

test("no receipt and outdated notice cannot restore an optional grant", async () => {
  const f = fixture();
  assert.equal(await f.journal.granted("usage"), false);
  await f.journal.record("usage", true, "settings", null);
  assert.equal(await f.journal.granted("usage"), true);
  assert.equal(
    await createConsentJournal(f.adapter, "next-notice").granted("usage"),
    false,
  );
  assert.equal(await f.journal.granted("diagnostics"), false);
});
test("device choices include decision time, purpose, notice and source without uploading guest history", async () => {
  const f = fixture();
  await f.journal.record("usage", true, "onboarding", null);
  await f.journal.record("diagnostics", false, "onboarding", "alice");
  const saved = JSON.parse(f.saved()!);
  assert.equal(saved.latest.usage.decidedAt, 1234);
  assert.equal(saved.latest.usage.noticeVersion, "2026-10-05");
  assert.equal(saved.latest.usage.source, "onboarding");
  assert.equal(saved.pending.length, 1);
  assert.equal(saved.pending[0].owner, "alice");
  assert.equal(saved.pending[0].purpose, "diagnostics");
});
test("concurrent purposes do not overwrite each other and deleting an owner preserves other owners", async () => {
  const f = fixture();
  await Promise.all([
    f.journal.record("usage", true, "settings", "alice"),
    f.journal.record("diagnostics", false, "settings", "bob"),
  ]);
  assert.equal(await f.journal.granted("usage"), true);
  await f.journal.forgetOwner("alice");
  assert.equal(await f.journal.granted("usage"), false);
  assert.equal((await f.journal.pending()).length, 1);
  assert.equal((await f.journal.pending())[0].owner, "bob");
});
test("malformed storage cannot authorize collection or silently replace consent evidence", async () => {
  for (const payload of [
    "enabled",
    "{}",
    '{"latest":[],"pending":[]}',
    '{"latest":{"usage":{"allowed":true}},"pending":[]}',
  ]) {
    const f = fixture();
    f.corrupt(payload);
    await assert.rejects(f.journal.granted("usage"));
    await assert.rejects(f.journal.record("usage", true, "settings", null));
  }
});
test("an optional grant waits for durable evidence and a later refusal defeats a pending grant", async () => {
  const calls: boolean[] = [];
  let release!: () => void;
  const set = createRecordedConsent("usage", {
    set: async (value) => {
      calls.push(value);
    },
    record: async (_purpose, allowed) => {
      if (allowed)
        await new Promise<void>((done) => {
          release = done;
        });
    },
    currentOwner: () => null,
    blocked: () => false,
    sync: () => {},
  });
  const grant = set(true);
  await settle();
  assert.deepEqual(calls, [false]);
  await set(false);
  release();
  await grant;
  assert.equal(calls.includes(true), false);
});
test("journal persistence failures leave collection disabled; failed activation records a rollback", async () => {
  const f = fixture();
  let enabled = true;
  let failStorage = true;
  const set = createRecordedConsent("diagnostics", {
    set: async (value) => {
      if (value) throw Error("native failure");
      enabled = value;
    },
    record: async (...args) => {
      if (failStorage) throw Error("disk full");
      await f.journal.record(...args);
    },
    currentOwner: () => null,
    blocked: () => false,
    sync: () => {},
  });
  await assert.rejects(set(false), /disk full/);
  assert.equal(enabled, false);
  failStorage = false;
  await assert.rejects(set(true), /native failure/);
  assert.equal(await f.journal.granted("diagnostics"), false);
  assert.equal(JSON.parse(f.saved()!).latest.diagnostics.source, "rollback");
  const calls: boolean[] = [];
  const emptyRejection = createRecordedConsent("diagnostics", {
    set: (value) => {
      calls.push(value);
      return Promise.reject();
    },
    record: f.journal.record,
    currentOwner: () => null,
    blocked: () => false,
    sync: () => {},
  });
  await assert.rejects(emptyRejection(true));
  assert.equal(calls.includes(true), false);
  assert.equal(await f.journal.granted("diagnostics"), false);
});
test("erasure decisions are not rebound to an account and grants are rejected during account deletion", async () => {
  const f = fixture();
  const set = createRecordedConsent("usage", {
    set: async () => {},
    record: f.journal.record,
    currentOwner: () => "alice",
    blocked: () => true,
    sync: () => {},
  });
  await assert.rejects(set(true), /deletion-pending/);
  const beforeErasure = f.saved();
  await set(false, "erasure");
  assert.equal(f.saved(), beforeErasure);
  assert.equal(await f.journal.granted("usage"), false);
});
test("explicit device erasure clears unreadable receipts without recreating a decision", async () => {
  const f = fixture();
  f.corrupt("unreadable data");
  await f.journal.clear();
  assert.equal(await f.journal.granted("usage"), false);
  assert.deepEqual(await f.journal.pending(), []);
});
test("sync retries unacknowledged evidence without uploading another owner's or guest's choices", async () => {
  const f = fixture();
  await f.journal.record("usage", true, "settings", "alice");
  await f.journal.record("usage", false, "settings", "bob");
  await f.journal.record("diagnostics", true, "settings", null);
  let online = false;
  const sent: string[] = [];
  const sync = createConsentSync({
    pending: f.journal.pending,
    acknowledge: f.journal.acknowledge,
    currentOwner: () => "alice",
    blocked: () => false,
    send: async (receipt) => {
      if (!online) throw Error("offline");
      sent.push(receipt.id);
    },
  });
  await assert.rejects(sync.flush("alice"), /offline/);
  assert.equal((await f.journal.pending()).length, 2);
  online = true;
  await sync.flush("alice");
  await sync.flush("alice");
  assert.equal(sent.length, 1);
  assert.equal((await f.journal.pending())[0].owner, "bob");
});
test("owner changes and deletion block pending writes; drain waits for an in-flight receipt", async () => {
  const f = fixture();
  await f.journal.record("usage", true, "settings", "alice");
  await f.journal.record("diagnostics", true, "settings", "alice");
  let owner = "bob";
  let blocked = false;
  let release!: () => void;
  let calls = 0;
  const sync = createConsentSync({
    pending: f.journal.pending,
    acknowledge: f.journal.acknowledge,
    currentOwner: () => owner,
    blocked: () => blocked,
    send: async () => {
      calls++;
      await new Promise<void>((done) => {
        release = done;
      });
    },
  });
  await sync.flush("alice");
  assert.equal(calls, 0);
  owner = "alice";
  const pending = sync.flush("alice");
  await settle();
  blocked = true;
  let drained = false;
  const drain = sync.drain().then(() => {
    drained = true;
  });
  await settle();
  assert.equal(drained, false);
  release();
  await Promise.all([pending, drain]);
  assert.equal(calls, 1);
  assert.equal((await f.journal.pending()).length, 1);
});
