import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

import { auth } from "#src/firebase/auth";

export async function signInWithGoogle() {
  await signInWithPopup(auth, new GoogleAuthProvider());
  return true;
}

export async function signOutGoogle() {
  await signOut(auth);
}
