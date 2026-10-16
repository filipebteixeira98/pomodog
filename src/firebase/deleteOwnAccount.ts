import { deleteUser } from "firebase/auth";
import {
  collection,
  doc,
  getDocsFromServer,
  limit,
  query,
  writeBatch,
} from "firebase/firestore";

import { setAnalyticsEnabled } from "#src/analytics/service";
import { calendar } from "#src/calendar/service";
import { clearProgressImages } from "#src/features/sharing/shareImage";
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
import {
  consentJournal,
  drainConsentReceipts,
} from "#src/privacy/consentService";
import { accountStore } from "#src/storage/prototype";

const currentUid = () => auth.currentUser?.uid ?? null;

export const deleteOwnAccount = createAccountDeletion({
  currentUid,
  reauthenticate: reauthenticateWithGoogle,
  begin: beginAccountDeletion,
  drain: async (uid) => {
    await drainConsentReceipts();
    await flushAccount(uid);
    await setReportingEnabled(false, "erasure");
    await setAnalyticsEnabled(false, "erasure");
  },
  cancelNotifications: async () => {
    await calendar.disconnect();
    await sessionNotifications.sync(
      { status: "idle", deadline: null, mode: "focus" },
      false,
    );
  },
  eraseRemote: (uid) =>
    eraseOwnedDocuments(uid, {
      currentUid,
      listDocuments: async (owner, name, pageSize) => {
        const page = await getDocsFromServer(
          query(collection(db, "users", owner, name), limit(pageSize)),
        );
        return page.docs.map((item) => item.id);
      },
      deleteDocuments: async (owner, name, ids) => {
        const batch = writeBatch(db);
        for (const id of ids) batch.delete(doc(db, "users", owner, name, id));
        await batch.commit();
      },
      deleteStateAndProfile: async (owner) => {
        const batch = writeBatch(db);
        batch.delete(doc(db, "users", owner, "state", "main"));
        batch.delete(doc(db, "users", owner));
        await batch.commit();
      },
    }),
  eraseLocal: async (uid) => {
    await consentJournal.forgetOwner(uid);
    await clearProgressImages();
    await accountStore(uid).erase();
  },
  eraseIdentity: async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("account-deletion-unauthenticated");
    await deleteUser(user);
  },
  finish: async (uid) => {
    // Identity is already gone. Cleanup must not report a failed account deletion.
    await setReportingEnabled(false, "erasure").catch(() => {});
    await setAnalyticsEnabled(false, "erasure").catch(() => {});
    await finishAccountDeletion(uid).catch(() => {});
    await signOutGoogle().catch(() => {});
  },
});
