import assert from "node:assert/strict";

import { deleteApp, initializeApp } from "firebase/app";
import {
  connectFirestoreEmulator,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  setDoc,
} from "firebase/firestore";

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
    { timer: {}, preferences: {}, onboardingComplete: true, updatedAt: 1 },
  ];
  for (let i = 0; i < paths.length; i++) {
    const ref = (db: (typeof clients)[number]) => doc(db, paths[i].join("/"));
    await setDoc(ref(clients[0]), data[i]);
    for (const intruder of clients.slice(1)) {
      await assert.rejects(
        deleteDoc(ref(intruder)),
        (error: any) => error.code === "permission-denied",
      );
      await assert.rejects(
        getDoc(ref(intruder)),
        (error: any) => error.code === "permission-denied",
      );
    }
    await deleteDoc(ref(clients[0]));
    assert.equal((await getDoc(ref(clients[0]))).exists(), false);
  }
  console.log(
    "Firestore rules: owner deletion allowed; other accounts and guests denied.",
  );
} finally {
  await Promise.all(apps.map((app) => deleteApp(app)));
}
