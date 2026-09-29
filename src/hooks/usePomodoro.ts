import { useEffect, useReducer, useRef, useState } from "react";
import { AppState } from "react-native";

import { choosePetResponse, type PetCare } from "#src/domain/petCare";
import { defaultPreferences, type Preferences } from "#src/domain/preferences";
import { notificationErrorMessage } from "#src/notifications/diagnostics";
import {
  notificationsSupported,
  requestSessionPermission,
  sessionNotifications,
} from "#src/notifications/sessionNotifications";
import { clearExportFile } from "#src/storage/exportFile";
import {
  erasePrototype,
  loadPrototype,
  savePrototype,
} from "#src/storage/prototype";
import { initialTimer, timerReducer, type Mode } from "#src/timer";

export function usePomodoro() {
  const [timer, dispatch] = useReducer(timerReducer, initialTimer);
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [petCare, setPetCare] = useState<PetCare>();
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [storageBlocked, setStorageBlocked] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [notificationNotice, setNotificationNotice] = useState("");
  const [notificationBusy, setNotificationBusy] = useState(false);
  const notificationRequest = useRef(0);
  const permissionLock = useRef(false);
  const operationLock = useRef(false);
  const latestTimer = useRef(timer);
  latestTimer.current = timer;
  const busy = timer.status === "running" || timer.status === "paused";

  useEffect(() => {
    let mounted = true;
    loadPrototype()
      .then((saved) => {
        if (!mounted || !saved) return;
        dispatch({ type: "restore", value: saved.timer, now: Date.now() });
        setPreferences(saved.preferences);
        setPetCare(saved.petCare);
        setOnboardingComplete(saved.onboardingComplete);
      })
      .catch(() => {
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
    if (!ready || storageBlocked || operationLock.current) return;
    const saved = {
      timer: latestTimer.current,
      preferences,
      onboardingComplete,
      petCare,
    };
    savePrototype(saved).catch(() => setStorageError(true));
    // Persist transitions only; running sessions recover their remaining time from the deadline.
  }, [
    ready,
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
      if (!operationLock.current) dispatch({ type: "tick", now: Date.now() });
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
            !storageBlocked,
        )
        .then(() => {
          if (active) setNotificationNotice("");
        })
        .catch((error: unknown) => {
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
    storageBlocked,
    preferences.sessionNotifications,
    timer.status,
    timer.deadline,
    timer.mode,
  ]);

  async function setSessionNotifications(enabled: boolean) {
    if (
      !ready ||
      operationLock.current ||
      permissionLock.current ||
      !notificationsSupported
    )
      return;
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
        return;
      }
      if (request !== notificationRequest.current || operationLock.current)
        return;
      setNotificationNotice("");
    } catch (error) {
      if (request === notificationRequest.current) {
        setPreferences((current) => ({
          ...current,
          sessionNotifications: false,
        }));
        setNotificationNotice(notificationErrorMessage(error));
      }
    } finally {
      permissionLock.current = false;
      setNotificationBusy(false);
    }
  }

  function configure(
    mode: Mode,
    seconds = (mode === "focus" ? preferences.focus : preferences.rest) * 60,
  ) {
    if (ready && !operationLock.current)
      dispatch({ type: "configure", mode, seconds });
  }

  function updatePreferences(patch: Partial<Preferences>) {
    if (
      !ready ||
      operationLock.current ||
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
    if (operationLock.current) return;
    operationLock.current = true;
    setIsErasing(true);
    notificationRequest.current++;
    try {
      await sessionNotifications.sync(latestTimer.current, false);
      await clearExportFile();
      await erasePrototype();
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
    notificationNotice,
    notificationBusy,
    notificationsSupported,
    setSessionNotifications,
    feedPet: () => {
      if (!ready || operationLock.current) return null;
      const response = choosePetResponse(latestTimer.current, petCare);
      setPetCare(response.care);
      return response.message;
    },
    storageBlocked,
    isErasing,
    eraseData,
    preferences,
    onboardingComplete,
    completeOnboarding: () => setOnboardingComplete(true),
    ready,
    busy,
    storageError,
    configure,
    updatePreferences,
    toggle: () => {
      if (ready && !operationLock.current)
        dispatch({
          type: timer.status === "running" ? "pause" : "start",
          now: Date.now(),
        });
    },
    reset: () => {
      if (!operationLock.current) dispatch({ type: "reset" });
    },
  };
}
