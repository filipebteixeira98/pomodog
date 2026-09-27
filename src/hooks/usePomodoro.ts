import { useEffect, useReducer, useRef, useState } from "react";
import { AppState } from "react-native";

import { defaultPreferences, type Preferences } from "#src/domain/preferences";
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
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [storageBlocked, setStorageBlocked] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
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
    };
    savePrototype(saved).catch(() => setStorageError(true));
    // Persist transitions only; running sessions recover their remaining time from the deadline.
  }, [
    ready,
    storageBlocked,
    preferences,
    onboardingComplete,
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
    try {
      await clearExportFile();
      await erasePrototype();
      dispatch({
        type: "restore",
        value: { ...initialTimer, sessions: [] },
        now: Date.now(),
      });
      setPreferences({ ...defaultPreferences });
      setOnboardingComplete(false);
      setStorageError(false);
      setStorageBlocked(false);
    } finally {
      operationLock.current = false;
      setIsErasing(false);
    }
  }

  function snapshot() {
    if (!ready || storageBlocked || operationLock.current)
      throw new Error("Local data unavailable");
    return { timer: latestTimer.current, preferences, onboardingComplete };
  }

  return {
    timer,
    storageBlocked,
    isErasing,
    eraseData,
    snapshot,
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
