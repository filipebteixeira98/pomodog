import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";

import { localSession, type CustomerSession } from "#src/domain/customer";
import { flushAccount, prepareAccount } from "#src/firebase/accountData";
import { auth } from "#src/firebase/auth";
import { signInWithGoogle, signOutGoogle } from "#src/firebase/googleSignIn";

export function useAccount() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<CustomerSession>(localSession);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    let generation = 0;
    const unsubscribe = onAuthStateChanged(
      auth,
      (nextUser) => {
        const request = ++generation;
        if (!nextUser) {
          setUser(null);
          setSession(localSession);
          setLoading(false);
          return;
        }
        setLoading(true);
        void prepareAccount(nextUser)
          .then(() => {
            if (!active || request !== generation) return;
            setUser(nextUser);
            setSession({
              status: "authenticated",
              customer: {
                id: nextUser.uid,
                displayName: nextUser.displayName ?? "Sua conta",
                ...(nextUser.email ? { email: nextUser.email } : {}),
              },
            });
            setNotice("");
          })
          .catch(() => {
            if (!active || request !== generation) return;
            setUser(null);
            setSession(localSession);
            setNotice(
              "Não foi possível sincronizar sua conta. Tente novamente.",
            );
          })
          .finally(() => {
            if (active && request === generation) setLoading(false);
          });
      },
      () => {
        if (!active) return;
        setLoading(false);
        setNotice("Não foi possível verificar sua conta. Tente novamente.");
      },
    );
    return () => {
      active = false;
      generation++;
      unsubscribe();
    };
  }, []);

  async function login() {
    if (busy || loading) return;
    setBusy(true);
    setNotice("");
    let awaitingListener = false;
    try {
      if (auth.currentUser) {
        setLoading(true);
        await prepareAccount(auth.currentUser);
        setUser(auth.currentUser);
        setSession({
          status: "authenticated",
          customer: {
            id: auth.currentUser.uid,
            displayName: auth.currentUser.displayName ?? "Sua conta",
            ...(auth.currentUser.email
              ? { email: auth.currentUser.email }
              : {}),
          },
        });
      } else {
        const signedIn = await signInWithGoogle();
        if (signedIn) awaitingListener = true;
      }
    } catch {
      setNotice("Não foi possível entrar com Google. Tente novamente.");
    } finally {
      if (!awaitingListener) setLoading(false);
      setBusy(false);
    }
  }

  async function logout() {
    if (busy || loading || !auth.currentUser) return;
    setBusy(true);
    setNotice("");
    try {
      await flushAccount(auth.currentUser.uid);
      await signOutGoogle();
    } catch {
      setNotice("Não foi possível sair da conta. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  return { user, session, loading, busy, notice, login, logout };
}
