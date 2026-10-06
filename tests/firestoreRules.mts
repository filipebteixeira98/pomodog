import assert from "node:assert/strict";

import { deleteApp, initializeApp } from "firebase/app";
import {
  connectFirestoreEmulator,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { defaultPreferences } from "#src/domain/preferences.ts";
import { initialTimer } from "#src/timer.ts";

const validState = {
  timer: initialTimer,
  preferences: defaultPreferences,
  onboardingComplete: true,
  updatedAt: 1,
};
let assertions = 0;
async function denied(operation: Promise<unknown>) {
  await assert.rejects(
    operation,
    (error: any) => error.code === "permission-denied",
  );
  assertions++;
}

const host = process.env.FIRESTORE_EMULATOR_HOST;
if (!host || !host.startsWith("127.0.0.1:"))
  throw new Error("Local Firestore emulator required");
const apps = ["alice", "bob", "guest"].map((name) =>
  initializeApp({ projectId: "demo-pomodog" }, name),
);
const clients = apps.map((app, i) => {
  const db = getFirestore(app);
  connectFirestoreEmulator(
    db,
    "127.0.0.1",
    Number(host.split(":")[1]),
    i < 2
      ? {
          mockUserToken: {
            sub: i === 0 ? "alice" : "bob",
            email: i === 0 ? "alice@example.com" : "bob@example.com",
          },
        }
      : {},
  );
  return db;
});
try {
  const paths = [
    ["users", "alice"],
    ["users", "alice", "sessions", "sample"],
    ["users", "alice", "state", "main"],
  ];
  const data = [
    {
      displayName: "Alice",
      email: "alice@example.com",
      createdAt: 1,
      updatedAt: 1,
    },
    { endedAt: 1, seconds: 900 },
    validState,
  ];
  for (let i = 0; i < paths.length; i++) {
    const ref = (db: (typeof clients)[number]) => doc(db, paths[i].join("/"));
    await setDoc(ref(clients[0]), data[i]);
    for (const intruder of clients.slice(1)) {
      await denied(deleteDoc(ref(intruder)));
      await denied(getDoc(ref(intruder)));
      await denied(setDoc(ref(intruder), data[i]));
    }
    await deleteDoc(ref(clients[0]));
    assert.equal((await getDoc(ref(clients[0]))).exists(), false);
    assertions++;
    for (const intruder of clients.slice(1))
      await denied(setDoc(ref(intruder), data[i]));
  }
  const state = doc(clients[0], "users/alice/state/main");
  for (const snapshot of [
    validState,
    { ...validState, petCare: { lastFedAt: 1, lastMessageId: "start:0" } },
    {
      ...validState,
      timer: {
        ...initialTimer,
        status: "running",
        remaining: 1499.75,
        deadline: 2000000.5,
      },
    },
    {
      ...validState,
      timer: { ...initialTimer, status: "paused", remaining: 1499.75 },
    },
    {
      ...validState,
      timer: { ...initialTimer, status: "completed", remaining: 0 },
    },
  ]) {
    await setDoc(state, snapshot);
    assertions++;
  }
  const invalid = [
    { ...validState, privateExtra: "unexpected" },
    { ...validState, timer: {} },
    { ...validState, timer: { ...initialTimer, privateExtra: "unexpected" } },
    {
      ...validState,
      timer: {
        ...initialTimer,
        sessions: [{ id: "duplicate", seconds: 1, endedAt: 1 }],
      },
    },
    {
      ...validState,
      timer: { ...initialTimer, duration: 7201, remaining: 7201 },
    },
    { ...validState, timer: { ...initialTimer, remaining: -1 } },
    { ...validState, timer: { ...initialTimer, status: "completed" } },
    { ...validState, timer: { ...initialTimer, status: "running" } },
    { ...validState, timer: { ...initialTimer, deadline: 1 } },
    { ...validState, preferences: { ...defaultPreferences, focus: 10 } },
    {
      ...validState,
      preferences: { ...defaultPreferences, sessionNotifications: "yes" },
    },
    { ...validState, preferences: { ...defaultPreferences, theme: 3 } },
    {
      ...validState,
      preferences: { ...defaultPreferences, privateExtra: "unexpected" },
    },
    { ...validState, onboardingComplete: "yes" },
    { ...validState, petCare: { lastFedAt: -1, lastMessageId: "start:0" } },
    {
      ...validState,
      petCare: { lastFedAt: 1, lastMessageId: "arbitrary text" },
    },
    { ...validState, updatedAt: -1 },
  ];
  for (const value of invalid) await denied(setDoc(state, value));
  await deleteDoc(state);
  for (const value of invalid) await denied(setDoc(state, value));
  await denied(setDoc(doc(clients[0], "users/alice/state/other"), validState));
  for (const value of [
    { endedAt: -1, seconds: 900 },
    { endedAt: 1e30, seconds: 900 },
    { endedAt: 1, seconds: 0 },
    { endedAt: 1, seconds: 7201 },
    { endedAt: 1, seconds: 900, privateExtra: "unexpected" },
  ])
    await denied(
      setDoc(doc(clients[0], "users/alice/sessions/invalid"), value),
    );
  await denied(
    setDoc(doc(clients[0], "users/alice"), {
      ...data[0],
      email: "bob@example.com",
    }),
  );
  const decision = {
    purpose: "usage",
    allowed: true,
    noticeVersion: "2026-10-05",
    decidedAt: 1234,
    source: "onboarding",
    receivedAt: serverTimestamp(),
  };
  const receiptPath = "users/alice/consents/12345678901234567890";
  const receipt = doc(clients[0], receiptPath);
  await setDoc(receipt, decision);
  const savedDecision = (await getDoc(receipt)).data()!;
  assert.equal(typeof savedDecision.receivedAt.toMillis(), "number");
  assertions++;
  await denied(setDoc(receipt, { ...decision, allowed: false }));
  await denied(setDoc(receipt, decision));
  for (const intruder of clients.slice(1)) {
    await denied(getDoc(doc(intruder, receiptPath)));
    await denied(setDoc(doc(intruder, receiptPath), decision));
    await denied(deleteDoc(doc(intruder, receiptPath)));
  }
  await deleteDoc(receipt);
  assertions++;
  for (const value of [
    { ...decision, purpose: "advertising" },
    { ...decision, allowed: "yes" },
    { ...decision, noticeVersion: "old" },
    { ...decision, decidedAt: -1 },
    { ...decision, source: "login" },
    { ...decision, receivedAt: savedDecision.receivedAt },
    { ...decision, privateText: "unexpected" },
    { ...decision, receivedAt: null },
  ])
    await denied(setDoc(receipt, value));
  await setDoc(receipt, { ...decision, allowed: false, source: "settings" });
  await deleteDoc(receipt);
  assertions++;
  console.log(
    `Firestore rules: ${assertions} checks passed (ownership, valid states and rejected malformed data).`,
  );
} finally {
  await Promise.all(apps.map((app) => deleteApp(app)));
}
