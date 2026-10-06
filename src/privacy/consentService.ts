import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import {
  accountDeletionBlocked,
  accountDeletionPending,
} from "#src/firebase/accountDeletionState";
import { auth } from "#src/firebase/auth";
import { db } from "#src/firebase/client";
import {
  createConsentJournal,
  createConsentSync,
  createRecordedConsent,
  type ConsentPurpose,
} from "#src/privacy/consentJournal";
import notice from "#src/privacy/notice.json";

const key = "pomodog.consent-receipts.v1";
const currentOwner = () => auth.currentUser?.uid ?? null;
export const consentJournal = createConsentJournal(
  {
    read: () => AsyncStorage.getItem(key),
    write: (value) => AsyncStorage.setItem(key, value),
    // Firestore generates this ID locally; no anonymous document is created.
    id: () => doc(collection(db, "consentIds")).id,
    now: Date.now,
  },
  notice.version,
);

const synchronization = createConsentSync({
  pending: consentJournal.pending,
  acknowledge: consentJournal.acknowledge,
  currentOwner,
  blocked: accountDeletionBlocked,
  async send(receipt) {
    const owner = receipt.owner;
    if (!owner || owner !== currentOwner() || accountDeletionBlocked(owner))
      throw new Error("consent-owner-changed");
    if (await accountDeletionPending(owner))
      throw new Error("account-deletion-pending");
    const reference = doc(db, "users", owner, "consents", receipt.id);
    await runTransaction(db, async (transaction) => {
      if (owner !== currentOwner() || accountDeletionBlocked(owner))
        throw new Error("consent-owner-changed");
      const existing = await transaction.get(reference);
      // An acknowledgement may fail after a successful commit. Do not rewrite evidence.
      if (existing.exists()) return;
      if (owner !== currentOwner() || accountDeletionBlocked(owner))
        throw new Error("consent-owner-changed");
      const { id, owner: receiptOwner, ...decision } = receipt;
      transaction.set(reference, {
        ...decision,
        receivedAt: serverTimestamp(),
      });
    });
  },
});
export const syncConsentReceipts = synchronization.flush;
export const drainConsentReceipts = synchronization.drain;

export function recordedConsent(
  purpose: ConsentPurpose,
  set: (value: boolean) => Promise<void>,
) {
  return createRecordedConsent(purpose, {
    set,
    record: consentJournal.record,
    currentOwner,
    blocked: accountDeletionBlocked,
    sync: (owner) => {
      void syncConsentReceipts(owner).catch(() => {});
    },
  });
}
