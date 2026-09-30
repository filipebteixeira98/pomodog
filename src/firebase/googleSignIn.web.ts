import {
  GoogleAuthProvider,
  reauthenticateWithPopup,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import { auth } from "#src/firebase/auth";

export async function signInWithGoogle() {
  await signInWithPopup(auth, new GoogleAuthProvider());
  return true;
}

export async function signOutGoogle() {
  await signOut(auth);
}

export async function reauthenticateWithGoogle() {
  const user = auth.currentUser;
  if (!user) throw new Error("account-deletion-unauthenticated");
  await reauthenticateWithPopup(user, new GoogleAuthProvider());
  return true;
}
