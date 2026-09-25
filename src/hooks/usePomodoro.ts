import { useEffect, useReducer, useRef, useState } from "react";
import { AppState } from "react-native";

import { defaultPreferences, type Preferences } from "../domain/preferences";
import { loadPrototype, savePrototype } from "../storage/prototype";
import { initialTimer, timerReducer, type Mode } from "../timer";

export function usePomodoro() {
  const [timer, dispatch] = useReducer(timerReducer, initialTimer);
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const queue = useRef(Promise.resolve());
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
        if (mounted) setStorageError(true);
      })
      .finally(() => {
        if (mounted) setReady(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const saved = {
      timer: latestTimer.current,
      preferences,
      onboardingComplete,
    };
    queue.current = queue.current
      .then(() => savePrototype(saved))
      .catch(() => setStorageError(true));
    // Persist transitions only; running sessions recover their remaining time from the deadline.
  }, [
    ready,
    preferences,
    onboardingComplete,
    timer.status,
    timer.deadline,
    timer.duration,
    timer.mode,
    timer.demo,
    timer.sessions,
  ]);

  useEffect(() => {
    if (!ready || timer.status !== "running") return;
    const tick = () => dispatch({ type: "tick", now: Date.now() });
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
    demo = false,
  ) {
    if (ready) dispatch({ type: "configure", mode, seconds, demo });
  }

  function updatePreferences(patch: Partial<Preferences>) {
    if (
      !ready ||
      (busy && (patch.focus !== undefined || patch.rest !== undefined))
    )
      return;
    setPreferences((current) => ({ ...current, ...patch }));
    if (patch.focus !== undefined && timer.mode === "focus")
      configure("focus", patch.focus * 60);
    if (patch.rest !== undefined && timer.mode === "break")
      configure("break", patch.rest * 60);
  }

  return {
    timer,
    preferences,
    onboardingComplete,
    completeOnboarding: () => setOnboardingComplete(true),
    ready,
    busy,
    storageError,
    configure,
    updatePreferences,
    toggle: () => {
      if (ready)
        dispatch({
          type: timer.status === "running" ? "pause" : "start",
          now: Date.now(),
        });
    },
    reset: () => dispatch({ type: "reset" }),
  };
}
