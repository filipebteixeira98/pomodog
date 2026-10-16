import {
  GoogleAuthProvider,
  reauthenticateWithCredential,
  signInWithCredential,
  signOut,
} from "firebase/auth";

import { auth } from "#src/firebase/auth";
import { GoogleSignin } from "#src/google/client";

export async function signInWithGoogle() {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const result = await GoogleSignin.signIn();
  if (result.type === "cancelled") return false;
  const token = result.data.idToken;
  if (!token) throw new Error("Google did not return an ID token");
  await signInWithCredential(auth, GoogleAuthProvider.credential(token));
  return true;
}

export async function signOutGoogle() {
  await signOut(auth);
  await GoogleSignin.signOut();
}

export async function reauthenticateWithGoogle() {
  const user = auth.currentUser;
  if (!user) throw new Error("account-deletion-unauthenticated");
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const result = await GoogleSignin.signIn();
  if (result.type === "cancelled") return false;
  const token = result.data.idToken;
  if (!token) throw new Error("Google did not return an ID token");
  await reauthenticateWithCredential(
    user,
    GoogleAuthProvider.credential(token),
  );
  return true;
}
