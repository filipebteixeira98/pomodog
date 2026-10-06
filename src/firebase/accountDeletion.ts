export type AccountDeletionAdapter = {
  currentUid: () => string | null;
  reauthenticate: () => Promise<boolean>;
  begin: (uid: string) => Promise<void>;
  drain: (uid: string) => Promise<void>;
  cancelNotifications: () => Promise<void>;
  eraseRemote: (uid: string) => Promise<void>;
  eraseLocal: (uid: string) => Promise<void>;
  eraseIdentity: () => Promise<void>;
  finish: (uid: string) => Promise<void>;
};

/** Capture the authenticated owner; never accept an arbitrary target UID. */
export function createAccountDeletion(adapter: AccountDeletionAdapter) {
  let running = false;
  return async function remove() {
    if (running) throw new Error("account-deletion-busy");
    const uid = adapter.currentUid();
    if (!uid) throw new Error("account-deletion-unauthenticated");
    const assertOwner = () => {
      if (adapter.currentUid() !== uid)
        throw new Error("account-deletion-owner-changed");
    };
    running = true;
    try {
      if (!(await adapter.reauthenticate())) return false;
      assertOwner();
      await adapter.begin(uid);
      await adapter.drain(uid);
      assertOwner();
      await adapter.cancelNotifications();
      assertOwner();
      await adapter.eraseRemote(uid);
      assertOwner();
      await adapter.eraseLocal(uid);
      assertOwner();
      await adapter.eraseIdentity();
      await adapter.finish(uid);
      return true;
    } finally {
      running = false;
    }
  };
}

export type OwnedCollection = "sessions" | "consents";
export type OwnedDeletionAdapter = {
  currentUid: () => string | null;
  listDocuments: (
    uid: string,
    collection: OwnedCollection,
    limit: number,
  ) => Promise<string[]>;
  deleteDocuments: (
    uid: string,
    collection: OwnedCollection,
    ids: string[],
  ) => Promise<void>;
  deleteStateAndProfile: (uid: string) => Promise<void>;
};

/** Read bounded pages from the server; deleting a parent does not delete children. */
export async function eraseOwnedDocuments(
  uid: string,
  adapter: OwnedDeletionAdapter,
) {
  const assertOwner = () => {
    if (!uid || adapter.currentUid() !== uid)
      throw new Error("account-deletion-owner-changed");
  };
  for (const collection of ["sessions", "consents"] as const) {
    while (true) {
      assertOwner();
      const ids = await adapter.listDocuments(uid, collection, 200);
      assertOwner();
      if (!ids.length) break;
      if (ids.length > 200) throw new Error("account-deletion-invalid-page");
      await adapter.deleteDocuments(uid, collection, ids);
    }
  }
  assertOwner();
  await adapter.deleteStateAndProfile(uid);
}
