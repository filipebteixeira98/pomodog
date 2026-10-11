import type { SavedPrototype } from "#src/domain/savedPrototype.ts";
import { timerReducer, type Action, type Mode } from "#src/timer.ts";

export type SessionControl = {
  token: string;
  owner: string;
  kind: "pause" | "resume";
  mode: Mode;
  deadline: number;
  remaining: number;
  at: number;
};

export const sessionOwner = (uid?: string | null) =>
  uid ? `uid:${uid}` : "guest";

export function parseSessionControl(value: unknown): SessionControl | null {
  if (!value || typeof value !== "object") return null;
  const data = value as SessionControl;
  if (
    typeof data.token !== "string" ||
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(
      data.token,
    ) ||
    typeof data.owner !== "string" ||
    !data.owner.length ||
    data.owner.length > 132 ||
    data.owner.includes("/") ||
    (data.owner !== "guest" &&
      (!data.owner.startsWith("uid:") || data.owner.length <= 4)) ||
    (data.kind !== "pause" && data.kind !== "resume") ||
    (data.mode !== "focus" && data.mode !== "break") ||
    !Number.isFinite(data.at) ||
    data.at <= 0 ||
    !Number.isFinite(data.deadline) ||
    data.deadline < 0 ||
    !Number.isFinite(data.remaining) ||
    data.remaining <= 0 ||
    data.remaining > 7200 ||
    (data.kind === "pause" ? data.deadline <= 0 : data.deadline !== 0)
  )
    return null;
  return {
    token: data.token,
    owner: data.owner,
    kind: data.kind,
    mode: data.mode,
    deadline: data.deadline,
    remaining: data.remaining,
    at: data.at,
  };
}

export function applySessionControl(
  saved: SavedPrototype,
  control: SessionControl,
  now: number,
) {
  const before = saved.timer;
  if (
    !saved.preferences.sessionNotifications ||
    before.mode !== control.mode ||
    control.at > now + 1000
  )
    return null;
  if (control.kind === "pause") {
    if (
      before.status !== "running" ||
      before.deadline !== control.deadline ||
      control.at >= control.deadline
    )
      return null;
  } else if (
    before.status !== "paused" ||
    Math.abs(before.remaining - control.remaining) > 0.000001
  )
    return null;
  const action: Action = {
    type: control.kind === "pause" ? "pause" : "start",
    // Pause at the tap; resume when execution is ready, preserving all paused time.
    now: control.kind === "pause" ? control.at : now,
  };
  const timer = timerReducer(timerReducer(before, action), {
    type: "tick",
    now,
    nextDuration:
      (before.mode === "focus"
        ? saved.preferences.rest
        : saved.preferences.focus) * 60,
  });
  return { saved: { ...saved, timer }, action };
}

export type ControlBinding = {
  owner: string;
  read: () => SavedPrototype | null;
  blocked: () => boolean;
  apply: (action: Action, now: number) => void;
};

/** One queue for notification actions and hydration; UI handlers remain the timer owner. */
export function createSessionControls(
  adapter: {
    authorized: (owner: string) => Promise<boolean>;
    current: (control: SessionControl) => Promise<boolean>;
    load: (owner: string) => Promise<SavedPrototype | null>;
    save: (owner: string, saved: SavedPrototype) => Promise<void>;
    sync: (owner: string, saved: SavedPrototype) => Promise<void>;
  },
  now = Date.now,
) {
  let binding: ControlBinding | undefined;
  let queue: Promise<unknown> = Promise.resolve();
  function enqueue<T>(work: () => Promise<T>) {
    const result = queue.then(work);
    queue = result.catch(() => {});
    return result;
  }
  return {
    connect(next: ControlBinding) {
      binding = next;
      return () => {
        if (binding === next) binding = undefined;
      };
    },
    hydrate(
      load: () => Promise<SavedPrototype | null>,
      accept: (saved: SavedPrototype | null) => void,
    ) {
      return enqueue(async () => {
        accept(await load());
      });
    },
    run(raw: unknown) {
      return enqueue(async () => {
        const control = parseSessionControl(raw);
        if (!control || !(await adapter.authorized(control.owner)))
          return false;
        if (
          binding &&
          (binding.owner !== control.owner ||
            binding.blocked() ||
            !binding.read())
        )
          return false;
        const stored = binding ? null : await adapter.load(control.owner);
        if (!(await adapter.current(control))) return false;
        if (!(await adapter.authorized(control.owner))) return false;
        // Re-read after native/storage awaits: reset, erasure or account changes may have occurred.
        if (binding && (binding.owner !== control.owner || binding.blocked()))
          return false;
        const before = binding ? binding.read() : stored;
        if (!before) return false;
        const update = applySessionControl(before, control, now());
        if (!update) return false;
        const active = binding;
        active?.apply(update.action, now());
        const saved = active?.read() ?? update.saved;
        await adapter.save(control.owner, saved);
        if (!(await adapter.authorized(control.owner))) return true;
        if (binding && (binding.owner !== control.owner || binding.blocked()))
          return true;
        await adapter.sync(control.owner, binding?.read() ?? saved);
        return true;
      });
    },
  };
}
