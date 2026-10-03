import { useEffect, useReducer, useRef, useState } from "react";
import { AppState } from "react-native";
import type { User } from "firebase/auth";

import { timerEvent } from "#src/analytics/events";
import { setAnalyticsEnabled, trackUsage } from "#src/analytics/service";
import { choosePetResponse, type PetCare } from "#src/domain/petCare";
import { defaultPreferences, type Preferences } from "#src/domain/preferences";
import { AccountSaveError, saveAccount } from "#src/firebase/accountData";
import { reportError, setReportingEnabled } from "#src/monitoring/sentry";
import { notificationErrorMessage } from "#src/notifications/diagnostics";
import {
  notificationsSupported,
  requestSessionPermission,
  sessionNotifications,
} from "#src/notifications/sessionNotifications";
import { clearLegacyExport } from "#src/storage/legacyExportCleanup";
import {
  accountStore,
  erasePrototype,
  loadPrototype,
  savePrototype,
} from "#src/storage/prototype";
import { initialTimer, timerReducer, type Action, type Mode } from "#src/timer";

export function usePomodoro(user: User | null = null, accountLocked = false) {
  const account = useRef(user ? accountStore(user.uid) : null).current;
  const [timer, reducerDispatch] = useReducer(timerReducer, initialTimer);
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [petCare, setPetCare] = useState<PetCare>();
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [syncError, setSyncError] = useState(false);
  const [storageBlocked, setStorageBlocked] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [notificationNotice, setNotificationNotice] = useState("");
  const [notificationBusy, setNotificationBusy] = useState(false);
  const notificationRequest = useRef(0);
  const permissionLock = useRef(false);
  const operationLock = useRef(false);
  const accountLock = useRef(accountLocked);
  accountLock.current = accountLocked;
  const locked = () => operationLock.current || accountLock.current;
  const latestTimer = useRef(timer);
  latestTimer.current = timer;
  const busy = timer.status === "running" || timer.status === "paused";

  function dispatch(action: Action) {
    const before =
      action.type === "restore" ? action.value : latestTimer.current;
    const after = timerReducer(latestTimer.current, action);
    latestTimer.current = after;
    reducerDispatch(action);
    const event = timerEvent(before, after, action);
    if (event) trackUsage(event);
  }

  useEffect(() => {
    let mounted = true;
    (account ? account.load() : loadPrototype())
      .then((saved) => {
        if (!mounted || !saved) return;
        dispatch({
          type: "restore",
          value: saved.timer,
          now: Date.now(),
          nextDuration:
            saved.timer.mode === "focus"
              ? saved.preferences.rest * 60
              : saved.preferences.focus * 60,
        });
        setPreferences(saved.preferences);
        setPetCare(saved.petCare);
        setOnboardingComplete(saved.onboardingComplete);
      })
      .catch((error: unknown) => {
        reportError(error, "storage.load");
        if (mounted) {
          setStorageError(true);
          setStorageBlocked(true);
        }
      })
      .finally(() => {
        if (mounted) setReady(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!ready || storageBlocked || locked()) return;
    const saved = {
      timer: latestTimer.current,
      preferences,
      onboardingComplete,
      petCare,
    };
    if (account && user) {
      saveAccount(user, account, saved)
        .then(() => setSyncError(false))
        .catch((error: unknown) => {
          reportError(error, "account.save");
          if (error instanceof AccountSaveError && error.stage === "local")
            setStorageError(true);
          else setSyncError(true);
        });
    } else {
      savePrototype(saved).catch((error: unknown) => {
        reportError(error, "storage.save");
        setStorageError(true);
      });
    }
    // Persist transitions only; running sessions recover their remaining time from the deadline.
  }, [
    ready,
    accountLocked,
    storageBlocked,
    preferences,
    onboardingComplete,
    petCare,
    timer.status,
    timer.deadline,
    timer.duration,
    timer.mode,
    timer.sessions,
  ]);

  useEffect(() => {
    if (!ready || timer.status !== "running") return;
    const tick = () => {
      if (!locked())
        dispatch({
          type: "tick",
          now: Date.now(),
          nextDuration:
            timer.mode === "focus"
              ? preferences.rest * 60
              : preferences.focus * 60,
        });
    };
    const interval = setInterval(tick, 250);
    const listener = AppState.addEventListener("change", (state) => {
      if (state === "active") tick();
    });
    return () => {
      clearInterval(interval);
      listener.remove();
    };
  }, [ready, timer.status]);

  useEffect(() => {
    if (!ready || isErasing) return;
    let active = true;
    const sync = () =>
      sessionNotifications
        .sync(
          { status: timer.status, deadline: timer.deadline, mode: timer.mode },
          notificationsSupported &&
            preferences.sessionNotifications &&
            !storageBlocked &&
            !accountLocked,
        )
        .then(() => {
          if (active) setNotificationNotice("");
        })
        .catch((error: unknown) => {
          reportError(error, "notifications.sync");
          if (active) setNotificationNotice(notificationErrorMessage(error));
        });
    void sync();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void sync();
    });
    return () => {
      active = false;
      subscription.remove();
    };
  }, [
    ready,
    isErasing,
    accountLocked,
    storageBlocked,
    preferences.sessionNotifications,
    timer.status,
    timer.deadline,
    timer.mode,
  ]);

  async function setSessionNotifications(enabled: boolean) {
    if (!ready || locked() || permissionLock.current || !notificationsSupported)
      return false;
    permissionLock.current = true;
    setNotificationBusy(true);
    setPreferences((current) => ({
      ...current,
      sessionNotifications: enabled,
    }));
    const request = ++notificationRequest.current;
    try {
      if (enabled && !(await requestSessionPermission())) {
        if (request === notificationRequest.current) {
          setPreferences((current) => ({
            ...current,
            sessionNotifications: false,
          }));
          setNotificationNotice(
            "Permita notificações nos ajustes do dispositivo para receber o aviso.",
          );
        }
        return false;
      }
      if (request !== notificationRequest.current || locked()) return false;
      setNotificationNotice("");
      return true;
    } catch (error) {
      reportError(error, "notifications.permission");
      if (request === notificationRequest.current) {
        setPreferences((current) => ({
          ...current,
          sessionNotifications: false,
        }));
        setNotificationNotice(notificationErrorMessage(error));
      }
      return false;
    } finally {
      permissionLock.current = false;
      setNotificationBusy(false);
    }
  }

  function configure(
    mode: Mode,
    seconds = (mode === "focus" ? preferences.focus : preferences.rest) * 60,
  ) {
    if (ready && !locked()) dispatch({ type: "configure", mode, seconds });
  }

  function updatePreferences(patch: Partial<Preferences>) {
    if (
      !ready ||
      locked() ||
      (busy && (patch.focus !== undefined || patch.rest !== undefined))
    )
      return;
    setPreferences((current) => ({ ...current, ...patch }));
    if (patch.focus !== undefined && timer.mode === "focus")
      configure("focus", patch.focus * 60);
    if (patch.rest !== undefined && timer.mode === "break")
      configure("break", patch.rest * 60);
  }

  async function eraseData() {
    if (locked()) return;
    operationLock.current = true;
    setIsErasing(true);
    notificationRequest.current++;
    try {
      await sessionNotifications.sync(latestTimer.current, false);
      await setReportingEnabled(false);
      await setAnalyticsEnabled(false);
      await clearLegacyExport();
      await (account ? account.erase() : erasePrototype());
      dispatch({
        type: "restore",
        value: { ...initialTimer, sessions: [] },
        now: Date.now(),
      });
      setPreferences({ ...defaultPreferences });
      setOnboardingComplete(false);
      setPetCare(undefined);
      setStorageError(false);
      setStorageBlocked(false);
    } finally {
      operationLock.current = false;
      setIsErasing(false);
    }
  }

  return {
    timer,
    syncError,
    notificationNotice,
    notificationBusy,
    notificationsSupported,
    setSessionNotifications,
    feedPet: () => {
      if (!ready || locked()) return null;
      const response = choosePetResponse(latestTimer.current, petCare);
      setPetCare(response.care);
      return response.message;
    },
    storageBlocked,
    isErasing,
    eraseData,
    preferences,
    onboardingComplete,
    completeOnboarding: () => {
      if (!locked()) {
        if (!onboardingComplete) trackUsage({ name: "onboarding_complete" });
        setOnboardingComplete(true);
      }
    },
    ready: ready && !accountLocked,
    busy: busy || accountLocked,
    storageError,
    configure,
    updatePreferences,
    toggle: () => {
      if (ready && !locked())
        dispatch({
          type: timer.status === "running" ? "pause" : "start",
          now: Date.now(),
        });
    },
    reset: () => {
      if (!locked()) dispatch({ type: "reset" });
    },
  };
}
