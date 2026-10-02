import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";

import { localSession, type CustomerSession } from "#src/domain/customer";
import { flushAccount, prepareAccount } from "#src/firebase/accountData";
import {
  accountDeletionBlocked,
  accountDeletionPending,
} from "#src/firebase/accountDeletionState";
import { auth } from "#src/firebase/auth";
import { deleteOwnAccount } from "#src/firebase/deleteOwnAccount";
import { signInWithGoogle, signOutGoogle } from "#src/firebase/googleSignIn";
import { reportError } from "#src/monitoring/sentry";

export function useAccount() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<CustomerSession>(localSession);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deletionPending, setDeletionPending] = useState(false);
  const operation = useRef(false);

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
          setDeletionPending(false);
          return;
        }
        setLoading(true);
        void (async () => {
          const pending = await accountDeletionPending(nextUser.uid);
          if (!pending) await prepareAccount(nextUser);
          return pending;
        })()
          .then((pending) => {
            if (!active || request !== generation) return;
            setUser(nextUser);
            setDeletionPending(pending);
            setSession({
              status: "authenticated",
              customer: {
                id: nextUser.uid,
                displayName: nextUser.displayName ?? "Sua conta",
                ...(nextUser.email ? { email: nextUser.email } : {}),
              },
            });
            setNotice(
              pending ? "A exclusão está pendente. Retome para concluir." : "",
            );
          })
          .catch((error: unknown) => {
            reportError(error, "account.prepare");
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
    if (operation.current || busy || loading) return;
    operation.current = true;
    setBusy(true);
    setNotice("");
    let awaitingListener = false;
    try {
      if (auth.currentUser) {
        setLoading(true);
        const pending = await accountDeletionPending(auth.currentUser.uid);
        if (!pending) await prepareAccount(auth.currentUser);
        setDeletionPending(pending);
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
    } catch (error) {
      reportError(error, "account.login");
      setNotice("Não foi possível entrar com Google. Tente novamente.");
    } finally {
      if (!awaitingListener) setLoading(false);
      setBusy(false);
      operation.current = false;
    }
  }

  async function logout() {
    if (operation.current || busy || loading || !auth.currentUser) return;
    operation.current = true;
    setBusy(true);
    setNotice("");
    try {
      await flushAccount(auth.currentUser.uid);
      await signOutGoogle();
    } catch (error) {
      reportError(error, "account.logout");
      setNotice("Não foi possível sair da conta. Tente novamente.");
    } finally {
      setBusy(false);
      operation.current = false;
    }
  }

  async function removeAccount() {
    const owner = auth.currentUser;
    if (
      operation.current ||
      loading ||
      !owner ||
      session.status !== "authenticated" ||
      session.customer.id !== owner.uid
    )
      return false;
    operation.current = true;
    setBusy(true);
    setDeleting(true);
    setNotice("");
    try {
      const removed = await deleteOwnAccount();
      setNotice(removed ? "" : "Exclusão cancelada.");
      return removed;
    } catch (error) {
      reportError(error, "account.delete");
      setDeletionPending(accountDeletionBlocked(owner.uid));
      const code =
        error && typeof error === "object" && "code" in error ? error.code : "";
      setNotice(
        code === "auth/user-mismatch"
          ? "Confirme com a mesma conta Google do seu perfil."
          : accountDeletionBlocked(owner.uid)
            ? "Não foi possível concluir a exclusão. Alguns dados podem ter sido removidos. Retome para concluir."
            : "Não foi possível excluir sua conta. Tente novamente.",
      );
      return false;
    } finally {
      setDeleting(false);
      setBusy(false);
      operation.current = false;
    }
  }

  return {
    user,
    session,
    loading,
    busy,
    notice,
    login,
    logout,
    removeAccount,
    deletionPending,
    accountLocked: deleting || deletionPending,
  };
}
