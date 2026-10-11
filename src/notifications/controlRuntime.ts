import { accountDeletionPending } from "#src/firebase/accountDeletionState";
import { auth } from "#src/firebase/auth";
import { countdown } from "#src/notifications/countdown";
import {
  createSessionControls,
  sessionOwner,
} from "#src/notifications/sessionControls";
import { sessionNotifications } from "#src/notifications/sessionNotifications";
import {
  accountStore,
  loadPrototype,
  savePrototype,
} from "#src/storage/prototype";

export const sessionControls = createSessionControls({
  authorized: async (owner) => {
    await auth.authStateReady();
    const uid = auth.currentUser?.uid;
    if (sessionOwner(uid) !== owner) return false;
    return !uid || !(await accountDeletionPending(uid));
  },
  current: (control) =>
    countdown?.isCurrent?.(control.token, control.owner) ??
    Promise.resolve(false),
  load: (owner) =>
    owner === "guest" ? loadPrototype() : accountStore(owner.slice(4)).load(),
  save: async (owner, saved) => {
    await (owner === "guest"
      ? savePrototype(saved)
      : accountStore(owner.slice(4)).save(saved));
  },
  sync: (owner, saved) =>
    sessionNotifications.sync(
      saved.timer,
      saved.preferences.sessionNotifications,
      owner,
    ),
});
