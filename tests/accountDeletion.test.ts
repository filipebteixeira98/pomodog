import assert from "node:assert/strict";
import test from "node:test";

import {
  createAccountDeletion,
  eraseOwnedDocuments,
  type AccountDeletionAdapter,
} from "#src/firebase/accountDeletion.ts";

function fixture() {
  let uid: string | null = "alice";
  const calls: string[] = [];
  const step = (name: string) => async (owner?: string) => {
    calls.push(name);
    if (owner) assert.equal(owner, "alice");
  };
  const adapter: AccountDeletionAdapter = {
    currentUid: () => uid,
    reauthenticate: async () => {
      calls.push("reauth");
      return true;
    },
    begin: step("begin"),
    drain: step("drain"),
    cancelNotifications: step("notifications"),
    eraseRemote: step("remote"),
    eraseLocal: step("local"),
    eraseIdentity: step("identity"),
    finish: step("finish"),
  };
  return {
    adapter,
    calls,
    change: (value: string | null) => {
      uid = value;
    },
  };
}

test("deletion removes data before identity and uses authenticated owner", async () => {
  const f = fixture();
  assert.equal(await createAccountDeletion(f.adapter)(), true);
  assert.deepEqual(f.calls, [
    "reauth",
    "begin",
    "drain",
    "notifications",
    "remote",
    "local",
    "identity",
    "finish",
  ]);
});
test("guest and cancelled confirmation cannot delete data", async () => {
  const f = fixture();
  f.change(null);
  await assert.rejects(createAccountDeletion(f.adapter)(), /unauthenticated/);
  assert.deepEqual(f.calls, []);
  f.change("alice");
  f.adapter.reauthenticate = async () => false;
  assert.equal(await createAccountDeletion(f.adapter)(), false);
  assert.deepEqual(f.calls, []);
});
test("identity change during reauthentication prevents any deletion", async () => {
  const f = fixture();
  f.adapter.reauthenticate = async () => {
    f.change("bob");
    return true;
  };
  await assert.rejects(createAccountDeletion(f.adapter)(), /owner-changed/);
  assert.deepEqual(f.calls, []);
});
test("partial failure preserves identity and allows retry", async () => {
  const f = fixture();
  const remote = f.adapter.eraseRemote;
  f.adapter.eraseRemote = async () => {
    throw new Error("offline");
  };
  const remove = createAccountDeletion(f.adapter);
  await assert.rejects(remove(), /offline/);
  assert.ok(!f.calls.includes("identity"));
  assert.ok(!f.calls.includes("finish"));
  f.adapter.eraseRemote = remote;
  assert.equal(await remove(), true);
});
test("concurrent account deletion is rejected", async () => {
  const f = fixture();
  let release!: (value: boolean) => void;
  f.adapter.reauthenticate = () =>
    new Promise((resolve) => {
      release = resolve;
    });
  const remove = createAccountDeletion(f.adapter);
  const pending = remove();
  await assert.rejects(remove(), /busy/);
  release(false);
  await pending;
});
test("paginated deletion clears all owner sessions before parent and preserves other owners", async () => {
  const sessions = Array.from({ length: 451 }, (_, i) => String(i));
  const consents = Array.from({ length: 251 }, (_, i) => String(i));
  const bob = ["private"];
  const pages: number[] = [];
  let parentDeleted = false;
  await eraseOwnedDocuments("alice", {
    currentUid: () => "alice",
    listDocuments: async (uid, name, size) => {
      assert.equal(uid, "alice");
      return (name === "sessions" ? sessions : consents).slice(0, size);
    },
    deleteDocuments: async (uid, name, ids) => {
      assert.equal(uid, "alice");
      pages.push(ids.length);
      (name === "sessions" ? sessions : consents).splice(0, ids.length);
    },
    deleteStateAndProfile: async () => {
      assert.equal(sessions.length, 0);
      assert.equal(consents.length, 0);
      parentDeleted = true;
    },
  });
  assert.deepEqual(pages, [200, 200, 51, 200, 51]);
  assert.equal(parentDeleted, true);
  assert.deepEqual(bob, ["private"]);
});
test("identity switch after fetching page prevents deletion", async () => {
  let uid = "alice";
  await assert.rejects(
    eraseOwnedDocuments("alice", {
      currentUid: () => uid,
      listDocuments: async () => {
        uid = "bob";
        return ["session"];
      },
      deleteDocuments: async () => {
        assert.fail("must not delete");
      },
      deleteStateAndProfile: async () => {
        assert.fail("must not delete");
      },
    }),
    /owner-changed/,
  );
});
