import type { User } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
} from "firebase/firestore";

import {
  parseSavedPrototype,
  type SavedPrototype,
} from "#src/domain/savedPrototype";
import { accountDeletionBlocked } from "#src/firebase/accountDeletionState";
import { db } from "#src/firebase/client";
import { mergeAccountData } from "#src/firebase/merge";
import {
  accountStore,
  erasePrototype,
  loadPrototype,
} from "#src/storage/prototype";

const knownSessions = new Map<string, Set<string>>();
const queues = new Map<string, Promise<unknown>>();

function assertWritable(uid: string) {
  if (accountDeletionBlocked(uid)) throw new Error("account-deletion-pending");
}

export class AccountSaveError extends Error {
  constructor(
    readonly stage: "local" | "cloud",
    cause: unknown,
  ) {
    super("Could not save account data", { cause });
  }
}

function userRef(uid: string) {
  return doc(db, "users", uid);
}

function sessionRef(uid: string, id: string) {
  return doc(db, "users", uid, "sessions", encodeURIComponent(id));
}

async function readRemote(uid: string) {
  const [profile, state, sessions] = await Promise.all([
    getDoc(userRef(uid)),
    getDoc(doc(db, "users", uid, "state", "main")),
    getDocs(collection(db, "users", uid, "sessions")),
  ]);
  const remoteSessions = sessions.docs.map((item) => ({
    id: decodeURIComponent(item.id),
    endedAt: item.data().endedAt,
    seconds: item.data().seconds,
  }));
  const remote = state.exists()
    ? parseSavedPrototype({
        ...state.data(),
        timer: { ...state.data().timer, sessions: remoteSessions },
      })
    : null;
  if (state.exists() && !remote)
    throw new Error("Account data cannot be read safely");
  return {
    remote,
    createdAt: profile.exists() ? profile.data().createdAt : Date.now(),
    sessionIds: new Set(
      sessions.docs.map((item) => decodeURIComponent(item.id)),
    ),
  };
}

async function writeSnapshot(user: User, saved: SavedPrototype) {
  const uid = user.uid;
  assertWritable(uid);
  const known = knownSessions.get(uid) ?? new Set<string>();
  const missing = saved.timer.sessions.filter((item) => !known.has(item.id));
  for (let index = 0; index < missing.length; index += 450) {
    const chunk = missing.slice(index, index + 450);
    assertWritable(uid);
    const batch = writeBatch(db);
    for (const session of chunk) {
      batch.set(sessionRef(uid, session.id), {
        endedAt: Math.trunc(session.endedAt),
        seconds: Math.trunc(session.seconds),
      });
    }
    await batch.commit();
    for (const session of chunk) known.add(session.id);
  }
  knownSessions.set(uid, known);
  assertWritable(uid);
  await setDoc(doc(db, "users", uid, "state", "main"), {
    timer: { ...saved.timer, sessions: [] },
    preferences: saved.preferences,
    onboardingComplete: saved.onboardingComplete,
    ...(saved.petCare ? { petCare: saved.petCare } : {}),
    updatedAt: Date.now(),
  });
}

export async function prepareAccount(user: User) {
  assertWritable(user.uid);
  const store = accountStore(user.uid);
  const [account, guest, cloud] = await Promise.all([
    store.load(),
    loadPrototype(),
    readRemote(user.uid),
  ]);
  const merged = mergeAccountData(account, cloud.remote, guest);
  assertWritable(user.uid);
  knownSessions.set(user.uid, cloud.sessionIds);
  await setDoc(userRef(user.uid), {
    displayName: (user.displayName ?? "").slice(0, 120),
    email: user.email,
    createdAt: cloud.createdAt,
    updatedAt: Date.now(),
  });
  await writeSnapshot(user, merged);
  assertWritable(user.uid);
  await store.save(merged);
  if (guest) await erasePrototype();
  return store;
}

export function saveAccount(
  user: User,
  store: ReturnType<typeof accountStore>,
  saved: SavedPrototype,
) {
  if (accountDeletionBlocked(user.uid))
    return Promise.reject(new Error("account-deletion-pending"));
  const localSave = store.save(saved).catch((error: unknown) => {
    throw new AccountSaveError("local", error);
  });
  const previous = queues.get(user.uid) ?? Promise.resolve();
  const work = Promise.all([previous, localSave]).then(async () => {
    try {
      await writeSnapshot(user, saved);
    } catch (error) {
      throw new AccountSaveError("cloud", error);
    }
  });
  queues.set(
    user.uid,
    work.catch(() => {}),
  );
  return work;
}

export async function flushAccount(uid: string) {
  await queues.get(uid);
}
