import type { Mode, Timer } from "#src/timer.ts";

export const SESSION_NOTIFICATION_ID = "pomodog-session-end";
export type NotificationAdapter = {
  permitted: () => Promise<boolean>;
  cancel: () => Promise<void>;
  schedule: (deadline: number, mode: Mode) => Promise<void>;
  pending: () => Promise<{ deadline: number; mode: Mode } | null>;
  countdown?: {
    show: (deadline: number, mode: Mode, owner?: string) => Promise<void>;
    showPaused?: (
      remaining: number,
      mode: Mode,
      owner?: string,
    ) => Promise<void>;
    isCurrent?: (token: string, owner: string) => Promise<boolean>;
    hide: () => Promise<void>;
  };
};

/** Serialize native operations so a late schedule cannot survive a pause/reset. */
export function createSessionScheduler(
  adapter: NotificationAdapter,
  now = Date.now,
) {
  let queue: Promise<unknown> = Promise.resolve();
  async function cancel() {
    // Attempt both cleanups and await both before the next serialized transition.
    const results = await Promise.allSettled([
      adapter.countdown?.hide(),
      adapter.cancel(),
    ]);
    for (const result of results)
      if (result.status === "rejected") throw result.reason;
  }
  return {
    sync(
      timer: Pick<Timer, "status" | "deadline" | "mode"> &
        Partial<Pick<Timer, "remaining">>,
      enabled: boolean,
      owner = "guest",
    ) {
      const work = queue.then(async () => {
        if (!enabled) {
          await cancel();
          return;
        }
        if (!(await adapter.permitted())) {
          await cancel();
          throw new Error("notification-permission");
        }
        // Allow the OS to deliver an already scheduled notification at completion.
        if (
          timer.status === "completed" ||
          (timer.status === "running" &&
            timer.deadline !== null &&
            timer.deadline <= now())
        ) {
          await adapter.countdown?.hide();
          return;
        }
        if (
          timer.status === "running" &&
          timer.deadline !== null &&
          timer.deadline > now()
        ) {
          const existing = await adapter.pending();
          if (
            existing !== null &&
            existing.deadline === timer.deadline &&
            existing.mode === timer.mode
          ) {
            await adapter.countdown?.show(timer.deadline, timer.mode, owner);
            return;
          }
        }
        if (
          timer.status === "paused" &&
          typeof timer.remaining === "number" &&
          timer.remaining > 0 &&
          adapter.countdown?.showPaused
        ) {
          await adapter.cancel();
          await adapter.countdown.showPaused(
            timer.remaining,
            timer.mode,
            owner,
          );
          return;
        }
        await cancel();
        if (
          timer.status === "running" &&
          timer.deadline !== null &&
          timer.deadline > now()
        ) {
          await adapter.schedule(timer.deadline, timer.mode);
          await adapter.countdown?.show(timer.deadline, timer.mode, owner);
        }
      });
      queue = work.catch(() => {});
      return work;
    },
  };
}
