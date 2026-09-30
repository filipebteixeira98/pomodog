import { GoogleSignin } from "@react-native-google-signin/google-signin";
import {
  GoogleAuthProvider,
  signInWithCredential,
  signOut,
} from "firebase/auth";

import { auth } from "#src/firebase/auth";

GoogleSignin.configure({
  webClientId:
    "248701391721-q59aerblmh758oah25sqk5ha208usb7q.apps.googleusercontent.com",
});

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
