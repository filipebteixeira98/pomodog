import type { Action, Timer } from "#src/timer";

export type Screen =
  | "welcome"
  | "onboarding"
  | "privacy"
  | "focus"
  | "progress"
  | "settings"
  | "profile";
export type UsageEvent =
  | { name: "screen_view"; screen: Screen }
  | { name: "onboarding_complete" }
  | {
      name:
        | "pomodoro_start"
        | "pomodoro_pause"
        | "pomodoro_resume"
        | "pomodoro_complete"
        | "pomodoro_reset";
      mode: Timer["mode"];
      duration: number;
    };

/** Build a fresh allowlisted payload; arbitrary input never reaches the SDK. */
export function eventPayload(
  event: UsageEvent,
): Record<string, string | number> | null {
  if (event.name === "onboarding_complete") return {};
  if (event.name === "screen_view") {
    return [
      "welcome",
      "onboarding",
      "privacy",
      "focus",
      "progress",
      "settings",
      "profile",
    ].includes(event.screen)
      ? { screen_name: event.screen, screen_class: event.screen }
      : null;
  }
  if (
    ![
      "pomodoro_start",
      "pomodoro_pause",
      "pomodoro_resume",
      "pomodoro_complete",
      "pomodoro_reset",
    ].includes(event.name)
  )
    return null;
  if (
    !["focus", "break"].includes(event.mode) ||
    !Number.isFinite(event.duration) ||
    event.duration <= 0 ||
    event.duration > 7200
  )
    return null;
  return { session_mode: event.mode, duration_seconds: event.duration };
}

/** Completion changes mode, so use the previous session's mode and duration. */
export function timerEvent(
  before: Timer,
  after: Timer,
  action: Action,
): UsageEvent | null {
  if (before.status === "running" && after.status === "completed")
    return {
      name: "pomodoro_complete",
      mode: before.mode,
      duration: before.duration,
    };
  let name:
    "pomodoro_start" | "pomodoro_pause" | "pomodoro_resume" | "pomodoro_reset";
  if (
    action.type === "start" &&
    before.status !== "running" &&
    after.status === "running"
  )
    name = before.status === "paused" ? "pomodoro_resume" : "pomodoro_start";
  else if (
    action.type === "pause" &&
    before.status === "running" &&
    after.status === "paused"
  )
    name = "pomodoro_pause";
  else if (
    action.type === "reset" &&
    (before.status === "running" || before.status === "paused") &&
    after.status === "idle"
  )
    name = "pomodoro_reset";
  else return null;
  return { name, mode: before.mode, duration: before.duration };
}
