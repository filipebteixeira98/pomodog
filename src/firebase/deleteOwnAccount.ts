import { deleteUser } from "firebase/auth";
import {
  collection,
  doc,
  getDocsFromServer,
  limit,
  query,
  writeBatch,
} from "firebase/firestore";

import { flushAccount } from "#src/firebase/accountData";
import {
  createAccountDeletion,
  eraseOwnedDocuments,
} from "#src/firebase/accountDeletion";
import {
  beginAccountDeletion,
  finishAccountDeletion,
} from "#src/firebase/accountDeletionState";
import { auth } from "#src/firebase/auth";
import { db } from "#src/firebase/client";
import {
  reauthenticateWithGoogle,
  signOutGoogle,
} from "#src/firebase/googleSignIn";
import { setReportingEnabled } from "#src/monitoring/sentry";
import { sessionNotifications } from "#src/notifications/sessionNotifications";
import { accountStore } from "#src/storage/prototype";

const currentUid = () => auth.currentUser?.uid ?? null;

export const deleteOwnAccount = createAccountDeletion({
  currentUid,
  reauthenticate: reauthenticateWithGoogle,
  begin: beginAccountDeletion,
  drain: flushAccount,
  cancelNotifications: () =>
    sessionNotifications.sync(
      { status: "idle", deadline: null, mode: "focus" },
      false,
    ),
  eraseRemote: (uid) =>
    eraseOwnedDocuments(uid, {
      currentUid,
      listSessions: async (owner, pageSize) => {
        const page = await getDocsFromServer(
          query(collection(db, "users", owner, "sessions"), limit(pageSize)),
        );
        return page.docs.map((item) => item.id);
      },
      deleteSessions: async (owner, ids) => {
        const batch = writeBatch(db);
        for (const id of ids)
          batch.delete(doc(db, "users", owner, "sessions", id));
        await batch.commit();
      },
      deleteStateAndProfile: async (owner) => {
        const batch = writeBatch(db);
        batch.delete(doc(db, "users", owner, "state", "main"));
        batch.delete(doc(db, "users", owner));
        await batch.commit();
      },
    }),
  eraseLocal: (uid) => accountStore(uid).erase(),
  eraseIdentity: async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("account-deletion-unauthenticated");
    await deleteUser(user);
  },
  finish: async (uid) => {
    // Identity is already gone. Cleanup must not report a failed account deletion.
    await setReportingEnabled(false).catch(() => {});
    await finishAccountDeletion(uid).catch(() => {});
    await signOutGoogle().catch(() => {});
  },
});
